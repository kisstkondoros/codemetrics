import * as vscode from 'vscode';
import { MetricsUtil } from '../metrics/MetricsUtil';
import { IMetricsModel } from 'tsmetrics-core';
export class EditorDecoration implements vscode.Disposable {
  private low: vscode.TextEditorDecorationType;
  private normal: vscode.TextEditorDecorationType;
  private high: vscode.TextEditorDecorationType;
  private extreme: vscode.TextEditorDecorationType;
  private metricsUtil: MetricsUtil;
  private didChangeTextDocument: vscode.Disposable;
  private didOpenTextDocument: vscode.Disposable;
  constructor(context: vscode.ExtensionContext, metricsUtil: MetricsUtil) {
    this.low = vscode.window.createTextEditorDecorationType({
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      before: {
        contentIconPath: context.asAbsolutePath("images/green.png"),
        margin: "5px"
      }
    });
    this.normal = vscode.window.createTextEditorDecorationType({
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      before: {
        contentIconPath: context.asAbsolutePath("images/orange.png"),
        margin: "5px"
      }
    });
    this.high = vscode.window.createTextEditorDecorationType({
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      before: {
        contentIconPath: context.asAbsolutePath("images/red.png"),
        margin: "5px"
      }
    });
    this.extreme = vscode.window.createTextEditorDecorationType({
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      before: {
        contentIconPath: context.asAbsolutePath("images/accent.png"),
        margin: "5px"
      }
    });

    this.metricsUtil = metricsUtil;

    this.didChangeTextDocument = vscode.workspace.onDidChangeTextDocument(e => {
      setTimeout(() => this.update(), 500);
    });
    this.didOpenTextDocument = vscode.window.onDidChangeActiveTextEditor(e => {
      setTimeout(() => this.update(), 500);
    });
    this.update();
  }

  private update() {
    const editor = vscode.window.activeTextEditor;

    if (!editor || !editor.document) {
      return;
    }
    const document = editor.document;

    const languageDisabled = this.metricsUtil.selector.filter(s => s.language == document.languageId).length == 0;
    const decorationDisabled = !this.metricsUtil.appConfig.codeMetricsSettings.DecorationModeEnabled;
    if (decorationDisabled || languageDisabled) {
      editor.setDecorations(this.low, []);
      editor.setDecorations(this.normal, []);
      editor.setDecorations(this.high, []);
      editor.setDecorations(this.extreme, []);
      return;
    }
    this.metricsUtil.getMetrics(document).then((metrics) => {

      const toDecoration = (model: IMetricsModel): vscode.DecorationOptions => {
        return {
          hoverMessage: model.toString(this.metricsUtil.appConfig.codeMetricsSettings),
          range: this.metricsUtil.toRangeFromOffset(model.start, document)
        }
      };
      const complexityAndModel: ComplexityToModel[] = metrics.map(p => { return { complexity: p.getCollectedComplexity(), model: p } });
      const settings = this.metricsUtil.appConfig.codeMetricsSettings;
      const lowLevelDecorations = complexityAndModel.filter(p => p.complexity < settings.ComplexityLevelNormal).map(p => toDecoration(p.model));

      const normalLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelNormal && p.complexity < settings.ComplexityLevelHigh).map(p => toDecoration(p.model));

      const highLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelHigh && p.complexity < settings.ComplexityLevelExtreme).map(p => toDecoration(p.model));

      const extremeLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelExtreme).map(p => toDecoration(p.model));

      editor.setDecorations(this.low, lowLevelDecorations);
      editor.setDecorations(this.normal, normalLevelDecorations);
      editor.setDecorations(this.high, highLevelDecorations);
      editor.setDecorations(this.extreme, extremeLevelDecorations);
    });
  }

  public dispose(): void {
    this.low.dispose();
    this.normal.dispose();
    this.high.dispose();
    this.extreme.dispose();
    this.didChangeTextDocument.dispose();
    this.didOpenTextDocument.dispose();
  }
}

interface ComplexityToModel {
  complexity: number
  model: IMetricsModel
}