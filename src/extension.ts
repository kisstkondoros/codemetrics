import { ExtensionContext, QuickPickItem, window, Selection, Range, languages, commands } from "vscode";
import { CodeMetricsCodeLensProvider } from "./codelensprovider/CodeMetricsCodeLensProvider";
import { AppConfiguration } from "./models/AppConfiguration";
import { CodeMetricsCodeLens } from "./models/CodeMetricsCodeLens";
import { MetricsUtil } from "./metrics/MetricsUtil";
import { EditorDecoration } from "./editordecoration/EditorDecoration";

export function activate(context: ExtensionContext) {
    const config: AppConfiguration = new AppConfiguration();
    const metricsUtil: MetricsUtil = new MetricsUtil(config, context);
    const disposables = [];

    disposables.push(
        languages.registerCodeLensProvider(metricsUtil.selector, new CodeMetricsCodeLensProvider(metricsUtil))
    );
    disposables.push(new EditorDecoration(context, metricsUtil));

    const triggerCodeLensComputation = () => {
        if (!window.activeTextEditor) {
            return;
        }
        var end = window.activeTextEditor.selection.end;
        window.activeTextEditor
            .edit((editbuilder) => {
                editbuilder.insert(end, " ");
            })
            .then(() => {
                commands.executeCommand("undo");
            });
    };

    disposables.push(
        commands.registerCommand("codemetrics.toggleCodeMetricsForArrowFunctions", () => {
            config.codeMetricsForArrowFunctionsToggled = !config.codeMetricsForArrowFunctionsToggled;
            config.toggleCodeMetricsForArrowFunctionsExecuted = true;
            triggerCodeLensComputation();
        })
    );

    disposables.push(
        commands.registerCommand("codemetrics.toggleCodeMetricsDisplayed", () => {
            config.codeMetricsDisplayed = !config.codeMetricsDisplayed;
            triggerCodeLensComputation();
        })
    );
    const pad = function (input, lenghtToFit = 4) {
        var pad = new Array(lenghtToFit).join(" ");
        return pad.substring(0, Math.max(0, pad.length - input.length)) + input;
    };
    const roundComplexity = function (complexity) {
        return Number(complexity.toFixed(2));
    };
    disposables.push(
        commands.registerCommand("codemetrics.showCodeMetricsCodeLensInfo", (codelens: CodeMetricsCodeLens) => {
            var items = [codelens.model, ...codelens.getChildren().filter((item) => item.getCollectedComplexity() > 0)];
            var explanations: QuickPickItem[] = items.map((item) => {
                const complexityForItem = codelens.model == item ? item.complexity : item.getCollectedComplexity();
                var complexity = pad(roundComplexity(complexityForItem) + "", 5);
                var line = pad(item.line + "");
                var column = pad(item.column + "");
                const result: QuickPickItem = {
                    label: (complexity + " - Ln " + line + " Col " + column + " " + item.description).replace(
                        /[\r\n]+/g,
                        " "
                    ),
                    description: item.text,
                };
                return result;
            });

            const jumpTo = (selected) => {
                if (selected) {
                    var selectedCodeLens = items[explanations.indexOf(selected)];
                    if (selectedCodeLens) {
                        var start = window.activeTextEditor.document.positionAt(selectedCodeLens.start);
                        var end = window.activeTextEditor.document.positionAt(selectedCodeLens.start);
                        const range = new Range(start, start);
                        window.activeTextEditor.revealRange(range);
                        window.activeTextEditor.selection = new Selection(start, start);
                    }
                }
            };
            window.showQuickPick(explanations, { onDidSelectItem: jumpTo }).then(jumpTo);
        })
    );

    context.subscriptions.push(...disposables);
}
