import { parse as parseJsonc } from "jsr:@std/jsonc@1.0.2/parse";
import { extname } from "jsr:@std/path@1.0.9/extname";
import { resolve } from "jsr:@std/path@1.0.9/resolve";
import { ensure, is } from "jsr:@core/unknownutil@4.3.0";
import { type Dependency } from "../type.ts";

export class ImportMapExpander {
  #importMap: Map<string, string>;

  constructor(pathToImportMap: string) {
    const path = resolve(pathToImportMap);
    const config = ensure(
      parseImportMap(path),
      is.ObjectOf({
        imports: is.RecordOf(is.String),
      }),
    );
    this.#importMap = new Map(Object.entries(config.imports));
  }

  expand(dependency: Dependency): void {
    const specifier = unquote(dependency.specifier);
    const replaceTo = Array.from(this.#importMap.entries())
      .filter(([k]) => specifier.startsWith(k))
      .reduce(
        (acc, cur) =>
          cur[0].length > acc.k.length ? { k: cur[0], v: cur[1] } : acc,
        { k: "", v: "" },
      );

    if (replaceTo.k === "") {
      return;
    }

    const newSpecifier = `"${specifier.replace(replaceTo.k, replaceTo.v)}"`;

    dependency.statement.replaceWithText(newSpecifier);
  }
}

function parseImportMap(pathToImportMap: string): unknown {
  const ext = extname(pathToImportMap);
  switch (ext) {
    case ".json": {
      return JSON.parse(Deno.readTextFileSync(pathToImportMap));
    }
    case ".jsonc": {
      return parseJsonc(Deno.readTextFileSync(pathToImportMap));
    }
    default: {
      throw new Error(`Unsupported file extension: ${ext}`);
    }
  }
}

function unquote(s: string): string {
  return s.replaceAll(/^["']|["']$/g, "");
}
