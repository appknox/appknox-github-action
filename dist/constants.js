"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.binaryVersion = exports.RiskThresholdOptions = exports.SarifOptions = exports.Inputs = void 0;
var Inputs;
(function (Inputs) {
    Inputs["AppknoxAccessToken"] = "appknox_access_token";
    Inputs["Path"] = "file_path";
    Inputs["RiskThreshold"] = "risk_threshold";
    Inputs["Sarif"] = "sarif";
    Inputs["SastTimeout"] = "sast_timeout";
})(Inputs = exports.Inputs || (exports.Inputs = {}));
var SarifOptions;
(function (SarifOptions) {
    /**
     * Will upload the sarif report in codeQL
     */
    SarifOptions["Enable"] = "Enable";
    /**
     * Default. Will not upload the sarif report in codeQL
     */
    SarifOptions["Disable"] = "Disable";
})(SarifOptions = exports.SarifOptions || (exports.SarifOptions = {}));
var RiskThresholdOptions;
(function (RiskThresholdOptions) {
    /**
     * Default. Fail the action if risk is "LOW" or higher
     */
    RiskThresholdOptions["LOW"] = "LOW";
    /**
     * Fail the action if risk is "MEDIUM" or higher
     */
    RiskThresholdOptions["MEDIUM"] = "MEDIUM";
    /**
     * Fail the action if risk is "HIGH" or higher
     */
    RiskThresholdOptions["HIGH"] = "HIGH";
    /**
     * Fail the action if risk is "CRITICAL"
     */
    RiskThresholdOptions["CRITICAL"] = "CRITICAL";
})(RiskThresholdOptions = exports.RiskThresholdOptions || (exports.RiskThresholdOptions = {}));
exports.binaryVersion = '1.4.1';
//# sourceMappingURL=constants.js.map