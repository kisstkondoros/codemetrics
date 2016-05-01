import * as vscode from 'vscode';
import {Disposable, DocumentSelector, languages, commands} from 'vscode';
import {CodeMetricsCodeLensProvider} from './providers/CodeMetricsCodeLensProvider';
import {AppConfiguration} from './models/AppConfiguration';
import {CodeMetricsParser} from './common/CodeMetricsParser';
import {CodeMetricsCodeLens} from './models/CodeMetricsCodeLens';

export function activate(context) {
  const config:AppConfiguration = new AppConfiguration();
  const disposables = [];
  let channel = vscode.window.createOutputChannel("CodeMetrics");
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
  disposables.push(commands.registerCommand("ShowCodeMetricsCodeLensInfo", (codelens:CodeMetricsCodeLens)=>{
    channel.show();
    channel.clear();
    channel.append(codelens.getExplanation(config));
  }))


  context.subscriptions.push(...disposables);
}