import * as core from '@actions/core';
import {getInputs} from './input-helper';
import {cicheck, pdfReport, sarifReport, upload, whoami} from './tool';
import {Outputs, RiskThresholdOptions, SarifOptions} from './constants';
import {run} from './run';

jest.mock('@actions/core', () => ({
  exportVariable: jest.fn(),
  setOutput: jest.fn(),
  warning: jest.fn(),
  setFailed: jest.fn()
}));
jest.mock('./input-helper');
jest.mock('./tool');

const mockedCore = core as jest.Mocked<typeof core>;
const mockedGetInputs = getInputs as jest.MockedFunction<typeof getInputs>;
const mockedWhoami = whoami as jest.MockedFunction<typeof whoami>;
const mockedUpload = upload as jest.MockedFunction<typeof upload>;
const mockedSarifReport = sarifReport as jest.MockedFunction<
  typeof sarifReport
>;
const mockedCicheck = cicheck as jest.MockedFunction<typeof cicheck>;
const mockedPdfReport = pdfReport as jest.MockedFunction<typeof pdfReport>;

describe('run', () => {
  beforeEach(() => {
    mockedGetInputs.mockReturnValue({
      appknoxAccessToken: 'token',
      filePath: 'app.apk',
      riskThreshold: RiskThresholdOptions.HIGH,
      sarif: SarifOptions.Disable,
      sastTimeout: 30,
      triggerKnoxiq: false,
      generatePdfReport: false
    });
    mockedWhoami.mockResolvedValue();
    mockedUpload.mockResolvedValue(101);
    mockedCicheck.mockResolvedValue();
    mockedPdfReport.mockResolvedValue({
      pdfPath: '/workspace/reports/101/report_101.pdf',
      passwordPath: '/workspace/reports/101/report_101_password.txt'
    });
  });

  it('does not run report commands when PDF reporting is disabled', async () => {
    await run();

    expect(mockedUpload).toHaveBeenCalledWith('app.apk', false);
    expect(mockedSarifReport).not.toHaveBeenCalled();
    expect(mockedPdfReport).not.toHaveBeenCalled();
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
  });

  it('publishes report outputs after a successful download', async () => {
    mockedGetInputs.mockReturnValue({
      ...mockedGetInputs(),
      triggerKnoxiq: true,
      generatePdfReport: true
    });

    await run();

    expect(mockedUpload).toHaveBeenCalledWith('app.apk', true);
    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      Outputs.PdfReportPath,
      '/workspace/reports/101/report_101.pdf'
    );
    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      Outputs.PdfReportPasswordPath,
      '/workspace/reports/101/report_101_password.txt'
    );
  });

  it('warns without failing when only PDF reporting fails', async () => {
    mockedGetInputs.mockReturnValue({
      ...mockedGetInputs(),
      generatePdfReport: true
    });
    mockedPdfReport.mockRejectedValue(new Error('report unavailable'));

    await run();

    expect(mockedCore.warning).toHaveBeenCalledWith(
      'PDF report download failed: report unavailable'
    );
    expect(mockedCore.setFailed).not.toHaveBeenCalled();
  });

  it('attempts reporting before restoring a CI check failure', async () => {
    mockedGetInputs.mockReturnValue({
      ...mockedGetInputs(),
      generatePdfReport: true
    });
    mockedCicheck.mockRejectedValue(new Error('vulnerabilities detected'));

    await run();

    expect(mockedPdfReport).toHaveBeenCalledWith(101);
    expect(mockedCore.setOutput).toHaveBeenCalled();
    expect(mockedCore.setFailed).toHaveBeenCalledWith(
      'vulnerabilities detected'
    );
  });

  it('preserves the CI check failure when reporting also fails', async () => {
    mockedGetInputs.mockReturnValue({
      ...mockedGetInputs(),
      generatePdfReport: true
    });
    mockedCicheck.mockRejectedValue(new Error('vulnerabilities detected'));
    mockedPdfReport.mockRejectedValue(new Error('report unavailable'));

    await run();

    expect(mockedCore.warning).toHaveBeenCalledWith(
      'PDF report download failed: report unavailable'
    );
    expect(mockedCore.setFailed).toHaveBeenCalledWith(
      'vulnerabilities detected'
    );
  });
});
