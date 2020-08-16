"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recExp = exports.getWavHeaders = exports.runBashScript = exports.useSpinner = exports.relPathToAbs = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
// Constants
var WSL_URL = "_"; // TODO: Enter correct URL
/**
 * Converts a relative path to an absolute path using the directory the function is run from
 * @param path - Relative path
 * @returns Absolute path
 * @internal
 */
exports.relPathToAbs = function (path) {
    return path_1.resolve(path_1.dirname(""), path);
};
/**
 * Show spinner while a promise is running
 * @param promise - Promise to base spinner on
 * @param spinner - Spinner instance
 * @param successText - Text to show if promise succeeds
 * @param failText - Text to show if promise fails
 * @returns Whatever the promise returns
 * @internal
 */
exports.useSpinner = function (promise, spinner, successText, failText) {
    if (successText === void 0) { successText = "Done"; }
    if (failText === void 0) { failText = "Failed"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Start spinner
                    spinner.start();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, promise];
                case 2:
                    result = _a.sent();
                    // Stop spinner with success
                    spinner.succeed(successText);
                    // Return result of promise
                    return [2 /*return*/, result];
                case 3:
                    err_1 = _a.sent();
                    // Stop spinner with failure
                    spinner.fail(failText);
                    // Throw error
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    });
};
/**
 * Run bash script
 * @param command - Command to run bash script
 * @returns STD output
 * @internal
 */
exports.runBashScript = function (filename, args) {
    return new Promise(function (resolve, reject) {
        var absFilename = exports.relPathToAbs(filename);
        var command = absFilename + " " + args;
        child_process_1.exec(command, function (error, stdout, stderr) {
            if (error) {
                var isWindowsError = ("" + stderr).includes("'.' is not recognized as an internal or external command");
                if (isWindowsError) {
                    var errorPrefix = "An error occurred running a bash script. If you are using windows, please use WSL. See " + WSL_URL + " for more details";
                    reject(errorPrefix + ". " + error);
                }
                else {
                    reject(error);
                }
            }
            if (stderr && stderr.length) {
                reject(stderr);
            }
            resolve(stdout);
        });
    });
};
/**
 * Get headers of WAV file
 * @param wavFilename - Path to WAV file
 * @returns Headers
 * @internal
 */
exports.getWavHeaders = function (wavFilename) { return __awaiter(void 0, void 0, void 0, function () {
    var stdout, _a, encodingString, sampleRateString, encoding, sampleRateHertz;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, exports.runBashScript("./scripts/headers.sh", wavFilename)];
            case 1:
                stdout = _b.sent();
                _a = stdout
                    .replace("\n", "")
                    .toUpperCase()
                    .split(","), encodingString = _a[0], sampleRateString = _a[1];
                encoding = encodingString;
                sampleRateHertz = parseInt(sampleRateString);
                return [2 /*return*/, { encoding: encoding, sampleRateHertz: sampleRateHertz }];
        }
    });
}); };
/**
 * Generate "received but expected" error message
 * @param description - Description of received and expected entities
 * @param rec - Received value
 * @param exp - Expected value
 * @returns Error message
 * @internal
 */
exports.recExp = function (description, rec, exp) {
    return "Received " + description + " " + rec + " but expected " + exp;
};
