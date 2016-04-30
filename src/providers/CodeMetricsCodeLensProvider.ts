import {CodeLensProvider, TextDocument, CodeLens, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration} from '../models/AppConfiguration';
import {CodeMetricsParser} from '../common/CodeMetricsParser';

export class CodeMetricsCodeLensProvider implements CodeLensProvider {

  private appConfig: AppConfiguration;

  constructor(appConfig:AppConfiguration) {
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
        title: (<CodeMetricsCodeLens>codeLens).toString(),
        command: undefined,
        arguments: undefined
      };
      return codeLens;
    }
    return null;
  }
}