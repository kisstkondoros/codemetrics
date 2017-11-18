import { MetricsConfiguration } from 'tsmetrics-core/MetricsConfiguration';
import { LuaStatementMetricsConfiguration } from './LuaStatementMetricsConfiguration';
export class VSCodeMetricsConfiguration extends MetricsConfiguration {
  Exclude = [];
  EnabledForLua = true;
  EnabledForJS = true;
  EnabledForJSX = true;
  EnabledForTS = true;
  EnabledForTSX = true;
  EnabledForVue = true;
  EnabledForHTML = true;
  DecorationModeEnabled = true;
  OverviewRulerModeEnabled = true;
  CodeLensEnabled = true;
  DiagnosticsEnabled = false;

  FileSizeLimitMB = 0.5;
  LuaStatementMetricsConfiguration = new LuaStatementMetricsConfiguration();
}