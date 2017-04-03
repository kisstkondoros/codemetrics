import {CodeLensProvider, TextDocument, CodeLens, CancellationToken, workspace} from 'vscode';
import {CodeMetricsCodeLens} from '../models/CodeMetricsCodeLens';
import {IMetricsModel} from 'tsmetrics-core';
import {VSCodeMetricsConfiguration} from '../models/VSCodeMetricsConfiguration';
import {MetricsUtil} from "../metrics/MetricsUtil";

export class CodeMetricsCodeLensProvider implements CodeLensProvider {
  private metricsUtil: MetricsUtil;

  constructor(metricsUtil: MetricsUtil) {
    this.metricsUtil = metricsUtil;
  }

  provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] {
    return this.metricsUtil.getMetrics(document).map(model => new CodeMetricsCodeLens(model, this.metricsUtil.toRange(model, document)));
  }

  resolveCodeLens(codeLens: CodeLens, token: CancellationToken): CodeLens {
    if (codeLens instanceof CodeMetricsCodeLens) {
      codeLens.command = {
        title: this.metricsUtil.format(codeLens),
        command: "codemetrics.showCodeMetricsCodeLensInfo",
        arguments: [codeLens]
      };
      return codeLens;
    }
    return null;
  }
}
