import {MetricsConfiguration} from 'tsmetrics-core/MetricsConfiguration';
export class VSCodeMetricsConfiguration extends MetricsConfiguration {
  EnabledForJS = true;
  EnabledForJSX = true;
  EnabledForTS = true;
  EnabledForTSX = true;
  DecorationModeEnabled = true;
  CodeLensEnabled = true;

  FileSizeLimitMB = 0.5;
}