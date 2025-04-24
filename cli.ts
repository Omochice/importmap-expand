import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { resolve, toFileUrl } from "jsr:@std/path@1.0.9";

import { collectDirectDependencies } from "./collect.ts";

import { ImportMapExpander } from "./replacer/importMap.ts";

const command = new Command()
  .name("importmap-expand")
  .description(
    "The tiny tool to expand importmap shortcut",
  )
  .arguments("<...filenames:string>")
  .option("-o, --option <deno.jsonc>", "Path to deno.jsonc", {
    required: true,
  })
  .option("--dry-run", "dry run mode. Result show in stdout", {
    default: false,
  })
  .action((options, ...args) => {
    const r = new ImportMapExpander(options.option);
    for (const filename of args.map((a) => toFileUrl(resolve(a)))) {
      console.error(`Processing ${filename.pathname}...`);
      const replaced = process(filename, r);
      if (options.dryRun) {
        console.log(replaced);
      } else {
        Deno.writeTextFileSync(filename, replaced);
      }
    }
  });

/**
 * Process the given file
 *
 * @param filename The filename
 * @returns The replaced file content
 */
function process(
  filename: URL,
  replacer: ImportMapExpander,
): string {
  const deps = collectDirectDependencies(filename.pathname);
  for (const dep of deps) {
    replacer.expand(dep);
  }

  return deps.at(0)?.statement.getSourceFile().getText() ??
    Deno.readTextFileSync(filename);
}

if (import.meta.main) {
  await command
    .parse(Deno.args);
}
