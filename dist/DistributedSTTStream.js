"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
// Classes
/**
 * A distributed STT stream (for audio files longer than 305 seconds)
 * @example
 * This example writes the transcript of a long WAV file to a text file.
 * The audio files is split up into smaller files saved in the audio directory passed to the constructor.
 * See {@link DistributedSTTStream.distribute} for more details
 *
 * See {@link https://github.com/EmmaGoodliffe/transcribe-stt/blob/master/README.md#google-authentication | guide} for help authenticating
 *
 * ```ts
 * import { DistributedSTTStream } from "transcribe-stt";
 *
 * // Define arguments
 * const audioFilename = "./<input audio file>.wav";
 * const audioDirname = "./<output audio directory>";
 * const textFilename = "./<output text file>.txt";
 * const options = {};
 *
 * // Initialise stream
 * const stream = new DistributedSTTStream(audioFilename, audioDirname, textFilename, options);
 *
 * // Start stream
 * stream.start().catch(console.error);
 * ```
 * @remarks
 * See {@link STTStream} for other properties and methods
 * @public
 */
var DistributedSTTStream = /** @class */ (function (_super) {
    __extends(DistributedSTTStream, _super);
    /**
     * @param audioFilename - Path to audio file
     * @param audioDirname - Path to output distributed audio directory
     * @param textFilename - Path to text file or null
     * @param options - Options
     */
    function DistributedSTTStream(audioFilename, audioDirname, textFilename, options) {
        var _this = 
        // Run super constructor
        _super.call(this, audioFilename, textFilename, options) || this;
        _this.audioDirname = audioDirname;
        _this.options = options;
        // Append audio directory to needed files
        _this.neededFiles.push(audioDirname);
        // Initialise progress
        _this.progress = -1;
        // Initialise listeners
        _this.progressListeners = [];
        _this.distributeListeners = [];
        return _this;
    }
    /**
     * Distribute audio into separate files (automatically called by {@link DistributedSTTStream.start})
     * @remarks
     * Single audio file is split up into smaller files of 300 seconds so they can be used with Google's streaming API.
     * Each file is separately streamed and written to the text file when {@link DistributedSTTStream.start} is called
     * @returns standard output of bash script
     */
    DistributedSTTStream.prototype.distribute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, error_1, error, knownWarningPatterns, errorLines, _i, errorLines_1, errorLine, isKnownWarning, _a, knownWarningPatterns_1, pattern, _b, _c, listener;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        stdout = "";
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, helpers_1.runBashScript("distribute.sh", "\"" + this.audioFilename + "\" \"" + this.audioDirname + "\" " + SHARD_LENGTH)];
                    case 2:
                        // Run distribute script
                        stdout = _d.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        error = "" + error_1;
                        knownWarningPatterns = [
                            /End position is after expected end of audio/i,
                            /Last 1 position\(s\) not reached/i,
                        ];
                        // Handle standard errors
                        if (error) {
                            errorLines = error.split("\n");
                            for (_i = 0, errorLines_1 = errorLines; _i < errorLines_1.length; _i++) {
                                errorLine = errorLines_1[_i];
                                isKnownWarning = false;
                                for (_a = 0, knownWarningPatterns_1 = knownWarningPatterns; _a < knownWarningPatterns_1.length; _a++) {
                                    pattern = knownWarningPatterns_1[_a];
                                    isKnownWarning = isKnownWarning || pattern.test(errorLine);
                                }
                                // If error is not a known warning and it is full
                                if (!isKnownWarning && errorLine.length) {
                                    // Throw it
                                    throw errorLine;
                                }
                            }
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        // Call every distribute listener
                        for (_b = 0, _c = this.distributeListeners; _b < _c.length; _b++) {
                            listener = _c[_b];
                            listener();
                        }
                        // Return standard output
                        return [2 /*return*/, stdout];
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
        else {
            // Throw error
            var reason = "No event " + event;
            throw reason;
        }
    };
    /**
     * Set progress
     * @param progress - Progress percentage
     * @internal
     */
    DistributedSTTStream.prototype.setProgress = function (progress) {
        // If new progress is larger than previous progress
        if (progress > this.progress) {
            // Save progress
            this.progress = progress;
            // Call every progress listener
            for (var _i = 0, _a = this.progressListeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener(progress);
            }
        }
    };
    /** {@inheritdoc STTStream.start} */
    DistributedSTTStream.prototype.start = function (useConsole) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, stdout, err_1, filenames, wavFilenames, totalN, n, results, flattenedResults, joinedResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check if files exists
                        this.checkFiles();
                        promises = [];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.distribute()];
                    case 2:
                        stdout = _a.sent();
                        // Log any standard output
                        stdout.length && console.warn("Distribute bash script output: " + stdout);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw "Error distributing audio file. " + err_1;
                    case 4:
                        filenames = fs_1.readdirSync(this.audioDirname);
                        wavFilenames = filenames.filter(function (fn) { return path_1.extname(fn) === ".wav"; });
                        totalN = wavFilenames.length;
                        n = 0;
                        // Initialise progress
                        this.setProgress(n);
                        // For every WAV path
                        wavFilenames.forEach(function (wavFilename) {
                            // Get full WAV path
                            var fullWavFn = path_1.resolve(_this.audioDirname, wavFilename);
                            // Initialise STT stream
                            var stream = new STTStream_1.default(fullWavFn, null, _this.options);
                            // Start stream
                            var promise = stream.start(useConsole);
                            promise
                                .then(function () {
                                // Increase n
                                n++;
                                // Define percentage
                                var percentage = ~~((n / totalN) * 100);
                                // Set progress to percentage
                                _this.setProgress(percentage);
                            })
                                // Ignore errors in single promise (caught later in Promise.all)
                                .catch(function () { });
                            // Save promise
                            promises.push(promise);
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 5:
                        results = _a.sent();
                        flattenedResults = results.flat();
                        joinedResults = flattenedResults.join("\n");
                        // Write joined results to text file
                        this.textFilename && fs_1.writeFileSync(this.textFilename, joinedResults);
                        // Return flattened results
                        return [2 /*return*/, flattenedResults];
                }
            });
        });
    };
    return DistributedSTTStream;
}(STTStream_1.default));
exports.default = DistributedSTTStream;
