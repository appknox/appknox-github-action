"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cicheck = exports.sarifReport = exports.upload = exports.whoami = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const tc = __importStar(require("@actions/tool-cache"));
const exec = __importStar(require("@actions/exec"));
const constants_1 = require("./constants");
const supportedOS = {
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
function getAppknoxDownloadURL(os) {
    if (!(os in supportedOS)) {
        throw Error(`Unsupported os ${os}`);
    }
    const binaryName = supportedOS[os].name;
    return `https://github.com/appknox/appknox-go/releases/download/${constants_1.binaryVersion}/${binaryName}`;
}
function downloadAppknoxCLI(platform) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = getAppknoxDownloadURL(platform);
        const appknoxPath = yield tc.downloadTool(url);
        fs_1.default.chmodSync(appknoxPath, '755');
        return appknoxPath;
    });
}
function getAppknoxToolPath() {
    return __awaiter(this, void 0, void 0, function* () {
        const foundPath = tc.find('appknox', constants_1.binaryVersion);
        if (foundPath) {
            return path_1.default.join(foundPath, 'appknox');
        }
        const appknoxPath = yield downloadAppknoxCLI(process.platform);
        yield tc.cacheFile(appknoxPath, 'appknox', 'appknox', constants_1.binaryVersion);
        return path_1.default.join(tc.find('appknox', constants_1.binaryVersion), 'appknox');
    });
}
function execBinary(path, args) {
    return __awaiter(this, void 0, void 0, function* () {
        let output = '';
        let err = '';
        const options = {
            listeners: {},
            ignoreReturnCode: true
        };
        options.listeners = {
            stdout: (data) => {
                output += data.toString();
            },
            stderr: (data) => {
                err += data.toString();
            }
        };
        const errCode = yield exec.exec(path, args, options);
        return {
            output: output,
            err: err,
            code: errCode
        };
    });
}
function whoami() {
    return __awaiter(this, void 0, void 0, function* () {
        const toolPath = yield getAppknoxToolPath();
        const combinedOutput = yield execBinary(toolPath, ['whoami']);
        if (combinedOutput.err.indexOf('Invalid token') > -1) {
            throw new Error('Invalid token');
        }
    });
}
exports.whoami = whoami;
function upload(file_path) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolPath = yield getAppknoxToolPath();
        const combinedOutput = yield execBinary(toolPath, ['upload', file_path]);
        if (combinedOutput.code > 0) {
            const errArr = combinedOutput.err.split('\n').filter(_ => _);
            throw new Error(errArr[errArr.length - 1]);
        }
        return Number.parseInt(combinedOutput.output);
    });
}
exports.upload = upload;
function sarifReport(fileID, sastTimeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolPath = yield getAppknoxToolPath();
        const args = [
            'sarif',
            fileID.toString(),
            '--timeout',
            sastTimeout.toString(),
        ];
        const combinedOutput = yield execBinary(toolPath, args);
        if (combinedOutput.code > 0) {
            const errArr = combinedOutput.err.split('\n').filter(_ => _);
            const outArr = combinedOutput.output.split('\n').filter(_ => _);
            const errMes = errArr[errArr.length - 1];
            const outMes = outArr[outArr.length - 1];
            throw new Error(errMes + '. ' + outMes);
        }
        return combinedOutput;
    });
}
exports.sarifReport = sarifReport;
function cicheck(riskThreshold, fileID, sastTimeout) {
    return __awaiter(this, void 0, void 0, function* () {
        const toolPath = yield getAppknoxToolPath();
        const args = [
            'cicheck',
            fileID.toString(),
            '--risk-threshold',
            riskThreshold,
            '--timeout',
            sastTimeout.toString()
        ];
        const combinedOutput = yield execBinary(toolPath, args);
        if (combinedOutput.code > 0) {
            const errArr = combinedOutput.err.split('\n').filter(_ => _);
            const outArr = combinedOutput.output.split('\n').filter(_ => _);
            const errMes = errArr[errArr.length - 1];
            const outMes = outArr[outArr.length - 1];
            throw new Error(errMes + '. ' + outMes);
        }
    });
}
exports.cicheck = cicheck;
//# sourceMappingURL=tool.js.map