import { MetricsConfiguration } from "tsmetrics-core/MetricsConfiguration";
import { LuaStatementMetricsConfiguration } from "./LuaStatementMetricsConfiguration";
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

    ComplexityColorLow = "#4bb14f";
    ComplexityColorNormal = "#ffc208";
    ComplexityColorHigh = "#f44034";
    ComplexityColorExtreme = "ff0000";

    FileSizeLimitMB = 0.5;
    LuaStatementMetricsConfiguration = new LuaStatementMetricsConfiguration();
}
