import {CodeLensProvider, TextDocument, CodeLens, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration} from '../models/AppConfiguration';
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