import {CodeLens, Range} from 'vscode';

export class CodeMetricsCodeLens extends CodeLens {
  line: number;
  column: number;
  complexity: number;
  visible: boolean;
  children: CodeMetricsCodeLens[] = [];
  description: string;

  constructor(idRange: Range, line: number, column: number, complexity: number, description: string, visible?: boolean) {
    super(idRange);
    this.line = line;
    this.column = column;
    this.complexity = complexity;
    this.visible = !!visible;
    this.description = description;
  }
}