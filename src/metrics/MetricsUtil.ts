import * as ts from 'typescript';
import * as path from 'path';
import { Range, TextDocument, Disposable, ExtensionContext, workspace, window } from 'vscode';
import { LanguageClient, LanguageClientOptions, ErrorAction, CloseAction, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';
import { Message } from 'vscode-jsonrpc';

import { IMetricsModel } from 'tsmetrics-core';
import { MetricsModel } from 'tsmetrics-core/MetricsModel';

import { MetricsRequestType, RequestData } from './common/protocol';
import { CodeMetricsCodeLens } from '../models/CodeMetricsCodeLens';
import { AppConfiguration } from '../models/AppConfiguration';

export class MetricsUtil {
  public appConfig: AppConfiguration;
  private client: LanguageClient;
  constructor(appConfig: AppConfiguration, context: ExtensionContext) {
    this.appConfig = appConfig;
    let serverModule = context.asAbsolutePath(path.join('out', 'metrics', 'server', 'server.js'));

    let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

    let serverOptions: ServerOptions = {
      run: { module: serverModule, transport: TransportKind.ipc },
      debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
    }
    var output = window.createOutputChannel("CodeMetrics");

    let error: (error, message, count) => ErrorAction = (error: Error, message: Message, count: number) => {
      output.appendLine(message.jsonrpc);
      return undefined;
    };

    let clientOptions: LanguageClientOptions = {
      documentSelector: this.selector.map(p => p.language),
      errorHandler: {
        error: error,

        closed: () => {
          return undefined;
        }
      },
      synchronize: {
        configurationSection: 'codemetrics',
      }
    }

    this.client = new LanguageClient('CodeMetrics client', serverOptions, clientOptions);
    let disposable = this.client.start();

    context.subscriptions.push(disposable);
  }

  get selector(): { language: string; scheme: string; }[] {
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
    var luaDocSelector = {
      language: 'lua',
      scheme: 'file'
    };
    return [tsDocSelector, jsDocSelector, jsxDocSelector, tsxDocSelector, luaDocSelector];
  }

  public getMetrics(document: TextDocument): Thenable<IMetricsModel[]> {
    const requestData: RequestData = { uri: document.uri.toString(), configuration: this.appConfig.codeMetricsSettings };
    return this.client.sendRequest(MetricsRequestType, requestData).then(metrics => metrics.map(m => {
      return this.convert(m);
    }));
  };
  private convert(m: IMetricsModel): IMetricsModel {
    let model = new MetricsModel(0, 0, "", 0, 0, 0, "");
    model.line = m.line;
    model.column = m.column;
    model.complexity = m.complexity;
    model.visible = m.visible;
    model.children = m.children.map(c => this.convert(c));
    model.description = m.description;
    model.start = m.start;
    model.end = m.end;
    model.text = m.text;
    return model;
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