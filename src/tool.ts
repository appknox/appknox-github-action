import path from 'path';
import fs from 'fs';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import { binaryVersion, RiskThresholdOptions } from './constants';

interface AppknoxBinaryConfig {
  name: string;
}

type OSAppknoxBinaryMap = Record<string, AppknoxBinaryConfig>;

const supportedOS: OSAppknoxBinaryMap = {
  linux: { name: 'appknox-Linux-x86_64' },
  darwin: { name: 'appknox-Darwin-x86_64' },
  win32: { name: 'appknox-Windows-x86_64.exe' }
};

function getAppknoxDownloadURL(os: string): string {
  if (!(os in supportedOS)) {
    throw Error(`Unsupported os ${os}`);
  }
  const binaryName = supportedOS[os].name;
  return `https://github.com/appknox/appknox-go/releases/download/${binaryVersion}/${binaryName}`;
}

async function downloadAppknoxCLI(platform: NodeJS.Platform) {
  const url = getAppknoxDownloadURL(platform);
  const appknoxPath = await tc.downloadTool(url);
  fs.chmodSync(appknoxPath, '755');
  return appknoxPath;
}

async function getAppknoxToolPath() {
  const foundPath = tc.find('appknox', binaryVersion);
  if (foundPath) {
    return path.join(foundPath, 'appknox');
  }
  const appknoxPath = await downloadAppknoxCLI(process.platform);
  await tc.cacheFile(appknoxPath, 'appknox', 'appknox', binaryVersion);
  return path.join(tc.find('appknox', binaryVersion), 'appknox');
}

interface ExecOutput {
  output: string;
  err: string;
  code: number;
}

async function execBinary(
  path: string,
  args: Array<string>,
  apiHost?: string // Optional apiHost parameter
): Promise<ExecOutput> {
  let output = '';
  let err = '';

  const filteredEnv: { [key: string]: string } = {};
  for (const key in process.env) {
    if (process.env[key] !== undefined) {
      filteredEnv[key] = process.env[key] as string;
    }
  }

  // Add the API host to the environment if provided
  if (apiHost) {
    filteredEnv['APPKNOX_API_HOST'] = apiHost;
  }

  const options = {
    listeners: {},
    ignoreReturnCode: true,
    env: filteredEnv // Use the filtered environment variables
  };

  options.listeners = {
    stdout: (data: Buffer) => {
      output += data.toString();
    },
    stderr: (data: Buffer) => {
      err += data.toString();
    }
  };
  const errCode = await exec.exec(path, args, options);
  return {
    output: output,
    err: err,
    code: errCode
  };
}

export async function whoami(apiHost?: string): Promise<void> {
  const toolPath = await getAppknoxToolPath();
  const combinedOutput = await execBinary(toolPath, ['whoami'], apiHost);
  if (combinedOutput.err.indexOf('Invalid token') > -1) {
    throw new Error('Invalid token');
  }
}

export async function upload(file_path: string, apiHost?: string): Promise<number> {
  const toolPath = await getAppknoxToolPath();
  const combinedOutput = await execBinary(toolPath, ['upload', file_path], apiHost);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(_ => _);
    throw new Error(errArr[errArr.length - 1]);
  }
  return Number.parseInt(combinedOutput.output);
}

export async function sarifReport(
  fileID: number,
  apiHost?: string
): Promise<ExecOutput> {
  const toolPath = await getAppknoxToolPath();
  const args = [
    'sarif',
    fileID.toString(),
  ];
  const combinedOutput = await execBinary(toolPath, args, apiHost);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(_ => _);
    const outArr = combinedOutput.output.split('\n').filter(_ => _);
    const errMes = errArr[errArr.length - 1];
    const outMes = outArr[outArr.length - 1];
    throw new Error(errMes + '. ' + outMes);
  }
  return combinedOutput;
}

export async function cicheck(
  riskThreshold: RiskThresholdOptions,
  fileID: number,
  apiHost?: string
): Promise<void> {
  const toolPath = await getAppknoxToolPath();
  const args = [
    'cicheck',
    fileID.toString(),
    '--risk-threshold',
    riskThreshold
  ];
  const combinedOutput = await execBinary(toolPath, args, apiHost);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(_ => _);
    const outArr = combinedOutput.output.split('\n').filter(_ => _);
    const errMes = errArr[errArr.length - 1];
    const outMes = outArr[outArr.length - 1];
    throw new Error(errMes + '. ' + outMes);
  }
}
