import {CodeLens, Range} from 'vscode';

export class CodeMetricsCodeLens extends CodeLens {
  line: number;
  column: number;
  complexity: number;
  visible:boolean;

  constructor(idRange: Range, line: number, column: number, complexity: number, visible?:boolean) {
    super(idRange);
    this.line = line;
    this.column = column;
    this.complexity = complexity;
    this.visible = !!visible;
  }
}