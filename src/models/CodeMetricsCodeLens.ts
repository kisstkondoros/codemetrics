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

  public toString(): string {
    let allRelevant: CodeMetricsCodeLens[] = [this];
    allRelevant = allRelevant.concat(this.children)

    let complexitySum: number = allRelevant.map(item => item.complexity).reduce((item1, item2) => item1 + item2);
    let instruction: string = "";
    if (complexitySum > 25) {
      instruction = "Bloody hell...";
    } else if (complexitySum > 10) {
      instruction = "You must be kidding";
    } else if (complexitySum > 5) {
      instruction = "It's time to do something...";
    } else if (complexitySum > 0) {
      instruction = "Everything is cool!";
    }
    return "Complexity is " + complexitySum + " " + instruction;
  }
}