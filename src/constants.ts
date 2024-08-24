export enum Inputs {
  AppknoxAccessToken = 'appknox_access_token',
  Path = 'file_path',
  RiskThreshold = 'risk_threshold',
  Sarif = 'sarif',
  ApiHost = 'api_host'  // New input for API Host
}

export enum SarifOptions {
  Enable = 'Enable',
  Disable = 'Disable'
}

export enum RiskThresholdOptions {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export const binaryVersion = '1.4.1';
