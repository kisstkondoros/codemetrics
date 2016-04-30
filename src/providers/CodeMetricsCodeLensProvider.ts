import {CodeLensProvider, TextDocument, CodeLens, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration, CodeMetricsConfiguration} from '../models/AppConfiguration';
import {CodeMetricsParser} from '../common/CodeMetricsParser';

export class CodeMetricsCodeLensProvider implements CodeLensProvider {

  private appConfig: AppConfiguration;

  constructor(appConfig: AppConfiguration) {
    this.appConfig = appConfig;
  }

  get selector() {
    return {
      language: 'typescript',
      scheme: 'file'
    }
  };

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    return CodeMetricsParser.getMetrics(this.appConfig, document, token);
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens | Thenable<CodeLens> {
    if (codeLens instanceof CodeMetricsCodeLens) {
      codeLens.command = {
        title: this.getDescriptonForCodeLens(codeLens),
        command: undefined,
        arguments: undefined
      };
      return codeLens;
    }
    return null;
  }

  public getDescriptonForCodeLens(codelens: CodeMetricsCodeLens): string {
    let allRelevant: CodeMetricsCodeLens[] = [codelens];
    allRelevant = allRelevant.concat(codelens.children)

    let complexitySum: number = allRelevant.map(item => item.complexity).reduce((item1, item2) => item1 + item2);
    let instruction: string = '';
    let settings: CodeMetricsConfiguration = this.appConfig.codeMetricsSettings;
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
}