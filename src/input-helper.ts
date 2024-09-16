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

  const riskThresholdInput = core.getInput(Inputs.RiskThreshold) || RiskThresholdOptions.LOW;
  const riskThreshold: RiskThresholdOptions =
    RiskThresholdOptions[riskThresholdInput];

  if (!riskThreshold) {
    core.setFailed(
      `Unrecognized ${
        Inputs.RiskThreshold
      } input. Provided: ${riskThreshold}. Available options: ${Object.keys(
        RiskThresholdOptions
      )}`
    );
  }

  const region = core.getInput(Inputs.Region) || 'secure.appknox.com';  // Default to the standard Region

  const inputs = {
    appknoxAccessToken: accessToken,
    filePath: path,
    riskThreshold: riskThreshold,
    sarif: sarifString,
    region: region  // Include the region in the inputs
  } as AppknoxInputs;

  return inputs;
}
