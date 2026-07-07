import { Bootstrap } from "@core/Bootstrap";

async function main(): Promise<void> {
  try {
    const bootstrap = new Bootstrap();
    await bootstrap.start();
  } catch (error) {
    console.error("Application failed to start.", error);
    process.exit(1);
  }
}

void main();
