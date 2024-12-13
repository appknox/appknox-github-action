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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const core = __importStar(require("@actions/core"));
const constants_1 = require("./constants");
/**
 * Helper to get all the inputs for the action
 */
function getInputs() {
    const accessToken = core.getInput(constants_1.Inputs.AppknoxAccessToken, {
        required: true
    });
    const path = core.getInput(constants_1.Inputs.Path, { required: true });
    const sastTimeout = core.getInput(constants_1.Inputs.SastTimeout, { required: false }) || 30; // Default to 30 minutes if not specified
    const sarifStringInput = core.getInput(constants_1.Inputs.Sarif) || constants_1.SarifOptions.Disable;
    const sarifString = constants_1.SarifOptions[sarifStringInput];
    if (!sarifString) {
        core.setFailed(`Unrecognized ${constants_1.Inputs.Sarif} input. Provided: ${sarifString}. Available options: ${Object.keys(constants_1.SarifOptions)}`);
    }
    const riskThresholdInput = core.getInput(constants_1.Inputs.RiskThreshold) || constants_1.RiskThresholdOptions.LOW;
    const riskThreshold = constants_1.RiskThresholdOptions[riskThresholdInput];
    if (!riskThreshold) {
        core.setFailed(`Unrecognized ${constants_1.Inputs.RiskThreshold} input. Provided: ${riskThreshold}. Available options: ${Object.keys(constants_1.RiskThresholdOptions)}`);
    }
    const inputs = {
        appknoxAccessToken: accessToken,
        filePath: path,
        riskThreshold: riskThreshold,
        sarif: sarifString,
        sastTimeout: sastTimeout
    };
    return inputs;
}
exports.getInputs = getInputs;
//# sourceMappingURL=input-helper.js.map