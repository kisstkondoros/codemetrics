import { CodeLensProvider, TextDocument, CodeLens, CancellationToken } from "vscode";
import { CodeMetricsCodeLens } from "../models/CodeMetricsCodeLens";
import { MetricsUtil } from "../metrics/MetricsUtil";

export class CodeMetricsCodeLensProvider implements CodeLensProvider {
    private metricsUtil: MetricsUtil;

    constructor(metricsUtil: MetricsUtil) {
        this.metricsUtil = metricsUtil;
    }

    provideCodeLenses(document: TextDocument, token: CancellationToken): Thenable<CodeLens[]> {
        if (!this.metricsUtil.appConfig.codeMetricsDisplayed) return;
        if (!this.metricsUtil.appConfig.getCodeMetricsSettings(document.uri).CodeLensEnabled) return;
        return this.metricsUtil.getMetrics(document).then((metrics) => {
            const result: CodeLens[] = metrics.map(
                (model) => new CodeMetricsCodeLens(model, document.uri, this.metricsUtil.toRange(model, document))
            );
            return result;
        });
    }

    resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens {
        if (codeLens instanceof CodeMetricsCodeLens) {
            codeLens.command = {
                title: this.metricsUtil.format(codeLens),
                command: "codemetrics.showCodeMetricsCodeLensInfo",
                arguments: [codeLens],
            };
            return codeLens;
        }
        return null;
    }
}
