import * as vscode from 'vscode';
import { Disposable, DocumentSelector, languages, commands } from 'vscode';
import { CodeMetricsCodeLensProvider } from './codeLensprovider/CodeMetricsCodeLensProvider';
import { AppConfiguration } from './models/AppConfiguration';
import { CodeMetricsCodeLens } from './models/CodeMetricsCodeLens';
import { MetricsUtil } from './metrics/MetricsUtil';
import { EditorDecoration } from './editordecoration/EditorDecoration';

export function activate(context: vscode.ExtensionContext) {
  const config: AppConfiguration = new AppConfiguration();
  const metricsUtil: MetricsUtil = new MetricsUtil(config, context);
  const disposables = [];

  disposables.push(
    languages.registerCodeLensProvider(
      metricsUtil.selector,
      new CodeMetricsCodeLensProvider(metricsUtil)
    )
  );
  disposables.push(new EditorDecoration(context, metricsUtil));

  const triggerCodeLensComputation = () => {
    if (!vscode.window.activeTextEditor) {
      return;
    }
    var end = vscode.window.activeTextEditor.selection.end;
    vscode.window.activeTextEditor.edit((editbuilder) => {
      editbuilder.insert(end, " ");
    }).then(() => {
      commands.executeCommand("undo");
    });
  };

  disposables.push(commands.registerCommand("codemetrics.toggleCodeMetricsForArrowFunctions", () => {
    config.codeMetricsForArrowFunctionsToggled = !config.codeMetricsForArrowFunctionsToggled;
    triggerCodeLensComputation();
  }));

  disposables.push(commands.registerCommand("codemetrics.toggleCodeMetricsDisplayed", () => {
    config.codeMetricsDisplayed = !config.codeMetricsDisplayed;
    triggerCodeLensComputation();
  }));

  disposables.push(commands.registerCommand("codemetrics.showCodeMetricsCodeLensInfo", (codelens: CodeMetricsCodeLens) => {
    var items = codelens.getChildren().filter(item => item.getCollectedComplexity() > 0);
    var explanations = items.map(item => item.toLogString("").trim() + " - " + item.description);
    vscode.window.showQuickPick(explanations).then(selected => {
      if (selected) {
        var selectedCodeLens = items[explanations.indexOf(selected)];
        if (selectedCodeLens) {
          var characterPosition = vscode.window.activeTextEditor.document.positionAt(selectedCodeLens.start);
          vscode.window.activeTextEditor.selection = new vscode.Selection(characterPosition, characterPosition);
        }
      }
    });

  }))


  context.subscriptions.push(...disposables);
}