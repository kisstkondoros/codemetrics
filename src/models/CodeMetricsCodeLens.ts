import {CodeLens, Range} from 'vscode';
import {AppConfiguration, CodeMetricsConfiguration} from '../models/AppConfiguration';

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

  public toString(appConfig:AppConfiguration): string {
    let allRelevant: CodeMetricsCodeLens[] = [this];
    allRelevant = allRelevant.concat(this.children)

    let complexitySum: number = allRelevant.map(item => item.complexity).reduce((item1, item2) => item1 + item2);
    let instruction: string = '';
    let settings: CodeMetricsConfiguration = appConfig.codeMetricsSettings;
    if (complexitySum > settings.ComplexityLevelExtreme) {
      instruction = settings.ComplexityLevelExtremeDescription;
    } else if (complexitySum > settings.ComplexityLevelHigh) {
      instruction = settings.ComplexityLevelHighDescription;
    } else if (complexitySum > settings.ComplexityLevelNormal) {
      instruction = settings.ComplexityLevelNormalDescription;
    } else if (complexitySum > settings.ComplexityLevelLow) {
      instruction = settings.ComplexityLevelLowDescription;
    }
    let template = (settings.ComplexityTemplate + '');
    if (!settings.ComplexityTemplate || template.trim().length == 0) {
      template = 'Complexity is {0} {1}';
    }

    return template.replace('{0}', complexitySum+'').replace('{1}', instruction)
  }

  public getExplanation(appConfig:AppConfiguration): string {
    let allRelevant: CodeMetricsCodeLens[] = [this];
    allRelevant = allRelevant.concat(this.children)

    return allRelevant.map(item => "+"+item.complexity + " for " + item.description + " in Ln " + item.line + ", Col "+ item.column + "\n").reduce((item1, item2) => item1 + item2);
  }
}