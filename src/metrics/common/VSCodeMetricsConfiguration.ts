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
    OverviewRulerModeEnabled: true,
    CodeLensEnabled: true,
    DiagnosticsEnabled: false,

    ComplexityColorLow: "#4bb14f",
    ComplexityColorNormal: "#ffc208",
    ComplexityColorHigh: "#f44034",
    ComplexityColorExtreme: "ff0000",

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
