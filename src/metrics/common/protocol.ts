import { RequestType, Range } from 'vscode-languageserver';
import { IMetricsModel } from "tsmetrics-core";
import { VSCodeMetricsConfiguration } from "./VSCodeMetricsConfiguration";

export class RequestData {
  configuration: VSCodeMetricsConfiguration;
  uri: string;
}

export const MetricsRequestType: RequestType<RequestData, IMetricsModel[], any> = { get method() { return 'codemetrics/metrics'; } };