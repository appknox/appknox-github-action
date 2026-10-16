import * as core from '@actions/core';
import {getInputs} from './input-helper';
import {
  ExploitLikelihoodOptions,
  Inputs,
  RiskThresholdOptions,
  SarifOptions,
  ThresholdTypeOptions
} from './constants';

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  warning: jest.fn()
}));

const mockedCore = core as jest.Mocked<typeof core>;

function mockInputValues(overrides: Record<string, string> = {}): void {
  mockedCore.getInput.mockImplementation((name: string) => {
    const values: Record<string, string> = {
      [Inputs.AppknoxAccessToken]: 'token',
      [Inputs.Path]: 'app.apk',
      [Inputs.RiskThreshold]: RiskThresholdOptions.HIGH,
      [Inputs.Sarif]: SarifOptions.Disable,
      [Inputs.SastTimeout]: '30',
      ...overrides
    };
    return values[name] || '';
  });
}

describe('getInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInputValues();
    mockedCore.getBooleanInput.mockReturnValue(false);
  });

  it('defaults KnoxIQ and PDF report options to false', () => {
    const inputs = getInputs();

    expect(inputs.triggerKnoxiq).toBe(false);
    expect(inputs.generatePdfReport).toBe(false);
    expect(mockedCore.getBooleanInput).toHaveBeenCalledWith(
      Inputs.TriggerKnoxiq
    );
    expect(mockedCore.getBooleanInput).toHaveBeenCalledWith(
      Inputs.GeneratePdfReport
    );
  });

  it('reads enabled KnoxIQ and PDF report options', () => {
    mockedCore.getBooleanInput.mockReturnValue(true);

    const inputs = getInputs();

    expect(inputs.triggerKnoxiq).toBe(true);
    expect(inputs.generatePdfReport).toBe(true);
  });

  it('infers the RISK threshold when threshold_type is not set', () => {
    const inputs = getInputs();

    expect(inputs.threshold).toEqual({
      type: ThresholdTypeOptions.RISK,
      value: RiskThresholdOptions.HIGH
    });
  });

  it('infers the HEALTH_SCORE threshold when threshold_type is not set', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.HealthScore]: '40'
    });

    const inputs = getInputs();

    expect(inputs.threshold).toEqual({
      type: ThresholdTypeOptions.HEALTH_SCORE,
      value: 40
    });
  });

  it('defaults to RISK with LOW value and warns when no threshold is set', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.HealthScore]: ''
    });

    const inputs = getInputs();

    expect(inputs.threshold).toEqual({
      type: ThresholdTypeOptions.RISK,
      value: RiskThresholdOptions.LOW
    });
    expect(mockedCore.warning).toHaveBeenCalled();
  });

  it('rejects risk_threshold and health_score together', () => {
    mockInputValues({[Inputs.HealthScore]: '40'});

    expect(() => getInputs()).toThrow(
      'Only one of risk_threshold or health_score'
    );
  });

  it('resolves the EXPLOIT_LIKELIHOOD threshold', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ThresholdType]: ThresholdTypeOptions.EXPLOIT_LIKELIHOOD,
      [Inputs.ExploitLikelihoodThreshold]: ExploitLikelihoodOptions.HIGH
    });

    const inputs = getInputs();

    expect(inputs.threshold).toEqual({
      type: ThresholdTypeOptions.EXPLOIT_LIKELIHOOD,
      value: ExploitLikelihoodOptions.HIGH
    });
  });

  it('rejects exploit_likelihood_threshold without threshold_type', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ExploitLikelihoodThreshold]: ExploitLikelihoodOptions.HIGH
    });

    expect(() => getInputs()).toThrow(
      'exploit_likelihood_threshold requires threshold_type'
    );
  });

  it('rejects EXPLOIT_LIKELIHOOD without exploit_likelihood_threshold', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ThresholdType]: ThresholdTypeOptions.EXPLOIT_LIKELIHOOD
    });

    expect(() => getInputs()).toThrow(
      'exploit_likelihood_threshold was not provided'
    );
  });

  it('rejects an unrecognized threshold_type', () => {
    mockInputValues({
      [Inputs.ThresholdType]: 'SEVERITY'
    });

    expect(() => getInputs()).toThrow('Unrecognized threshold_type input');
  });

  it('rejects an invalid exploit_likelihood_threshold value', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ThresholdType]: ThresholdTypeOptions.EXPLOIT_LIKELIHOOD,
      [Inputs.ExploitLikelihoodThreshold]: 'CRITICAL'
    });

    expect(() => getInputs()).toThrow(
      'Unrecognized exploit_likelihood_threshold input'
    );
  });

  it('rejects threshold values that do not match threshold_type', () => {
    mockInputValues({
      [Inputs.ThresholdType]: ThresholdTypeOptions.RISK,
      [Inputs.HealthScore]: '40'
    });

    expect(() => getInputs()).toThrow('Pick exactly one threshold');
  });

  it('defaults RISK to LOW with a warning when threshold_type has no value', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ThresholdType]: ThresholdTypeOptions.RISK
    });

    const inputs = getInputs();

    expect(inputs.threshold).toEqual({
      type: ThresholdTypeOptions.RISK,
      value: RiskThresholdOptions.LOW
    });
    expect(mockedCore.warning).toHaveBeenCalled();
  });

  it('rejects HEALTH_SCORE without health_score', () => {
    mockInputValues({
      [Inputs.RiskThreshold]: '',
      [Inputs.ThresholdType]: ThresholdTypeOptions.HEALTH_SCORE
    });

    expect(() => getInputs()).toThrow('health_score was not provided');
  });
});
