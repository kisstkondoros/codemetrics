import {CodeLensProvider, TextDocument, CodeLens, CancellationToken, workspace} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration, CodeMetricsConfiguration} from '../models/AppConfiguration';
import {CodeMetricsParser} from '../common/CodeMetricsParser';
import * as ts from 'typescript';
import {readFileSync} from 'fs';

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

  private getScriptTarget(target: string): ts.ScriptTarget {
    const keys = Object.keys(ts.ScriptTarget);
    let result: ts.ScriptTarget = ts.ScriptTarget.ES3;
    if (target) {
      target = target.toLowerCase();
      for (const key of keys) {
        let value = ts.ScriptTarget[key];
        if (key.toLowerCase() === target) {
          result = value;
        }
      }
    }
    return result;
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    var tsconfig = ts.readConfigFile("tsconfig.json", (path) => {
      let fullPath = workspace.rootPath+"/"+path;
      return readFileSync(fullPath, 'UTF-8');
    });
    var target = ts.ScriptTarget.ES3;
    if (tsconfig.config && tsconfig.config.compilerOptions) {
      target = this.getScriptTarget(tsconfig.config.compilerOptions.target);
    }
    return CodeMetricsParser.getMetrics(this.appConfig, document, target, token);
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens | Thenable<CodeLens> {
    if (codeLens instanceof CodeMetricsCodeLens) {
      codeLens.command = {
        title: codeLens.toString(this.appConfig),
        command: "ShowCodeMetricsCodeLensInfo",
        arguments: [codeLens]
      };
      return codeLens;
    }
    return null;
  }
}