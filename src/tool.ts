import path from 'path';
import fs from 'fs';
import * as tc from '@actions/tool-cache';
import * as exec from '@actions/exec';
import {binaryVersion, RiskThresholdOptions} from './constants';

interface AppknoxBinaryConfig {
  name: string;
}
type OSAppknoxBinaryMap = Record<string, AppknoxBinaryConfig>;

const supportedOS: OSAppknoxBinaryMap = {
  linux: {
    name: 'appknox-Linux-x86_64'
  },
  darwin: {
    name: 'appknox-Darwin-x86_64'
  },
  win32: {
    name: 'appknox-Windows-x86_64.exe'
  }
};

/**
 * Gets appknox binary download url
 * @param os
 * @returns url
 */
function getAppknoxDownloadURL(os: string): string {
  if (!(os in supportedOS)) {
    throw new Error(`Unsupported os ${os}`);
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

export interface ExecOutput {
  output: string;
  err: string;
  code: number;
}

async function execBinary(
  path: string,
  args: Array<string>
): Promise<ExecOutput> {
  let output = '';
  let err = '';

  const options = {
    listeners: {},
    ignoreReturnCode: true
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

export async function whoami(): Promise<void> {
  const toolPath = await getAppknoxToolPath();
  const combinedOutput = await execBinary(toolPath, ['whoami']);
  if (combinedOutput.err.indexOf('Invalid token') > -1) {
    throw new Error('Invalid token');
  }
}

export async function upload(
  file_path: string,
  triggerKnoxiq = false
): Promise<number> {
  const toolPath = await getAppknoxToolPath();
  const args = ['upload', file_path];
  if (triggerKnoxiq) {
    args.push('--knoxiq');
  }
  const combinedOutput = await execBinary(toolPath, args);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(Boolean);
    throw new Error(errArr[errArr.length - 1]);
  }
  const fileIDOutput = combinedOutput.output.trim();
  if (!/^\d+$/.test(fileIDOutput)) {
    throw new Error(
      `Upload did not return a valid numeric file ID. Output: ${
        fileIDOutput || '<empty>'
      }`
    );
  }
  return Number.parseInt(fileIDOutput, 10);
}

export async function sarifReport(fileID: number): Promise<ExecOutput> {
  const toolPath = await getAppknoxToolPath();
  const args = ['sarif', fileID.toString()];
  const combinedOutput = await execBinary(toolPath, args);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(Boolean);
    const outArr = combinedOutput.output.split('\n').filter(Boolean);
    const errMes = errArr[errArr.length - 1];
    const outMes = outArr[outArr.length - 1];
    throw new Error(errMes + '. ' + outMes);
  }
  return combinedOutput;
}

export interface PdfReportPaths {
  pdfPath: string;
  passwordPath: string;
}

/**
 * Creates and downloads the password-protected PDF report for a file.
 */
export async function pdfReport(fileID: number): Promise<PdfReportPaths> {
  const toolPath = await getAppknoxToolPath();
  const createResult = await execBinary(toolPath, [
    'reports',
    'create',
    fileID.toString()
  ]);
  const reportID = createResult.output.trim();

  if (createResult.code > 0) {
    const errArr = createResult.err.split('\n').filter(Boolean);
    throw new Error(errArr[errArr.length - 1] || 'Report creation failed');
  }
  if (!/^\d+$/.test(reportID)) {
    throw new Error('Report creation did not return a valid numeric report ID');
  }

  const downloadResult = await execBinary(toolPath, [
    'reports',
    'download',
    'pdf',
    reportID
  ]);
  if (downloadResult.code > 0) {
    const errArr = downloadResult.err.split('\n').filter(Boolean);
    throw new Error(errArr[errArr.length - 1] || 'PDF report download failed');
  }

  const reportDirectory = path.resolve('reports', fileID.toString());
  const pdfPath = path.join(reportDirectory, `report_${fileID}.pdf`);
  const passwordPath = path.join(
    reportDirectory,
    `report_${fileID}_password.txt`
  );

  if (!fs.existsSync(pdfPath) || !fs.existsSync(passwordPath)) {
    throw new Error(
      `PDF report download completed but expected files were not found in ${reportDirectory}`
    );
  }

  return {pdfPath, passwordPath};
}

export async function cicheck(
  riskThreshold: RiskThresholdOptions | undefined,
  fileID: number,
  sastTimeout: number,
  healthScore?: number
): Promise<void> {
  const toolPath = await getAppknoxToolPath();
  const args = [
    'cicheck',
    fileID.toString(),
    '--timeout',
    sastTimeout.toString()
  ];
  if (riskThreshold !== undefined) {
    args.push('--risk-threshold', riskThreshold);
  } else if (healthScore !== undefined) {
    args.push('--health-score-threshold', healthScore.toString());
  }
  const combinedOutput = await execBinary(toolPath, args);
  if (combinedOutput.code > 0) {
    const errArr = combinedOutput.err.split('\n').filter(Boolean);
    const outArr = combinedOutput.output.split('\n').filter(Boolean);
    const errMes = errArr[errArr.length - 1];
    const outMes = outArr[outArr.length - 1];
    throw new Error(errMes + '. ' + outMes);
  }
}
