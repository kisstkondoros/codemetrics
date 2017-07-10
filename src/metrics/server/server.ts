'use strict';
import * as ts from 'typescript';
import { workspace } from 'vscode';
import { Diagnostic, DiagnosticSeverity, InitializeResult, IPCMessageReader, IPCMessageWriter, IConnection, createConnection, Range, TextDocuments, TextDocument } from 'vscode-languageserver';
import { MetricsRequestType, RequestData } from '../common/protocol';
import { VSCodeMetricsConfiguration } from '../common/VSCodeMetricsConfiguration';

import { readFileSync, statSync } from 'fs';

import { MetricsParser } from 'tsmetrics-core/MetricsParser';
import { IMetricsModel, IMetricsParseResult } from 'tsmetrics-core';
import { LuaMetrics } from './LuaMetrics'

let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));


console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);

let documents: TextDocuments = new TextDocuments();
documents.listen(connection);

connection.onInitialize((params): InitializeResult => {
  return {
    capabilities: {
      textDocumentSync: documents.syncKind
    }
  }
});

connection.onRequest(MetricsRequestType, (RequestData) => {
  let document = documents.get(RequestData.uri);
  const metrics: MetricsUtil = new MetricsUtil(RequestData.configuration);
  return metrics.getMetrics(document);
});
class MetricsUtil {
  private appConfig: VSCodeMetricsConfiguration;
  constructor(appConfig: VSCodeMetricsConfiguration) {
    this.appConfig = appConfig;
  }
  private isLanguageDisabled(languageId: string): boolean {
    if (languageId == 'typescript' && !this.appConfig.EnabledForTS) return true;
    if (languageId == 'typescriptreact' && !this.appConfig.EnabledForTSX) return true;
    if (languageId == 'javascript' && !this.appConfig.EnabledForJS) return true;
    if (languageId == 'javascriptreact' && !this.appConfig.EnabledForJSX) return true;
    if (languageId == 'lua' && !this.appConfig.EnabledForLua) return true;
    return false;
  }

  private isAboveFileSizeLimit(fileName: string) {
    if (this.appConfig.FileSizeLimitMB < 0) {
      return false;
    }

    try {
      let fileSizeInBytes = statSync(fileName).size;
      let configuredLimit = this.appConfig.FileSizeLimitMB * 1024 * 1024;
      return fileSizeInBytes > configuredLimit;
    } catch (error) {
      return false;
    }
  }
  public getMetrics(document: TextDocument): IMetricsModel[] {
    var target = ts.ScriptTarget.Latest;
    var result: IMetricsModel[] = [];
    var metrics: IMetricsParseResult = undefined;
    if (this.isAboveFileSizeLimit(document.uri)) return [];
    if (this.isLanguageDisabled(document.languageId)) return [];
    if (this.isLua(document.languageId)) {
      metrics = {
        file: document.uri,
        metrics: new LuaMetrics().getMetricsFromLuaSource(this.appConfig.LuaStatementMetricsConfiguration, document.getText())
      }
    } else {
      metrics = MetricsParser.getMetricsFromText(document.uri, document.getText(), this.appConfig, <any>target);
    }
    var collect = (model: IMetricsModel) => {
      if (model.visible && model.getCollectedComplexity() >= this.appConfig.CodeLensHiddenUnder) {
        result.push(model);
      }
      model.children.forEach(element => {
        collect(element);
      });
    }
    collect(metrics.metrics);
    let diagnostics: Diagnostic[] = result.map(model => {
      return {
        range: Range.create(document.positionAt(model.start), document.positionAt(model.end)),
        message: model.toString(this.appConfig),
        source: "codemetrics",
        severity: DiagnosticSeverity.Hint,
        code: "42"
      }
    });

    if (this.appConfig.DiagnosticsEnabled) {
      connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
    } else {
      connection.sendDiagnostics({ uri: document.uri, diagnostics: [] });
    }
    return result;
  }

  private isLua(languageId: string) {
    return languageId == 'lua';
  }

}

connection.listen();