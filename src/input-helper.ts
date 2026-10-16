import * as core from '@actions/core';
import {
  ExploitLikelihoodOptions,
  Inputs,
  RiskThresholdOptions,
  SarifOptions,
  ThresholdTypeOptions
} from './constants';
import {AppknoxInputs, Threshold} from './appknox-inputs';

/**
 * Helper to get all the inputs for the action
 */
export function getInputs(): AppknoxInputs {
  const accessToken = core.getInput(Inputs.AppknoxAccessToken, {
    required: true
  });
  const path = core.getInput(Inputs.Path, {required: true});
  const sastTimeout =
    core.getInput(Inputs.SastTimeout, {required: false}) || 30; // Default to 30 minutes if not specified
  const sarifStringInput = core.getInput(Inputs.Sarif) || SarifOptions.Disable;
  const sarifString: SarifOptions = SarifOptions[sarifStringInput];
  const triggerKnoxiq = core.getBooleanInput(Inputs.TriggerKnoxiq);
  const generatePdfReport = core.getBooleanInput(Inputs.GeneratePdfReport);

  if (!sarifString) {
    throw new Error(
      `Unrecognized ${
        Inputs.Sarif
      } input. Provided: ${sarifStringInput}. Available options: ${Object.keys(
        SarifOptions
      )}`
    );
  }

  const threshold = resolveThreshold();

  const inputs = {
    appknoxAccessToken: accessToken,
    filePath: path,
    threshold: threshold,
    sarif: sarifString,
    sastTimeout: sastTimeout,
    triggerKnoxiq: triggerKnoxiq,
    generatePdfReport: generatePdfReport
  } as AppknoxInputs;

  return inputs;
}

/**
 * Resolves the single threshold to enforce. When threshold_type is not set,
 * the type is inferred from risk_threshold / health_score for backward
 * compatibility. When it is set, exactly one matching value is expected.
 */
function resolveThreshold(): Threshold {
  const thresholdTypeInput = core.getInput(Inputs.ThresholdType);
  const riskThresholdInput = core.getInput(Inputs.RiskThreshold);
  const healthScoreInput = core.getInput(Inputs.HealthScore);
  const exploitLikelihoodInput = core.getInput(
    Inputs.ExploitLikelihoodThreshold
  );

  if (exploitLikelihoodInput && !thresholdTypeInput) {
    throw new Error(
      `${Inputs.ExploitLikelihoodThreshold} requires ${Inputs.ThresholdType}: ${ThresholdTypeOptions.EXPLOIT_LIKELIHOOD}`
    );
  }

  if (!thresholdTypeInput) {
    return resolveInferredThreshold(riskThresholdInput, healthScoreInput);
  }

  const thresholdType = ThresholdTypeOptions[thresholdTypeInput];
  if (!thresholdType) {
    throw new Error(
      `Unrecognized ${
        Inputs.ThresholdType
      } input. Provided: ${thresholdTypeInput}. Available options: ${Object.keys(
        ThresholdTypeOptions
      )}`
    );
  }

  const strayThresholds = getStrayThresholds(thresholdType, {
    [Inputs.RiskThreshold]: riskThresholdInput,
    [Inputs.HealthScore]: healthScoreInput,
    [Inputs.ExploitLikelihoodThreshold]: exploitLikelihoodInput
  });
  if (strayThresholds.length > 0) {
    throw new Error(
      `${Inputs.ThresholdType} is ${thresholdType} but ${strayThresholds.join(
        ' and '
      )} was also provided. Pick exactly one threshold.`
    );
  }

  switch (thresholdType) {
    case ThresholdTypeOptions.RISK: {
      if (!riskThresholdInput) {
        core.warning(
          `${Inputs.ThresholdType} is ${ThresholdTypeOptions.RISK} but ${Inputs.RiskThreshold} was not provided. Defaulting to ${Inputs.RiskThreshold}: ${RiskThresholdOptions.LOW}.`
        );
        return {type: thresholdType, value: RiskThresholdOptions.LOW};
      }
      return {
        type: thresholdType,
        value: parseRiskThreshold(riskThresholdInput)
      };
    }
    case ThresholdTypeOptions.HEALTH_SCORE: {
      if (!healthScoreInput) {
        throw new Error(
          `${Inputs.ThresholdType} is ${ThresholdTypeOptions.HEALTH_SCORE} but ${Inputs.HealthScore} was not provided.`
        );
      }
      return {type: thresholdType, value: parseHealthScore(healthScoreInput)};
    }
    case ThresholdTypeOptions.EXPLOIT_LIKELIHOOD: {
      if (!exploitLikelihoodInput) {
        throw new Error(
          `${Inputs.ThresholdType} is ${ThresholdTypeOptions.EXPLOIT_LIKELIHOOD} but ${Inputs.ExploitLikelihoodThreshold} was not provided.`
        );
      }
      const exploitLikelihood =
        ExploitLikelihoodOptions[exploitLikelihoodInput];
      if (!exploitLikelihood) {
        throw new Error(
          `Unrecognized ${
            Inputs.ExploitLikelihoodThreshold
          } input. Provided: ${exploitLikelihoodInput}. Available options: ${Object.keys(
            ExploitLikelihoodOptions
          )}`
        );
      }
      return {type: thresholdType, value: exploitLikelihood};
    }
  }
  // Unreachable while the switch covers every ThresholdTypeOptions member
  throw new Error(
    `Unrecognized ${Inputs.ThresholdType} input: ${thresholdType}`
  );
}

