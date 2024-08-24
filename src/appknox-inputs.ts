import {RiskThresholdOptions, SarifOptions} from './constants';

export interface AppknoxInputs {
  appknoxAccessToken: string;
  filePath: string;
  riskThreshold: RiskThresholdOptions;
  sarif: SarifOptions;
  apiHost?: string;  // Optional API Host parameter
}
