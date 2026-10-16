import * as core from '@actions/core';
import {cicheck, pdfReport, sarifReport, upload, whoami} from './tool';
import {Outputs, SarifOptions, ThresholdTypeOptions} from './constants';
import {AppknoxInputs} from './appknox-inputs';
import {getInputs} from './input-helper';

/**
 * Uploads the binary, forcing KnoxIQ triage when the exploit-likelihood
 * gate is selected (the gate only works against triaged results)
 */
async function uploadFile(inputs: AppknoxInputs): Promise<number> {
  const requestKnoxiq =
    inputs.triggerKnoxiq ||
    inputs.threshold.type === ThresholdTypeOptions.EXPLOIT_LIKELIHOOD;
  if (requestKnoxiq && !inputs.triggerKnoxiq) {
    core.info(
      'Requesting KnoxIQ triage automatically because threshold_type is EXPLOIT_LIKELIHOOD'
    );
  }
  return upload(inputs.filePath, requestKnoxiq);
}

/**
 * Runs the SARIF report when enabled, capturing any error so later steps
 * still run
 */
async function trySarif(sarif: SarifOptions, fileID: number): Promise<unknown> {
  if (sarif !== 'Enable') {
    return undefined;
  }
  try {
    await sarifReport(fileID);
    return undefined;
  } catch (err) {
    return err;
  }
}

/** Runs the CI check, capturing the error so reporting can still run */
async function tryCicheck(
  inputs: AppknoxInputs,
  fileID: number
): Promise<unknown> {
  try {
    await cicheck(fileID, inputs.threshold, inputs.sastTimeout);
    return undefined;
  } catch (err) {
    return err;
  }
}

/** Downloads the PDF report when enabled; failures warn instead of failing */
async function tryPdfReport(
  generatePdfReport: boolean,
  fileID: number
): Promise<void> {
  if (!generatePdfReport) {
    return;
  }
  try {
    const reportPaths = await pdfReport(fileID);
    core.setOutput(Outputs.PdfReportPath, reportPaths.pdfPath);
    core.setOutput(Outputs.PdfReportPasswordPath, reportPaths.passwordPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.warning(`PDF report download failed: ${message}`);
  }
}

export async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);
    await whoami();
    const fileID = await uploadFile(inputs);

    const sarifError = await trySarif(inputs.sarif, fileID);
    const ciCheckError = await tryCicheck(inputs, fileID);
    await tryPdfReport(inputs.generatePdfReport, fileID);

    // The CI check result outranks a SARIF failure
    if (ciCheckError) {
      throw ciCheckError;
    }
    if (sarifError) {
      throw sarifError;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    core.setFailed(message);
  }
}
