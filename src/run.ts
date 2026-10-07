import * as core from '@actions/core';
import {cicheck, pdfReport, sarifReport, upload, whoami} from './tool';
import {Outputs} from './constants';
import {getInputs} from './input-helper';

export async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);
    await whoami();
    const fileID = await upload(inputs.filePath, inputs.triggerKnoxiq);
    const sarif = inputs.sarif;
    const sastTimeout = inputs.sastTimeout;

    let sarifError: unknown;
    if (sarif === 'Enable') {
      try {
        await sarifReport(fileID);
      } catch (err) {
        sarifError = err;
      }
    }

    let ciCheckError: unknown;
    try {
      await cicheck(
        inputs.riskThreshold,
        fileID,
        sastTimeout,
        inputs.healthScore
      );
    } catch (err) {
      ciCheckError = err;
    }

    if (inputs.generatePdfReport) {
      try {
        const reportPaths = await pdfReport(fileID);
        core.setOutput(Outputs.PdfReportPath, reportPaths.pdfPath);
        core.setOutput(Outputs.PdfReportPasswordPath, reportPaths.passwordPath);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        core.warning(`PDF report download failed: ${message}`);
      }
    }

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
