import {Range, TextDocument, workspace} from 'vscode';
import * as ts from 'typescript';
import * as path from 'path';
import {readFileSync, statSync} from 'fs';

import {MetricsParser} from 'tsmetrics-core/MetricsParser';
import {IMetricsModel} from 'tsmetrics-core';

import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {AppConfiguration} from '../models/AppConfiguration';

export class MetricsUtil {
  public appConfig: AppConfiguration;
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

  public getMetrics(document: TextDocument): IMetricsModel[] {
    var target = ts.ScriptTarget.Latest;
    var result: IMetricsModel[] = [];
    var settings = this.appConfig.codeMetricsSettings;
    if (this.isAboveFileSizeLimit(document.fileName)) return [];
    if (this.isLanguageDisabled(document.languageId)) return [];
    if (!this.appConfig.codeMetricsDisplayed) return [];

    var metrics = MetricsParser.getMetricsFromText(document.fileName, document.getText(), settings, <any>target).metrics;
    var collect = (model: IMetricsModel) => {
      if (model.visible && model.getSumComplexity() >= this.appConfig.codeMetricsSettings.CodeLensHiddenUnder) {
        result.push(model);
      }
      model.children.forEach(element => {
        collect(element);
      });
    }
    collect(metrics);

    return result;
  }

  public format(model: CodeMetricsCodeLens): string {
    return model.toString(this.appConfig)
  }

  public toRange(model: IMetricsModel, document: TextDocument): Range {
    return new Range(document.positionAt(model.start), document.positionAt(model.end));
  }
  public toRangeFromOffset(start: number, document: TextDocument): Range {
    return new Range(document.positionAt(start), document.positionAt(start));
  }
}