import * as core from '@actions/core';
import {getInputs} from './input-helper';
import {Inputs, RiskThresholdOptions, SarifOptions} from './constants';

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  getBooleanInput: jest.fn(),
  warning: jest.fn()
}));

const mockedCore = core as jest.Mocked<typeof core>;

describe('getInputs', () => {
  beforeEach(() => {
    mockedCore.getInput.mockImplementation((name: string) => {
      const values: Record<string, string> = {
        [Inputs.AppknoxAccessToken]: 'token',
        [Inputs.Path]: 'app.apk',
        [Inputs.RiskThreshold]: RiskThresholdOptions.HIGH,
        [Inputs.Sarif]: SarifOptions.Disable,
        [Inputs.SastTimeout]: '30'
      };
      return values[name] || '';
    });
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
});
