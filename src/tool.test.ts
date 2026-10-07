import fs from 'fs';
import path from 'path';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';
import {pdfReport, upload} from './tool';

jest.mock('@actions/exec', () => ({exec: jest.fn()}));
jest.mock('@actions/tool-cache', () => ({
  find: jest.fn(),
  downloadTool: jest.fn(),
  cacheFile: jest.fn()
}));

const mockedExec = exec as jest.Mocked<typeof exec>;
const mockedToolCache = tc as jest.Mocked<typeof tc>;

function mockExecResults(
  results: Array<{stdout?: string; stderr?: string; code: number}>
): void {
  mockedExec.exec.mockImplementation(async (_command, _args, options) => {
    const result = results.shift();
    if (!result) {
      throw new Error('Unexpected CLI invocation');
    }
    if (result.stdout) {
      options?.listeners?.stdout?.(Buffer.from(result.stdout));
    }
    if (result.stderr) {
      options?.listeners?.stderr?.(Buffer.from(result.stderr));
    }
    return result.code;
  });
}

describe('Appknox CLI tools', () => {
  beforeEach(() => {
    mockedToolCache.find.mockReturnValue('/cached');
  });

  describe('upload', () => {
    it('adds --knoxiq only when requested', async () => {
      mockExecResults([
        {stdout: '101\n', code: 0},
        {stdout: '102\n', code: 0}
      ]);

      await upload('app.apk', true);
      await upload('app.apk', false);

      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        1,
        path.join('/cached', 'appknox'),
        ['upload', 'app.apk', '--knoxiq'],
        expect.any(Object)
      );
      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        2,
        path.join('/cached', 'appknox'),
        ['upload', 'app.apk'],
        expect.any(Object)
      );
    });
  });

  describe('pdfReport', () => {
    it('creates and downloads a PDF report and returns absolute paths', async () => {
      mockExecResults([{stdout: '456\n', code: 0}, {code: 0}]);
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await pdfReport(101);

      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        1,
        path.join('/cached', 'appknox'),
        ['reports', 'create', '101'],
        expect.any(Object)
      );
      expect(mockedExec.exec).toHaveBeenNthCalledWith(
        2,
        path.join('/cached', 'appknox'),
        ['reports', 'download', 'pdf', '456'],
        expect.any(Object)
      );
      expect(result).toEqual({
        pdfPath: path.resolve('reports', '101', 'report_101.pdf'),
        passwordPath: path.resolve('reports', '101', 'report_101_password.txt')
      });
    });

    it.each(['', 'network failure', '123 warning'])(
      'rejects an invalid report ID output: %p',
      async output => {
        mockExecResults([{stdout: output, code: 0}]);

        await expect(pdfReport(101)).rejects.toThrow('valid numeric report ID');
        expect(mockedExec.exec).toHaveBeenCalledTimes(1);
      }
    );

    it('rejects when the CLI does not produce both expected files', async () => {
      mockExecResults([{stdout: '456\n', code: 0}, {code: 0}]);
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      await expect(pdfReport(101)).rejects.toThrow(
        'expected files were not found'
      );
    });
  });
});
