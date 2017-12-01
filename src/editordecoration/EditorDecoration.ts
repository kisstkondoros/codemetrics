import * as vscode from 'vscode';
import { MetricsUtil } from '../metrics/MetricsUtil';
import { IMetricsModel } from 'tsmetrics-core';
import { VSCodeMetricsConfiguration } from '../metrics/common/VSCodeMetricsConfiguration';

export class EditorDecoration implements vscode.Disposable {
  private low: vscode.TextEditorDecorationType;
  private normal: vscode.TextEditorDecorationType;
  private high: vscode.TextEditorDecorationType;
  private extreme: vscode.TextEditorDecorationType;
  private decorationModeEnabled: boolean = false;
  private overviewRulerModeEnabled: boolean = false;

  private imagePaths: {
    green: string;
    orange: string;
    red: string;
    accent: string;
  }
  private metricsUtil: MetricsUtil;
  private didChangeTextDocument: vscode.Disposable;
  private didOpenTextDocument: vscode.Disposable;
  constructor(context: vscode.ExtensionContext, metricsUtil: MetricsUtil) {
    this.imagePaths = {
      green: context.asAbsolutePath("images/green.png"),
      orange: context.asAbsolutePath("images/orange.png"),
      red: context.asAbsolutePath("images/red.png"),
      accent: context.asAbsolutePath("images/accent.png")
    }
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
    const settings = this.metricsUtil.appConfig.codeMetricsSettings;

    const languageDisabled = this.metricsUtil.selector.filter(s => s.language == document.languageId).length == 0;
    const decorationDisabled = !(settings.DecorationModeEnabled || settings.OverviewRulerModeEnabled);
    if (decorationDisabled || languageDisabled) {
      this.clearDecorators(editor);
      return;
    }
    // for some reason the context is lost
    var thisContext = this;
    this.metricsUtil.getMetrics(document).then((metrics) => {
      if (thisContext.settingsChanged(settings) || this.low == null) {
        thisContext.clearDecorators(editor);
        thisContext.updateDecorators(settings.DecorationModeEnabled, settings.OverviewRulerModeEnabled);
      }
      const toDecoration = (model: IMetricsModel): vscode.DecorationOptions => {
        return {
          hoverMessage: model.toString(settings),
          range: thisContext.metricsUtil.toLineRangeFromOffset(model.start, document)
        }
      };
      const complexityAndModel: ComplexityToModel[] = metrics.map(p => { return { complexity: p.getCollectedComplexity(), model: p } });

      const lowLevelDecorations = complexityAndModel.filter(p => p.complexity < settings.ComplexityLevelNormal).map(p => toDecoration(p.model));

      const normalLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelNormal && p.complexity < settings.ComplexityLevelHigh).map(p => toDecoration(p.model));

      const highLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelHigh && p.complexity < settings.ComplexityLevelExtreme).map(p => toDecoration(p.model));

      const extremeLevelDecorations = complexityAndModel.filter(p => p.complexity >= settings.ComplexityLevelExtreme).map(p => toDecoration(p.model));

      editor.setDecorations(thisContext.low, lowLevelDecorations);
      editor.setDecorations(thisContext.normal, normalLevelDecorations);
      editor.setDecorations(thisContext.high, highLevelDecorations);
      editor.setDecorations(thisContext.extreme, extremeLevelDecorations);
    }, (e) => {
      var exmsg = "";
      if (e.message) {
        exmsg += e.message;
      }
      if (e.stack) {
        exmsg += ' | stack: ' + e.stack;
      }
      console.error(exmsg);
    });
  }
  private settingsChanged(settings: VSCodeMetricsConfiguration): boolean {
    const changed = settings.DecorationModeEnabled != this.decorationModeEnabled ||
      settings.OverviewRulerModeEnabled != this.overviewRulerModeEnabled
    this.decorationModeEnabled = settings.DecorationModeEnabled;
    this.overviewRulerModeEnabled = settings.OverviewRulerModeEnabled;
    return changed;
  }
  private clearDecorators(editor: vscode.TextEditor) {
    this.low && editor.setDecorations(this.low, []);
    this.normal && editor.setDecorations(this.normal, []);
    this.high && editor.setDecorations(this.high, []);
    this.extreme && editor.setDecorations(this.extreme, []);
    this.disposeDecorators();
  }

  private updateDecorators(decorationModeEnabled: boolean, overviewRulerModeEnabled: boolean) {
    this.low = this.createDecorationType(decorationModeEnabled, overviewRulerModeEnabled, {
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      overviewRulerColor: "#4bb14f",
      before: {
        contentIconPath: this.imagePaths.green,
        margin: "5px"
      }
    });
    this.normal = this.createDecorationType(decorationModeEnabled, overviewRulerModeEnabled, {
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      overviewRulerColor: "#ffc208",
      before: {
        contentIconPath: this.imagePaths.orange,
        margin: "5px"
      }
    });
    this.high = this.createDecorationType(decorationModeEnabled, overviewRulerModeEnabled, {
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      overviewRulerColor: "#f44034",
      before: {
        contentIconPath: this.imagePaths.red,
        margin: "5px"
      }
    });
    this.extreme = this.createDecorationType(decorationModeEnabled, overviewRulerModeEnabled, {
      overviewRulerLane: vscode.OverviewRulerLane.Right,
      overviewRulerColor: "#ff0000",
      before: {
        contentIconPath: this.imagePaths.accent,
        margin: "5px"
      }
    });
  }
  createDecorationType(decorationModeEnabled: boolean, overviewRulerModeEnabled: boolean, options: vscode.DecorationRenderOptions) {
    if (!decorationModeEnabled) {
      options.before = null;
    }
    if (!overviewRulerModeEnabled) {
      options.overviewRulerColor = null;
    }
    return vscode.window.createTextEditorDecorationType(options);
  }
  disposeDecorators() {
    this.low && this.low.dispose();
    this.normal && this.normal.dispose();
    this.high && this.high.dispose();
    this.extreme && this.extreme.dispose();
    this.low = null;
    this.normal = null;
    this.high = null;
    this.extreme = null;
  }

  public dispose(): void {
    this.disposeDecorators();
    this.didChangeTextDocument.dispose();
    this.didOpenTextDocument.dispose();
  }
}

interface ComplexityToModel {
  complexity: number
  model: IMetricsModel
}