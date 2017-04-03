import {CodeLens, Range} from 'vscode';
import {IMetricsModel} from 'tsmetrics-core';
import {MetricsConfiguration} from 'tsmetrics-core/MetricsConfiguration';
import {AppConfiguration} from '../models/AppConfiguration';

export class CodeMetricsCodeLens extends CodeLens {
  private model: IMetricsModel;
  constructor(model: IMetricsModel, range: Range) {
    super(range);
    this.model = model;
  }

  public getSumComplexity(): number {
    return this.model.getSumComplexity();
  }

  public toString(appConfig: AppConfiguration): string {
    return this.model.toString(appConfig.codeMetricsSettings);
  }

  public getExplanation(appConfig: AppConfiguration): string {
    return this.model.getExplanation();
  }

  public getChildren() {
    return this.model.children;
  }
}