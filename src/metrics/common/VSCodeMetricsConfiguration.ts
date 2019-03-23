import { IMetricsConfiguration, MetricsConfiguration } from "tsmetrics-core";
import { getInitialLuaStatementMetricsConfiguration } from "./LuaStatementMetricsConfiguration";

const VSCodeMetricsConfigurationDefaults = {
    Exclude: [],
    EnabledForLua: true,
    EnabledForJS: true,
    EnabledForJSX: true,
    EnabledForTS: true,
    EnabledForTSX: true,
    EnabledForVue: true,
    EnabledForHTML: true,
    DecorationModeEnabled: true,
    DecorationTemplate: "<svg xmlns='http://www.w3.org/2000/svg' width='{{size}}px' height='{{size}}px' viewbox='0 0 {{size}} {{size}}'><rect width='{{size}}' height='{{size}}' style='fill:{{color}};stroke-width:1;stroke:#fff'/></svg>",
    OverviewRulerModeEnabled: true,
    CodeLensEnabled: true,
    DiagnosticsEnabled: false,

    ComplexityColorLow: "#4bb14f",
    ComplexityColorNormal: "#ffc208",
    ComplexityColorHigh: "#f44034",
    ComplexityColorExtreme: "#ff0000",

    FileSizeLimitMB: 0.5,
    LuaStatementMetricsConfiguration: getInitialLuaStatementMetricsConfiguration()
};

export type IVSCodeMetricsConfiguration = Partial<typeof VSCodeMetricsConfigurationDefaults> & IMetricsConfiguration;

export const getInitialVSCodeMetricsConfiguration: () => IVSCodeMetricsConfiguration = () => {
    return {
        ...MetricsConfiguration,
        ...VSCodeMetricsConfigurationDefaults
    };
};
