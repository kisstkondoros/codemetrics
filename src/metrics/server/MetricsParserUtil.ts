import { ScriptTarget } from "typescript";
import { Minimatch } from "minimatch";
import {
    Diagnostic,
    DiagnosticSeverity,
    IConnection,
    Range,
    TextDocument
} from "vscode-languageserver";
import { IVSCodeMetricsConfiguration } from "../common/VSCodeMetricsConfiguration";

import { IMetricsModel, MetricsParser, IMetricsParseResult } from "tsmetrics-core";
import { LuaMetrics } from "./LuaMetrics";

export class MetricsParserUtil {
    constructor(private appConfig: IVSCodeMetricsConfiguration, private connection: IConnection) {
    }

    public getMetrics(document: TextDocument): IMetricsModel[] {
        const target = ScriptTarget.Latest;
        const result: IMetricsModel[] = [];
        let input = document.getText();
        let diagnostics: Diagnostic[] = [];
        if (
            !this.isExcluded(document.uri) &&
            !this.isAboveFileSizeLimit(input) &&
            !this.isLanguageDisabled(document.languageId)
        ) {
            var metrics: IMetricsParseResult = undefined;
            if (this.isHTMLLike(document.languageId)) {
                input = input.replace(/<script lang="js">/gim, "<script --------*/");
                input = input.replace(/<script lang="ts">/gim, "<script --------*/");
                input = input.replace(/<script>/gim, "<scrip*/");
                input = input.replace(/<\/script>/gim, "/*script>");
                input = "/*" + input.substring(2, input.length - 2) + "*/";

                metrics = MetricsParser.getMetricsFromText(document.uri, input, this.appConfig, <any>target);
            } else if (this.isLua(document.languageId)) {
                metrics = {
                    file: document.uri,
                    metrics: new LuaMetrics().getMetricsFromLuaSource(
                        this.appConfig.LuaStatementMetricsConfiguration,
                        input
                    )
                };
            } else {
                metrics = MetricsParser.getMetricsFromText(
                    document.uri,
                    input,
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

        this.connection.sendDiagnostics({ uri: document.uri, diagnostics: diagnostics });
        return result;
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

    private isAboveFileSizeLimit(fileContent: string) {
        if (this.appConfig.FileSizeLimitMB < 0) {
            return false;
        }

        try {
            let fileSizeInBytes = fileContent.length;
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
