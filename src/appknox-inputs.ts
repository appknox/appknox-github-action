import {RiskThresholdOptions, SarifOptions} from './constants';

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
  riskThreshold?: RiskThresholdOptions;

  /**
   * Health score threshold (0-100). Mutually exclusive with riskThreshold.
   */
  healthScore?: number;

  /**
   * Enable SARIF format
   */
  sarif: SarifOptions;
  /**
   * Timeout duration in minutes for the static scan
   */
  sastTimeout: number;
}
