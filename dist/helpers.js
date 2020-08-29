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
exports.runBashScript = exports.useSpinner = void 0;
var child_process_1 = require("child_process");
var path_1 = require("path");
// Exports
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
 * @param filename - Filename of bash script
 * @param args - Arguments to pass to script
 * @returns Standard output of bash script
 * @internal
 */
exports.runBashScript = function (filename, args) {
    return new Promise(function (resolve, reject_) {
        // Define reject function
        var reject = function (reason) {
            var errorPrefix = [
                "Error running a bash script.",
                "This is probably because you're environment is not set up correctly.",
                "Docker will be used soon to enable the app on any environment.",
            ].join(" ");
            reject_(errorPrefix + " " + reason);
        };
        // Define absolute path
        var relFilename = path_1.resolve(__dirname, "../scripts/bash", path_1.join("./", filename));
        // Define command
        var command = relFilename + " " + args;
        // Execute command
        child_process_1.exec(command, function (error, stdout, stderr) {
            // Handle errors
            if (error) {
                // Check if error was caused by Windows
                var isWindowsError = stderr.includes("'.' is not recognized as an internal or external command");
                // If error was caused by Windows
                if (isWindowsError) {
                    // Throw explanation error
                    var errorPrefix = "It looks like you are running Windows which is not supported yet";
                    var reason = errorPrefix + ". " + error;
                    reject(reason);
                }
                else {
                    // Otherwise, throw error
                    reject("" + error);
                }
            }
            // If standard error was thrown, reject it
            stderr.length && reject(stderr);
            // Resolve standard output
            resolve(stdout);
        });
    });
};
