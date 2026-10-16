export enum Inputs {
  AppknoxAccessToken = 'appknox_access_token',
  Path = 'file_path',
  RiskThreshold = 'risk_threshold',
  Sarif = 'sarif',
  SastTimeout = 'sast_timeout',
  HealthScore = 'health_score',
  ThresholdType = 'threshold_type',
  ExploitLikelihoodThreshold = 'exploit_likelihood_threshold',
  TriggerKnoxiq = 'trigger_knoxiq',
  GeneratePdfReport = 'generate_pdf_report'
}

export enum Outputs {
  PdfReportPath = 'pdf_report_path',
  PdfReportPasswordPath = 'pdf_report_password_path'
}

export enum SarifOptions {
  /**
   * Will upload the sarif report in codeQL
   */
  Enable = 'Enable',

  /**
   * Default. Will not upload the sarif report in codeQL
   */
  Disable = 'Disable'
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

export enum ThresholdTypeOptions {
  /**
   * Fail CI based on the CVSS risk threshold
   */
  RISK = 'RISK',

  /**
   * Fail CI based on the security health score
   */
  HEALTH_SCORE = 'HEALTH_SCORE',

  /**
   * Fail CI based on the KnoxIQ exploit likelihood of triaged vulnerabilities
   */
  EXPLOIT_LIKELIHOOD = 'EXPLOIT_LIKELIHOOD'
}

export enum ExploitLikelihoodOptions {
  /**
   * Fail CI when a triaged vulnerability has exploit likelihood LOW or higher
   */
  LOW = 'LOW',

  /**
   * Fail CI when a triaged vulnerability has exploit likelihood MEDIUM or higher
   */
  MEDIUM = 'MEDIUM',

  /**
   * Fail CI when a triaged vulnerability has exploit likelihood HIGH
   */
  HIGH = 'HIGH'
}

export const binaryVersion = '1.8.9';
