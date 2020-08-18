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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var helpers_1 = require("./helpers");
var STTStream_1 = __importDefault(require("./STTStream"));
// Constants
var SHARD_LENGTH = 300;
/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptionsAppend}
 *
 * If you don't know the encoding or sample rate of your WAV file, find out how to check it [here](https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#checking-encoding-and-sample-rate)
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // TODO: Authenticate with Google. See https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication
 *
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
 * };
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Empty text file
 * stream.emptyTextFile();
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
 * @public
 */
var DistributedSTTStream = /** @class */ (function () {
    /**
     * @param audioFilename - Path to original audio file
     * @param audioDirname - Path to output distributed audio directory
     * @param textFilename - Path to text file
     * @param options - Options
     */
    function DistributedSTTStream(audioFilename, audioDirname, textFilename, options) {
        this.audioFilename = audioFilename;
        this.audioDirname = audioDirname;
        this.textFilename = textFilename;
        this.options = options;
        this.progress = 0;
        this.progressListeners = [];
        this.distributeListeners = [];
    }
    /**
     * Set progress
     * @param progress - Progress percentage
     * @internal
     */
    DistributedSTTStream.prototype.setProgress = function (progress) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, listener;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Set progress
                        this.progress = progress;
                        _i = 0, _a = this.progressListeners;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        listener = _a[_i];
                        return [4 /*yield*/, listener(progress)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DistributedSTTStream.prototype.on = function (event, callback) {
        if (event === "progress") {
            // Add callback to progress listeners
            this.progressListeners.push(callback);
        }
        else if (event === "distribute") {
            // Add callback to distribute listeners
            this.distributeListeners.push(callback);
        }
    };
    /**
     * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
     * @remarks
     * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
     * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
     * @returns STD output of bash script
     */
    DistributedSTTStream.prototype.distribute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, error_1, error, knownWarningPatterns, errors, _i, errors_1, errorMessage, isKnownWarning, _a, knownWarningPatterns_1, pattern, _b, _c, listener;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        stdout = "";
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, helpers_1.runBashScript("distribute.sh", this.audioFilename + " " + this.audioDirname + " " + SHARD_LENGTH)];
                    case 2:
                        stdout = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        error = "" + error_1;
                        knownWarningPatterns = [
                            /End position is after expected end of audio/i,
                            /Last 1 position\(s\) not reached/i,
                        ];
                        // Handle STD errors
                        if (error) {
                            errors = error.split("\n");
                            for (_i = 0, errors_1 = errors; _i < errors_1.length; _i++) {
                                errorMessage = errors_1[_i];
                                isKnownWarning = false;
                                for (_a = 0, knownWarningPatterns_1 = knownWarningPatterns; _a < knownWarningPatterns_1.length; _a++) {
                                    pattern = knownWarningPatterns_1[_a];
                                    isKnownWarning = isKnownWarning || pattern.test(errorMessage);
                                }
                                // If error is not a known warning and it is full, throw it
                                if (!isKnownWarning && errorMessage.length) {
                                    throw errorMessage;
                                }
                            }
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        _b = 0, _c = this.distributeListeners;
                        _d.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 8];
                        listener = _c[_b];
                        return [4 /*yield*/, listener()];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 5];
                    case 8: 
                    // Return STD output
                    return [2 /*return*/, stdout];
                }
            });
        });
    };
    /**
     * Start distributed STT stream
     * @example
     * See {@link DistributedSTTStream} for an example
     * @param useConsole - See {@link STTStream.start}
     * @returns Lines of the transcript of each audio file
     */
    DistributedSTTStream.prototype.start = function (useConsole) {
        return __awaiter(this, void 0, void 0, function () {
            var results, stdout, err_1, filenames, pattern, wavFilenames, wavFileNum, _a, _b, _i, i, index, wavFilename, fullWavFn, stream, percentage, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        results = [];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.distribute()];
                    case 2:
                        stdout = _c.sent();
                        // Log any STD output
                        stdout.length && console.log("Distribute script: " + stdout);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _c.sent();
                        throw "An error occurred distributing the audio file. " + err_1;
                    case 4:
                        filenames = fs_1.readdirSync(this.audioDirname);
                        pattern = /\.wav$/;
                        wavFilenames = filenames.filter(function (fn) { return pattern.test(fn); });
                        wavFileNum = wavFilenames.length;
                        _a = [];
                        for (_b in wavFilenames)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 5;
                    case 5:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        i = _a[_i];
                        index = parseInt(i);
                        wavFilename = wavFilenames[i];
                        fullWavFn = path_1.resolve(this.audioDirname, wavFilename);
                        stream = new STTStream_1.default(fullWavFn, this.textFilename, this.options);
                        percentage = ~~((index / wavFileNum) * 100);
                        // Set progress
                        return [4 /*yield*/, this.setProgress(percentage)];
                    case 6:
                        // Set progress
                        _c.sent();
                        return [4 /*yield*/, stream.start(useConsole)];
                    case 7:
                        result = _c.sent();
                        // Save result
                        results.push(result);
                        _c.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 5];
                    case 9: 
                    // Set progress to 100%
                    return [4 /*yield*/, this.setProgress(100)];
                    case 10:
                        // Set progress to 100%
                        _c.sent();
                        // Return result
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /** {@inheritdoc STTStream.emptyTextFile} */
    DistributedSTTStream.prototype.emptyTextFile = function () {
        fs_1.writeFileSync(this.textFilename, "");
    };
    return DistributedSTTStream;
}());
exports.default = DistributedSTTStream;
