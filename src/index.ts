import * as core from '@actions/core';
import {cicheck, upload, whoami, sarifReport} from './tool';
import {getInputs} from './input-helper';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);
    await whoami();
    const fileID = await upload(inputs.filePath);
    const sarif = inputs.sarif;
    const timeout=inputs.timeout;
    if (sarif == 'Enable'){
      await sarifReport(fileID);
    }
    await cicheck(inputs.riskThreshold, fileID, timeout);
  } catch (err: any) {
      core.setFailed(err.message);
  }
}

run();