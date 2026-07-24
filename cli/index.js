const update = require("./commands/update");

program
  .command("update")
  .description("Update dependencies and apply security fixes")
  .action(update);
