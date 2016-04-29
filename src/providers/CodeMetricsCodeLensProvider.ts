import {CodeLensProvider, TextDocument, CodeLens, CancellationToken} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {CodeMetricsParser} from '../common/CodeMetricsParser';

export class CodeMetricsCodeLensProvider implements CodeLensProvider{

  private appConfig:any;

  constructor(appConfig) {
    this.appConfig = appConfig;
  }

  get selector() {
    return {
      language: 'typescript',
      scheme: 'file'
    }
  };

  provideCodeLenses(document:TextDocument, token: CancellationToken) {
    return CodeMetricsParser.getMetrics(document);
  }

  resolveCodeLens(codeLensItem:CodeLens, token: CancellationToken):CodeLens {
    if (codeLensItem instanceof CodeMetricsCodeLens) {
        this.makeEmptyCommand(<CodeMetricsCodeLens>codeLensItem);
    }
    return;
  }
  
  
  makeEmptyCommand(codeLensItem:CodeMetricsCodeLens) {
    codeLensItem.command = {
      title: codeLensItem.complexity+"",
      command: undefined,
      arguments: undefined
    };
    return codeLensItem;
  }

}