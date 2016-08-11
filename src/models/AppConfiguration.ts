import {workspace} from 'vscode';
import {MetricsConfiguration} from 'tsmetrics-core/MetricsConfiguration';

export class AppConfiguration {
  private cachedSettings: MetricsConfiguration;
  constructor() {
    workspace.onDidChangeConfiguration(e => {
      this.cachedSettings = null;
    });
  }
  get extensionName() {
    return 'codemetrics';
  }

  public codeMetricsForArrowFunctionsToggled: boolean;
  public codeMetricsDisplayed: boolean = true;

  get codeMetricsSettings(): MetricsConfiguration {
    if (!this.cachedSettings) {
      var settings = workspace.getConfiguration(this.extensionName);
      this.cachedSettings = new MetricsConfiguration();
      for (var propertyName in this.cachedSettings) {
        var property = "nodeconfiguration." + propertyName;
        if (settings.has(property)) {
          this.cachedSettings[propertyName] = settings.get(property);
          continue;
        }
        property = "basics." + propertyName;
        if (settings.has(property)) {
          this.cachedSettings[propertyName] = settings.get(property);
          continue;
        }
      }
    }
    this.cachedSettings.MetricsForArrowFunctionsToggled = this.codeMetricsForArrowFunctionsToggled;
    return this.cachedSettings;
  }

}