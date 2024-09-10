import * as core from '@actions/core';
import { cicheck, upload, whoami, sarifReport } from './tool';
import { getInputs } from './input-helper';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);

    // Log the region value
    core.info(`Region: ${inputs.region}`);

    // Set the Region if provided
    if (inputs.region) {
      core.exportVariable('APPKNOX_REGION', inputs.region);
    }

    // Ensure Region is used in the whoami function or any other function that requires it
    await whoami(inputs.region);

    // Upload file and get file ID
    const fileID = await upload(inputs.filePath, inputs.region);

    // Generate SARIF report if enabled
    if (inputs.sarif === 'Enable') {
      await sarifReport(fileID, inputs.region);
    }

    // Run CICheck with the specified risk threshold
    await cicheck(inputs.riskThreshold, fileID, inputs.region);

  } catch (err: any) {
    core.setFailed(err.message);
  }
}

run();
