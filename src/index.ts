import * as core from '@actions/core';
import { cicheck, upload, whoami, sarifReport } from './tool';
import { getInputs } from './input-helper';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);

    // Log the api_host value
    core.info(`API Host: ${inputs.apiHost}`);

    // Set the API host if provided
    if (inputs.apiHost) {
      core.exportVariable('APPKNOX_API_HOST', inputs.apiHost);
    }

    // Ensure API host is used in the whoami function or any other function that requires it
    await whoami(inputs.apiHost);

    // Upload file and get file ID
    const fileID = await upload(inputs.filePath, inputs.apiHost);

    // Generate SARIF report if enabled
    if (inputs.sarif === 'Enable') {
      await sarifReport(fileID, inputs.apiHost);
    }

    // Run CICheck with the specified risk threshold
    await cicheck(inputs.riskThreshold, fileID, inputs.apiHost);

  } catch (err: any) {
    core.setFailed(err.message);
  }
}

run();
