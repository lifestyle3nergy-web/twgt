import { describe, it, expect } from 'vitest';

import {
  CognitiveCycleError,
  CognitiveCycleService,
  CognitivePhase,
  EchoInterpreter,
  NoopResponder,
  PassthroughObserver,
  type CycleInput,
  type CycleLogger,
  type Interpreter,
  type Observation,
  type Observer,
  type Responder,
  type Understanding,
} from '@services/cognitive';

function defaultCycle(): CognitiveCycleService<string, string, string> {
  return new CognitiveCycleService<string, string, string>({
    observer: new PassthroughObserver<string>(),
    interpreter: new EchoInterpreter<string>(),
    responder: new NoopResponder<string>(),
  });
}

class RecordingLogger implements CycleLogger {
  public readonly debugs: string[] = [];
  public readonly infos: string[] = [];
  public readonly errors: Array<{ message: string; error?: unknown }> = [];

  public debug(message: string): void {
    this.debugs.push(message);
  }

  public info(message: string): void {
    this.infos.push(message);
  }

  public error(message: string, error?: unknown): void {
    this.errors.push({ message, error });
  }
}

describe('CognitiveCycleService', () => {
  it('runs Observe -> Understand -> Respond over the input signals', async () => {
    const result = await defaultCycle().run({
      signals: ['a', 'b'],
      metadata: { source: 'test' },
    });

    expect(result.observation.signals).toEqual(['a', 'b']);
    expect(result.observation.metadata).toEqual({ source: 'test' });
    expect(result.understanding.insights).toEqual(['a', 'b']);
    expect(result.understanding.confidence).toBe(1);
    expect(result.response.actions).toEqual(['a', 'b']);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(Date.parse(result.startedAt)).toBeLessThanOrEqual(Date.parse(result.completedAt));
  });

  it('reports zero confidence when there are no signals', async () => {
    const result = await defaultCycle().run({ signals: [] });

    expect(result.understanding.confidence).toBe(0);
    expect(result.response.actions).toEqual([]);
  });

  it('does not leak mutations back into the caller input', async () => {
    const input: CycleInput<string> = { signals: ['a'], metadata: { k: 'v' } };

    const result = await defaultCycle().run(input);

    expect(result.observation.signals).not.toBe(input.signals);
    expect(result.observation.metadata).not.toBe(input.metadata);
  });

  it('supports asynchronous phase collaborators', async () => {
    const observer: Observer<number> = {
      async observe(input: CycleInput<number>): Promise<Observation<number>> {
        return {
          signals: input.signals.map((value) => value * 2),
          metadata: {},
          observedAt: new Date().toISOString(),
        };
      },
    };
    const interpreter: Interpreter<number, number> = {
      async understand(observation: Observation<number>): Promise<Understanding<number>> {
        const total = observation.signals.reduce((sum, value) => sum + value, 0);
        return { insights: [total], confidence: 1, reasonedAt: new Date().toISOString() };
      },
    };
    const responder: Responder<number, string> = {
      async respond(understanding: Understanding<number>) {
        return {
          actions: understanding.insights.map((value) => `emit:${value}`),
          respondedAt: new Date().toISOString(),
        };
      },
    };

    const result = await new CognitiveCycleService<number, number, string>({
      observer,
      interpreter,
      responder,
    }).run({ signals: [1, 2, 3] });

    expect(result.response.actions).toEqual(['emit:12']);
  });

  it('wraps an OBSERVE failure and preserves the cause', async () => {
    const boom = new Error('sensor offline');
    const cycle = new CognitiveCycleService({
      observer: {
        observe(): never {
          throw boom;
        },
      },
      interpreter: new EchoInterpreter(),
      responder: new NoopResponder(),
    });

    await expect(cycle.run({ signals: [] })).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(CognitiveCycleError);
      expect((error as CognitiveCycleError).phase).toBe(CognitivePhase.OBSERVE);
      expect((error as CognitiveCycleError).cause).toBe(boom);
      return true;
    });
  });

  it('wraps an UNDERSTAND failure with the correct phase', async () => {
    const cycle = new CognitiveCycleService({
      observer: new PassthroughObserver(),
      interpreter: {
        understand(): never {
          throw new Error('cannot reason');
        },
      },
      responder: new NoopResponder(),
    });

    await expect(cycle.run({ signals: ['x'] })).rejects.toSatisfy((error: unknown) => {
      expect((error as CognitiveCycleError).phase).toBe(CognitivePhase.UNDERSTAND);
      return true;
    });
  });

  it('wraps a RESPOND failure and logs it instead of swallowing', async () => {
    const logger = new RecordingLogger();
    const cycle = new CognitiveCycleService({
      observer: new PassthroughObserver(),
      interpreter: new EchoInterpreter(),
      responder: {
        respond(): Promise<never> {
          return Promise.reject(new Error('actuator jammed'));
        },
      },
      logger,
    });

    await expect(cycle.run({ signals: ['x'] })).rejects.toBeInstanceOf(CognitiveCycleError);

    expect(logger.errors).toHaveLength(1);
    expect(logger.errors[0].error).toBeInstanceOf(CognitiveCycleError);
    expect(logger.infos).toHaveLength(0);
  });

  it('emits lifecycle logs on a successful cycle', async () => {
    const logger = new RecordingLogger();
    const cycle = new CognitiveCycleService<string, string, string>({
      observer: new PassthroughObserver<string>(),
      interpreter: new EchoInterpreter<string>(),
      responder: new NoopResponder<string>(),
      logger,
    });

    await cycle.run({ signals: ['only'] });

    expect(logger.debugs).toHaveLength(1);
    expect(logger.infos).toHaveLength(1);
    expect(logger.errors).toHaveLength(0);
  });
});
