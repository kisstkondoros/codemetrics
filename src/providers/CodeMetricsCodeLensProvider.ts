import {CodeLensProvider, TextDocument, CodeLens, CancellationToken, workspace} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {IMetricsModel} from 'tsmetrics-core';
import {AppConfiguration} from '../models/AppConfiguration';
import {VSCodeMetricsConfiguration} from '../models/VSCodeMetricsConfiguration';
import {MetricsParser} from 'tsmetrics-core/MetricsParser';
import * as ts from 'typescript';
import {readFileSync, statSync} from 'fs';
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
    var jsxDocSelector = {
      language: 'javascriptreact',
      scheme: 'file'
    };
    var tsxDocSelector = {
      language: 'typescriptreact',
      scheme: 'file'
    };
    return [tsDocSelector, jsDocSelector, jsxDocSelector, tsxDocSelector];
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
    var config = ts.readConfigFile(fileName, (filePath) => {
      let fullPath = path.join(workspace.rootPath, filePath);
      return readFileSync(fullPath, 'UTF-8');
    });
    return config;
  }

  private isLanguageDisabled(languageId: string): boolean {
    if (languageId == 'typescript' && !this.appConfig.codeMetricsSettings.EnabledForTS) return true;
    if (languageId == 'typescriptreact' && !this.appConfig.codeMetricsSettings.EnabledForTSX) return true;
    if (languageId == 'javascript' && !this.appConfig.codeMetricsSettings.EnabledForJS) return true;
    if (languageId == 'javascriptreact' && !this.appConfig.codeMetricsSettings.EnabledForJSX) return true;
    return false;
  }

  private isAboveFileSizeLimit(fileName: string) {
    if (this.appConfig.codeMetricsSettings.FileSizeLimitMB < 0) {
      return false;
    }

    try {
      let fileSizeInBytes = statSync(fileName).size;
      let configuredLimit = this.appConfig.codeMetricsSettings.FileSizeLimitMB * 1024 * 1024;
      return fileSizeInBytes > configuredLimit;
    } catch (error) {
      return false;
    }
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    var result: CodeLens[] = [];
    if (this.isAboveFileSizeLimit(document.fileName)) return;
    if (this.isLanguageDisabled(document.languageId)) return;

    if (this.appConfig.codeMetricsDisplayed) {
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

      var settings = this.appConfig.codeMetricsSettings;
      var metrics = MetricsParser.getMetricsFromText(document.fileName, document.getText(), settings, target).metrics;
      var collect = function (model: IMetricsModel) {
        if (model.visible && model.getSumComplexity() >= settings.CodeLensHiddenUnder) {
          result.push(new CodeMetricsCodeLens(model, document));
        }
        model.children.forEach(element => {
          collect(element);
        });
      }
      collect(metrics);
    }
    return result;
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens | Thenable<CodeLens> {
    if (codeLens instanceof CodeMetricsCodeLens) {
      codeLens.command = {
        title: codeLens.toString(this.appConfig),
        command: "codemetrics.showCodeMetricsCodeLensInfo",
        arguments: [codeLens]
      };
      return codeLens;
    }
    return null;
  }
}
