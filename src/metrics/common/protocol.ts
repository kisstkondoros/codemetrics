import { RequestType, Range } from "vscode-languageserver";
import { IMetricsModel } from "tsmetrics-core";
import { IVSCodeMetricsConfiguration } from "./VSCodeMetricsConfiguration";

export class RequestData {
    configuration: IVSCodeMetricsConfiguration;
    uri: string;
}

export const MetricsRequestType: RequestType<RequestData, IMetricsModel[], any, any> = new RequestType(
    "codemetrics/metrics"
);
