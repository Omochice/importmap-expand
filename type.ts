import type { StringLiteral } from "npm:ts-morph@24.0.0";

export type Dependency = {
  specifier: string;
  statement: StringLiteral;
  start: {
    line: number;
    character: number;
  };
  end: {
    line: number;
    character: number;
  };
};
