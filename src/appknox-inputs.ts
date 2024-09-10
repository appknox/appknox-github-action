import {RiskThresholdOptions, SarifOptions} from './constants';

export interface AppknoxInputs {
  appknoxAccessToken: string;
  filePath: string;
  riskThreshold: RiskThresholdOptions;
  sarif: SarifOptions;
  region?: string;  // Optional Region parameter
}
