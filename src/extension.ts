import * as vscode from 'vscode';
import {Disposable, DocumentSelector, languages, commands} from 'vscode';
import {CodeMetricsCodeLensProvider} from './providers/CodeMetricsCodeLensProvider';
import {AppConfiguration} from './models/AppConfiguration';
import {CodeMetricsParser} from './common/CodeMetricsParser';
import {CodeMetricsCodeLens} from './models/CodeMetricsCodeLens';

const redDecorationType = vscode.window.createTextEditorDecorationType({
  overviewRulerColor: "#F44336",
  isWholeLine:true,
  overviewRulerLane: vscode.OverviewRulerLane.Left
});
const yellowDecorationType = vscode.window.createTextEditorDecorationType({
  overviewRulerColor: "#FFC107",
  isWholeLine:true,
  overviewRulerLane: vscode.OverviewRulerLane.Left
});
const greenDecorationType = vscode.window.createTextEditorDecorationType({
  overviewRulerColor: "#4CAF50",
  isWholeLine:true,
  overviewRulerLane: vscode.OverviewRulerLane.Left
});
export function activate(context) {
  function getMetricsForValuesBetween(metrics: CodeMetricsCodeLens[], lowerLimit: number, upperLimit: number): vscode.DecorationOptions[] {
    return metrics.filter(metrics => metrics.complexity >= lowerLimit && metrics.complexity < upperLimit).map(metric => {
      let decoration: vscode.DecorationOptions = {
        range: new vscode.Range(metric.range.start,metric.range.start),
        hoverMessage: metric.toString()
      };
      return decoration;
    })
  }

  const config = new AppConfiguration();
  const disposables = [];
  const providers = [
    new CodeMetricsCodeLensProvider(config)
  ];
  let updateMetrics = (event) => {
    let editor = vscode.window.activeTextEditor;
    let document = editor.document;
    let isTs = document.languageId === "typescript";
    if (isTs) {
      let metrics: CodeMetricsCodeLens[] = CodeMetricsParser.getMetrics(document);

      editor.setDecorations(redDecorationType, getMetricsForValuesBetween(metrics, 5, Number.MAX_SAFE_INTEGER));
      editor.setDecorations(yellowDecorationType, getMetricsForValuesBetween(metrics, 3, 5));
      editor.setDecorations(greenDecorationType, getMetricsForValuesBetween(metrics, 0, 3));
    }
  };
  vscode.workspace.onDidOpenTextDocument(updateMetrics)
  vscode.workspace.onDidChangeTextDocument(updateMetrics);

  providers.forEach(provider => {
    disposables.push(
      languages.registerCodeLensProvider(
        provider.selector,
        provider
      )
    );
  })


  context.subscriptions.push(...disposables);
}