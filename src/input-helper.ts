import * as core from '@actions/core';
import {Inputs, RiskThresholdOptions} from './constants';
import {AppknoxInputs} from './appknox-inputs';

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): AppknoxInputs {
  const accessToken = core.getInput(Inputs.AppknoxAccessToken, {
    required: true
  });
  const path = core.getInput(Inputs.Path, {required: true});

  const riskThresholdInput =
    core.getInput(Inputs.RiskThreshold) || RiskThresholdOptions.LOW;
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

  const inputs = {
    appknoxAccessToken: accessToken,
    filePath: path,
    riskThreshold: riskThreshold
  } as AppknoxInputs;
  return inputs;
}
