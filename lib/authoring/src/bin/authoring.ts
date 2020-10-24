#!/usr/bin/env node

import { program } from "commander";
import { RollupAction } from "../rollup.action";

program
  .command("rollup <source> <destination>")
  .description("Rollup the code")
  .action(async (source, destination) => {
    const action = new RollupAction(source, destination);
    await action.run();
  });

program.parse(process.argv);
