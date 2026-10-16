import {
  ExploitLikelihoodOptions,
  RiskThresholdOptions,
  SarifOptions,
  ThresholdTypeOptions
} from './constants';

/**
 * The single threshold the CI check enforces. The type decides which value is
 * expected, so exactly one threshold can ever be selected.
 */
export type Threshold =
  | {type: ThresholdTypeOptions.RISK; value: RiskThresholdOptions}
  | {type: ThresholdTypeOptions.HEALTH_SCORE; value: number}
  | {
      type: ThresholdTypeOptions.EXPLOIT_LIKELIHOOD;
      value: ExploitLikelihoodOptions;
    };

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
   * Threshold to enforce during the CI check
   */
  threshold: Threshold;

  /**
   * Enable SARIF format
   */
  sarif: SarifOptions;
  /**
   * Timeout duration in minutes for the static scan
   */
  sastTimeout: number;

  /**
   * Request KnoxIQ triage during upload
   */
  triggerKnoxiq: boolean;

  /**
   * Download the password-protected PDF report after the CI check
   */
  generatePdfReport: boolean;
}
