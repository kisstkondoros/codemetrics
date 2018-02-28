"use strict";
import * as ts from "typescript";
import { Minimatch } from "minimatch";
import { workspace } from "vscode";
import {
    Diagnostic,
    DiagnosticSeverity,
    InitializeResult,
    IPCMessageReader,
    IPCMessageWriter,
    IConnection,
    createConnection,
    Range,
    TextDocuments,
    TextDocument
} from "vscode-languageserver";
import { MetricsRequestType, RequestData } from "../common/protocol";
import { VSCodeMetricsConfiguration } from "../common/VSCodeMetricsConfiguration";

import { readFileSync, statSync } from "fs";

import { MetricsParser } from "tsmetrics-core/MetricsParser";
import { IMetricsModel, IMetricsParseResult } from "tsmetrics-core";
import { MetricsModel } from "tsmetrics-core/MetricsModel";
import { LuaMetrics } from "./LuaMetrics";

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
    };
});

connection.onRequest(MetricsRequestType, RequestData => {
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
        if (languageId == "typescript" && !this.appConfig.EnabledForTS) return true;
        if (languageId == "typescriptreact" && !this.appConfig.EnabledForTSX) return true;
        if (languageId == "javascript" && !this.appConfig.EnabledForJS) return true;
        if (languageId == "javascriptreact" && !this.appConfig.EnabledForJSX) return true;
        if (languageId == "lua" && !this.appConfig.EnabledForLua) return true;
        if (languageId == "vue" && !this.appConfig.EnabledForVue) return true;
        if (languageId == "html" && !this.appConfig.EnabledForHTML) return true;
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
    private isExcluded(fileName: string) {
        const exclusionList = this.appConfig.Exclude || [];
        return exclusionList.some(pattern => {
            return new Minimatch(pattern).match(fileName);
        });
    }
    public getMetrics(document: TextDocument): IMetricsModel[] {
        const target = ts.ScriptTarget.Latest;
        const result: IMetricsModel[] = [];
        let diagnostics: Diagnostic[] = [];
        if (
            !this.isExcluded(document.uri) &&
            !this.isAboveFileSizeLimit(document.uri) &&
            !this.isLanguageDisabled(document.languageId)
        ) {
            var metrics: IMetricsParseResult = undefined;
            if (this.isHTMLLike(document.languageId)) {
                let input = document.getText();
                input = input.replace(/<script>/gim, "<scrip*/");
                input = input.replace(/<\/script>/gim, "/*script>");
                input = "/*" + input.substring(2, input.length - 2) + "*/";

                metrics = MetricsParser.getMetricsFromText(document.uri, input, this.appConfig, <any>target);
            } else if (this.isLua(document.languageId)) {
                metrics = {
                    file: document.uri,
                    metrics: new LuaMetrics().getMetricsFromLuaSource(
                        this.appConfig.LuaStatementMetricsConfiguration,
                        document.getText()
                    )
                };
            } else {
                metrics = MetricsParser.getMetricsFromText(
                    document.uri,
                    document.getText(),
                    this.appConfig,
                    <any>target
                );
            }
            var collect = (model: IMetricsModel) => {
                if (model.visible && model.getCollectedComplexity() >= this.appConfig.CodeLensHiddenUnder) {
                    result.push(model);
                }
                model.children.forEach(element => {
                    collect(element);
                });
            };
            collect(metrics.metrics);

            if (this.appConfig.DiagnosticsEnabled) {
                diagnostics = result.map(model => {
                    return {
                        range: Range.create(document.positionAt(model.start), document.positionAt(model.end)),
                        message: model.toString(this.appConfig),
                        source: "codemetrics",
                        severity: DiagnosticSeverity.Hint,
                        code: "42"
                    };
                });
            }
        }

        connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
        return result;
    }

    private isLua(languageId: string) {
        return languageId == "lua";
    }

    private isVue(languageId: string) {
        return languageId == "vue";
    }

    private isHTML(languageId: string) {
        return languageId == "html";
    }

    private isHTMLLike(languageId: string) {
        return this.isVue(languageId) || this.isHTML(languageId);
    }
}

connection.listen();
