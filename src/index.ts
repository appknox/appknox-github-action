import * as core from '@actions/core';
import {cicheck, upload, whoami} from './tool';
import {getInputs} from './input-helper';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    core.exportVariable('APPKNOX_ACCESS_TOKEN', inputs.appknoxAccessToken);
    await whoami();
    const fileID = await upload(inputs.filePath);
    await cicheck(inputs.riskThreshold, fileID);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
