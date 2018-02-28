import * as ts from "typescript";
import * as path from "path";
import {
    Range,
    TextDocument,
    Disposable,
    ExtensionContext,
    workspace,
    window,
    ProviderResult,
    Command,
    Diagnostic,
    CodeActionContext
} from "vscode";
import {
    LanguageClient,
    LanguageClientOptions,
    ErrorAction,
    CloseAction,
    SettingMonitor,
    ServerOptions,
    TransportKind
} from "vscode-languageclient";
import { Message } from "vscode-jsonrpc";

import { IMetricsModel } from "tsmetrics-core";
import { MetricsModel } from "tsmetrics-core/MetricsModel";

import { MetricsRequestType, RequestData } from "./common/protocol";
import { CodeMetricsCodeLens } from "../models/CodeMetricsCodeLens";
import { AppConfiguration } from "../models/AppConfiguration";

export class MetricsUtil {
    public appConfig: AppConfiguration;
    private client: LanguageClient;
    constructor(appConfig: AppConfiguration, context: ExtensionContext) {
        this.appConfig = appConfig;
        let serverModule = context.asAbsolutePath(path.join("out", "src", "metrics", "server", "server.js"));

        let debugOptions = { execArgv: ["--nolazy", "--inspect=6004"] };

        let serverOptions: ServerOptions = {
            run: { module: serverModule, transport: TransportKind.ipc },
            debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
        };
        var output = window.createOutputChannel("CodeMetrics");

        let error: (error, message, count) => ErrorAction = (error: Error, message: Message, count: number) => {
            output.appendLine(message.jsonrpc);
            return undefined;
        };

        let clientOptions: LanguageClientOptions = {
            documentSelector: this.selector.map(p => p.language),
            diagnosticCollectionName: "codemetrics",
            errorHandler: {
                error: error,

                closed: () => {
                    return undefined;
                }
            },
            synchronize: {
                configurationSection: "codemetrics"
            }
        };

        this.client = new LanguageClient("CodeMetrics client", serverOptions, clientOptions);
        let disposable = this.client.start();

        context.subscriptions.push(disposable);
    }

    get selector(): { language: string }[] {
        var tsDocSelector = {
            language: "typescript"
        };
        var jsDocSelector = {
            language: "javascript"
        };
        var jsxDocSelector = {
            language: "javascriptreact"
        };
        var tsxDocSelector = {
            language: "typescriptreact"
        };
        var luaDocSelector = {
            language: "lua"
        };
        var vueDocSelector = {
            language: "vue"
        };
        var htmlDocSelector = {
            language: "html"
        };
        return [
            tsDocSelector,
            jsDocSelector,
            jsxDocSelector,
            tsxDocSelector,
            luaDocSelector,
            vueDocSelector,
            htmlDocSelector
        ];
    }

    public getMetrics(document: TextDocument): Thenable<IMetricsModel[]> {
        const requestData: RequestData = {
            uri: document.uri.toString(),
            configuration: this.appConfig.codeMetricsSettings
        };
        return this.client.onReady().then(() =>
            this.client.sendRequest(MetricsRequestType, requestData).then(metrics =>
                metrics.map(m => {
                    return this.convert(m);
                })
            )
        );
    }
    private convert(m: IMetricsModel): IMetricsModel {
        let model = new MetricsModel(
            m.start,
            m.end,
            m.text,
            m.line,
            m.column,
            m.complexity,
            m.description,
            false,
            m.visible,
            m.collectorType
        );
        model.children = m.children.map(c => this.convert(c));
        return model;
    }

    public format(model: CodeMetricsCodeLens): string {
        return model.toString(this.appConfig);
    }

    public toRange(model: IMetricsModel, document: TextDocument): Range {
        return new Range(document.positionAt(model.start), document.positionAt(model.end));
    }
    public toRangeFromOffset(start: number, document: TextDocument): Range {
        return new Range(document.positionAt(start), document.positionAt(start));
    }
    public toDecorationRange(start: number, document: TextDocument): Range {
        const pos = document.positionAt(start);
        const line = pos.line;
        const character = pos.character;
        const documentLine = document.lineAt(line);
        const lineRange = documentLine.range;
        return new Range(lineRange.end.line, lineRange.end.character, lineRange.end.line, lineRange.end.character);
    }
}
