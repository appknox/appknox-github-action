export enum Inputs {
  AppknoxAccessToken = 'appknox_access_token',
  Path = 'file_path',
  RiskThreshold = 'risk_threshold'
}

export enum RiskThresholdOptions {
  /**
   * Default. Fail the action if risk is "LOW" or higher
   */
  LOW = 'LOW',

  /**
   * Fail the action if risk is "MEDIUM" or higher
   */
  MEDIUM = 'MEDIUM',

  /**
   * Fail the action if risk is "HIGH" or higher
   */
  HIGH = 'HIGH',

  /**
   * Fail the action if risk is "CRITICAL"
   */
  CRITICAL = 'CRITICAL'
}

export const binaryVersion = '1.2.0';
