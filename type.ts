import type { StringLiteral } from "npm:ts-morph@27.0.2";

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