/**
 * Threshold inputs that do not belong to the selected threshold type
 */
function getStrayThresholds(
  thresholdType: ThresholdTypeOptions,
  provided: Record<string, string>
): string[] {
  const others: Record<ThresholdTypeOptions, string[]> = {
    [ThresholdTypeOptions.RISK]: [
      Inputs.HealthScore,
      Inputs.ExploitLikelihoodThreshold
    ],
    [ThresholdTypeOptions.HEALTH_SCORE]: [
      Inputs.RiskThreshold,
      Inputs.ExploitLikelihoodThreshold
    ],
    [ThresholdTypeOptions.EXPLOIT_LIKELIHOOD]: [
      Inputs.RiskThreshold,
      Inputs.HealthScore
    ]
  };
  return others[thresholdType].filter(input => provided[input]);
}

/**
 * Legacy behavior when threshold_type is not set: infer the type from the
 * threshold value that was provided
 */
function resolveInferredThreshold(
  riskThresholdInput: string,
  healthScoreInput: string
): Threshold {
  if (riskThresholdInput && healthScoreInput) {
    throw new Error(
      'Only one of risk_threshold or health_score may be provided, not both.'
    );
  }

  if (riskThresholdInput) {
    return {
      type: ThresholdTypeOptions.RISK,
      value: parseRiskThreshold(riskThresholdInput)
    };
  }

  if (healthScoreInput) {
    return {
      type: ThresholdTypeOptions.HEALTH_SCORE,
      value: parseHealthScore(healthScoreInput)
    };
  }

  core.warning(
    'Neither threshold_type nor risk_threshold/health_score was provided. ' +
      'Defaulting to risk_threshold: LOW. Please explicitly set threshold_type in your workflow.'
  );
  return {type: ThresholdTypeOptions.RISK, value: RiskThresholdOptions.LOW};
}

function parseRiskThreshold(input: string): RiskThresholdOptions {
  const riskThreshold = RiskThresholdOptions[input];
  if (!riskThreshold) {
    throw new Error(
      `Unrecognized ${
        Inputs.RiskThreshold
      } input. Provided: ${input}. Available options: ${Object.keys(
        RiskThresholdOptions
      )}`
    );
  }
  return riskThreshold;
}

function parseHealthScore(input: string): number {
  const parsed = Number(input);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(
      `Invalid ${Inputs.HealthScore} input. Provided: ${input}. Must be a number between 0 and 100.`
    );
  }
  return parsed;
}
