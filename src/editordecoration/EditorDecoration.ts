import * as vscode from "vscode";
import { MetricsUtil } from "../metrics/MetricsUtil";
import { IMetricsModel } from "tsmetrics-core";
import { IVSCodeMetricsConfiguration } from "../metrics/common/VSCodeMetricsConfiguration";

export class EditorDecoration implements vscode.Disposable {
    private low: vscode.TextEditorDecorationType;
    private normal: vscode.TextEditorDecorationType;
    private high: vscode.TextEditorDecorationType;
    private extreme: vscode.TextEditorDecorationType;
    private decorationModeEnabled: boolean = false;
    private overviewRulerModeEnabled: boolean = false;

    private metricsUtil: MetricsUtil;
    private didChangeTextDocument: vscode.Disposable;
    private didOpenTextDocument: vscode.Disposable;
    constructor(context: vscode.ExtensionContext, metricsUtil: MetricsUtil) {
        this.metricsUtil = metricsUtil;

        const debouncedUpdate = this.debounce(() => this.update(), 500);
        this.didChangeTextDocument = vscode.workspace.onDidChangeTextDocument(e => {
            debouncedUpdate();
        });
        this.didOpenTextDocument = vscode.window.onDidChangeActiveTextEditor(e => {
            this.disposeDecorators();
            this.update();
        });
        this.update();
    }

    private debounce(func: () => void, timeout): () => void {
        let id;
        return () => {
            clearTimeout(id);
            id = setTimeout(() => func(), timeout);
        };
    }

    private update() {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !editor.document) {
            return;
        }
        const document = editor.document;
        const settings = this.metricsUtil.appConfig.getCodeMetricsSettings(document.uri);

        const languageDisabled = this.metricsUtil.selector.filter(s => s.language == document.languageId).length == 0;
        const decorationDisabled = !(settings.DecorationModeEnabled || settings.OverviewRulerModeEnabled);
        if (decorationDisabled || languageDisabled) {
            this.clearDecorators(editor);
            return;
        }
        // for some reason the context is lost
        var thisContext = this;
        this.metricsUtil.getMetrics(document).then(
            metrics => {
                if (thisContext.settingsChanged(settings) || this.low == null) {
                    thisContext.clearDecorators(editor);
                    thisContext.updateDecorators(settings, document.uri);
                }
                const toDecoration = (model: IMetricsModel): vscode.DecorationOptions => {
                    return {
                        hoverMessage: model.toString(settings),
                        range: thisContext.metricsUtil.toDecorationRange(model.start, document)
                    };
                };
                const complexityAndModel: ComplexityToModel[] = metrics.map(p => {
                    return { complexity: p.getCollectedComplexity(), model: p };
                });

                const lowLevelDecorations = complexityAndModel
                    .filter(p => p.complexity <= settings.ComplexityLevelNormal)
                    .map(p => toDecoration(p.model));

                const normalLevelDecorations = complexityAndModel
                    .filter(
                        p =>
                            p.complexity > settings.ComplexityLevelNormal &&
                            p.complexity <= settings.ComplexityLevelHigh
                    )
                    .map(p => toDecoration(p.model));

                const highLevelDecorations = complexityAndModel
                    .filter(
                        p =>
                            p.complexity > settings.ComplexityLevelHigh &&
                            p.complexity <= settings.ComplexityLevelExtreme
                    )
                    .map(p => toDecoration(p.model));

                const extremeLevelDecorations = complexityAndModel
                    .filter(p => p.complexity > settings.ComplexityLevelExtreme)
                    .map(p => toDecoration(p.model));

                editor.setDecorations(thisContext.low, lowLevelDecorations);
                editor.setDecorations(thisContext.normal, normalLevelDecorations);
                editor.setDecorations(thisContext.high, highLevelDecorations);
                editor.setDecorations(thisContext.extreme, extremeLevelDecorations);
            },
            e => {
                var exmsg = "";
                if (e.message) {
                    exmsg += e.message;
                }
                if (e.stack) {
                    exmsg += " | stack: " + e.stack;
                }
                console.error(exmsg);
            }
        );
    }
    private settingsChanged(settings: IVSCodeMetricsConfiguration): boolean {
        const changed =
            settings.DecorationModeEnabled != this.decorationModeEnabled ||
            settings.OverviewRulerModeEnabled != this.overviewRulerModeEnabled;
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

    private updateDecorators(settings: IVSCodeMetricsConfiguration, resource: vscode.Uri) {
        const size: number = vscode.workspace.getConfiguration("editor", resource).get("fontSize");

        this.low = this.createDecorationType(
            settings.DecorationModeEnabled,
            settings.OverviewRulerModeEnabled,
            settings.ComplexityColorLow,
            size
        );
        this.normal = this.createDecorationType(
            settings.DecorationModeEnabled,
            settings.OverviewRulerModeEnabled,
            settings.ComplexityColorNormal,
            size
        );
        this.high = this.createDecorationType(
            settings.DecorationModeEnabled,
            settings.OverviewRulerModeEnabled,
            settings.ComplexityColorHigh,
            size
        );
        this.extreme = this.createDecorationType(
            settings.DecorationModeEnabled,
            settings.OverviewRulerModeEnabled,
            settings.ComplexityColorExtreme,
            size
        );
    }
    createDecorationType(
        decorationModeEnabled: boolean,
        overviewRulerModeEnabled: boolean,
        color: string,
        size: number
    ) {
        const rectangleFactory = (size, color) =>
            vscode.Uri.parse(
                `data:image/svg+xml,` +
                    encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}px' height='${size}px' viewbox='0 0 ${size} ${size}'><rect width='${size}' height='${size}' style='fill:${color};stroke-width:1;stroke:#fff'/></svg>`
                    )
            );
        const options: vscode.DecorationRenderOptions = {
            overviewRulerLane: vscode.OverviewRulerLane.Right,
            overviewRulerColor: color,
            before: {
                contentIconPath: rectangleFactory(size, color),
                margin: `${size / 2}px`
            }
        };
        if (!decorationModeEnabled) {
            options.before = null;
        }
        if (!overviewRulerModeEnabled) {
            options.overviewRulerColor = null;
        }
        options.rangeBehavior = vscode.DecorationRangeBehavior.ClosedClosed;
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
    complexity: number;
    model: IMetricsModel;
}
