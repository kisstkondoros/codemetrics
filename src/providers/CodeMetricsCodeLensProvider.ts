import {CodeLensProvider, TextDocument, CodeLens, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {CodeMetricsParser} from '../common/CodeMetricsParser';

export class CodeMetricsCodeLensProvider implements CodeLensProvider {

  private appConfig: any;

  constructor(appConfig) {
    this.appConfig = appConfig;
  }

  get selector() {
    return {
      language: 'typescript',
      scheme: 'file'
    }
  };

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    return CodeMetricsParser.getMetrics(document, token);
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