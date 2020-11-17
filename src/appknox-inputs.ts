import {RiskThresholdOptions} from './constants';

export interface AppknoxInputs {
  /**
   * Pesonal Access token on Appknox
   */
  appknoxAccessToken: string;

  /**
   * Path to the mobile application binary (apk/ipa)
   */
  filePath: string;

  /**
   * Minimum risk to fail CI
   */
  riskThreshold: RiskThresholdOptions;
}
