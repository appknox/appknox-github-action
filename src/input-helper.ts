import * as core from '@actions/core';
import {Inputs, RiskThresholdOptions, SarifOptions} from './constants';
import {AppknoxInputs} from './appknox-inputs';

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): AppknoxInputs {
  const accessToken = core.getInput(Inputs.AppknoxAccessToken, {
    required: true
  });
  const path = core.getInput(Inputs.Path, {required: true});
  const sastTimeout= core.getInput(Inputs.SastTimeout, { required: false }) || 30  // Default to 30 minutes if not specified
  const sarifStringInput = core.getInput(Inputs.Sarif) || SarifOptions.Disable;
  const sarifString: SarifOptions = SarifOptions[sarifStringInput];

  if (!sarifString) {
    core.setFailed(
      `Unrecognized ${
        Inputs.Sarif
      } input. Provided: ${sarifString}. Available options: ${Object.keys(
        SarifOptions
      )}`
    );
  }

  const riskThresholdInput = core.getInput(Inputs.RiskThreshold);
  const healthScoreInput = core.getInput(Inputs.HealthScore);

  if (riskThresholdInput && healthScoreInput) {
    core.setFailed(
      'Only one of risk_threshold or health_score may be provided, not both.'
    );
  }

  if (!riskThresholdInput && !healthScoreInput) {
    core.setFailed(
      'At least one of risk_threshold or health_score must be provided.'
    );
  }

  let riskThreshold: RiskThresholdOptions | undefined;
  let healthScore: number | undefined;

  if (riskThresholdInput) {
    riskThreshold = RiskThresholdOptions[riskThresholdInput];
    if (!riskThreshold) {
      core.setFailed(
        `Unrecognized ${
          Inputs.RiskThreshold
        } input. Provided: ${riskThresholdInput}. Available options: ${Object.keys(
          RiskThresholdOptions
        )}`
      );
    }
  }

  if (healthScoreInput) {
    const parsed = Number(healthScoreInput);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      core.setFailed(
        `Invalid ${Inputs.HealthScore} input. Provided: ${healthScoreInput}. Must be a number between 0 and 100.`
      );
    }
    healthScore = parsed;
  }

  const inputs = {
    appknoxAccessToken: accessToken,
    filePath: path,
    riskThreshold: riskThreshold,
    healthScore: healthScore,
    sarif: sarifString,
    sastTimeout: sastTimeout
  } as AppknoxInputs;

  return inputs;
}
