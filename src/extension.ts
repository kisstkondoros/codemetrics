import * as vscode from 'vscode';
import {Disposable, DocumentSelector, languages, commands} from 'vscode';
import {CodeMetricsCodeLensProvider} from './providers/CodeMetricsCodeLensProvider';
import {AppConfiguration} from './models/AppConfiguration';
import {CodeMetricsParser} from './common/CodeMetricsParser';
import {CodeMetricsCodeLens} from './models/CodeMetricsCodeLens';

export function activate(context) {
  const config = new AppConfiguration();
  const disposables = [];
  const providers = [
    new CodeMetricsCodeLensProvider(config)
  ];
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