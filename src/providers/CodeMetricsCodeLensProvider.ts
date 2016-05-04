import {CodeLensProvider, TextDocument, CodeLens, CancellationToken, workspace} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration, CodeMetricsConfiguration} from '../models/AppConfiguration';
import {CodeMetricsParser} from '../common/CodeMetricsParser';
import * as ts from 'typescript';
import {readFileSync} from 'fs';
import * as path from 'path';

export class CodeMetricsCodeLensProvider implements CodeLensProvider {

  private appConfig: AppConfiguration;

  constructor(appConfig: AppConfiguration) {
    this.appConfig = appConfig;
  }

  get selector() {
    var tsDocSelector = {
      language: 'typescript',
      scheme: 'file'
    };
    var jsDocSelector = {
      language: 'javascript',
      scheme: 'file'
    };
    return [tsDocSelector, jsDocSelector];
  };

  private getScriptTarget(target: string, isJS: boolean): ts.ScriptTarget {
    const keys = Object.keys(ts.ScriptTarget);
    let result: ts.ScriptTarget = isJS ? ts.ScriptTarget.ES5 : ts.ScriptTarget.ES3;
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

  private loadConfig(isJS: boolean) {
    var fileName = isJS ? "jsconfig.json" : "tsconfig.json";
    var config = ts.readConfigFile(fileName, (path) => {
      let fullPath = workspace.rootPath + "/" + path;
      return readFileSync(fullPath, 'UTF-8');
    });
    return config;
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    var target = ts.ScriptTarget.ES3;
    var isJS = false;

    if (document.fileName) {
      var parsedPath = path.parse(document.fileName);
      var extension = parsedPath.ext;
      isJS = extension && extension.toLowerCase() == ".js";
    }

    var projectConfig: any = this.loadConfig(isJS);
    if (projectConfig.config && projectConfig.config.compilerOptions) {
      target = this.getScriptTarget(projectConfig.config.compilerOptions.target, isJS);
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