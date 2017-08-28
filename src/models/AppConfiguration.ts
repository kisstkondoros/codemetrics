import { workspace } from 'vscode';
import { VSCodeMetricsConfiguration } from '../metrics/common/VSCodeMetricsConfiguration';

export class AppConfiguration {
  private cachedSettings: VSCodeMetricsConfiguration;
  constructor() {
    workspace.onDidChangeConfiguration(e => {
      this.cachedSettings = null;
    });
  }
  get extensionName() {
    return 'codemetrics';
  }
  public toggleCodeMetricsForArrowFunctionsExecuted: boolean = false;
  public codeMetricsForArrowFunctionsToggled: boolean = true;
  public codeMetricsDisplayed: boolean = true;

  get codeMetricsSettings(): VSCodeMetricsConfiguration {
    if (!this.cachedSettings) {
      var settings = workspace.getConfiguration(this.extensionName);
      this.cachedSettings = new VSCodeMetricsConfiguration();
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
      for (var propertyName in this.cachedSettings.LuaStatementMetricsConfiguration) {
        property = "luaconfiguration." + propertyName;
        if (settings.has(property)) {
          this.cachedSettings.LuaStatementMetricsConfiguration[propertyName] = settings.get(property);
          continue;
        }
      }
    }
    if (this.toggleCodeMetricsForArrowFunctionsExecuted) {
      this.cachedSettings.MetricsForArrowFunctionsToggled = this.codeMetricsForArrowFunctionsToggled;
    }
    return this.cachedSettings;
  }

}