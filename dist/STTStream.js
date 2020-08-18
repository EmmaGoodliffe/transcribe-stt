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
var speech_1 = require("@google-cloud/speech");
var fs_1 = require("fs");
var ora_1 = __importDefault(require("ora"));
var helpers_1 = require("./helpers");
// Define constants
var SPINNER_START_TEXT = "STT stream running...";
var SUCCESS_TEXT = "STT stream done";
var FAIL_TEXT = "STT stream failed";
var FAQ_URL = "https://cloud.google.com/speech-to-text/docs/error-messages";
// Classes
/**
 * An STT stream (for audio files shorter than 305 seconds)
 * @example
 * This example writes the transcript of a short LINEAR16 16000Hz WAV file to a text file.
 * You can customise the functionality of the stream with the {@link STTStreamOptions}.
 *
 * ```ts
 * import { STTStream } form "transcribe-stt";
 *
 * const audioFilename = "./<input audio file>.wav";
 * const textFilename = "./<output text file>.txt";
 * const options = {
 *  encoding: "LINEAR16",
 *  sampleRateHertz: 16000,
 * };
 *
 * // Initialise stream
 * const stream = new STTStream(audioFilename, textFilename, options);
 *
 * // Start stream and write output to text file
 * stream.start();
 * ```
 * @public
 */
var STTStream = /** @class */ (function () {
    /**
     * @param audioFilename - Path to audio file
     * @param textFilename - Path to text file
     * @param options - Options
     */
    function STTStream(audioFilename, textFilename, options) {
        this.audioFilename = audioFilename;
        this.textFilename = textFilename;
        this.append = options.append || false;
        this.encoding = options.encoding;
        this.sampleRateHertz = options.sampleRateHertz;
        this.languageCode = options.languageCode || "en-US";
    }
    /**
     * Start STT stream
     * @example
     * See {@link STTStream} for an example
     * @param useConsole - Whether to show a loading spinner and deliver warnings in the console during STT stream. Default `true`
     * @returns Lines of the transcript
     */
    STTStream.prototype.start = function (useConsole) {
        if (useConsole === void 0) { useConsole = true; }
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        if (!useConsole) return [3 /*break*/, 2];
                        return [4 /*yield*/, helpers_1.useSpinner(this.inner(), ora_1.default(SPINNER_START_TEXT), SUCCESS_TEXT, FAIL_TEXT)];
                    case 1:
                        // Run function with spinner wrapper
                        results = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.inner()];
                    case 3:
                        // Run function normally
                        results = _a.sent();
                        _a.label = 4;
                    case 4: 
                    // Return results
                    return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Main inner method (automatically called by {@link STTStream.start})
     * @internal
     */
    STTStream.prototype.inner = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // Initialise results
            var results = [];
            // If not appending
            if (!_this.append) {
                // Empty file
                _this.emptyTextFile();
            }
            // Initialise client
            var client = new speech_1.SpeechClient();
            // Define request
            var request = {
                config: {
                    encoding: _this.encoding,
                    sampleRateHertz: _this.sampleRateHertz,
                    languageCode: _this.languageCode,
                },
            };
            // Create read stream for audio file
            var audioReadStream = fs_1.createReadStream(_this.audioFilename);
            // Define a read/write stream to handle audio file
            var recogniseStream = client
                .streamingRecognize(request)
                .on("error", function (err) {
                // Handle errors
                var reason = [
                    "An error occurred running the STT stream. " + err,
                    "See " + FAQ_URL + " for help on common error messages",
                ].join("\n");
                reject(reason);
            })
                .on("data", function (data) {
                // Get result
                var result = data.results[0].alternatives[0].transcript;
                // Save result
                results.push(result);
                // Append result to text file
                fs_1.appendFile(_this.textFilename, result + "\n", function (err) {
                    // Handle errors
                    if (!err)
                        return;
                    var reason = "An error occurred writing to the text file. " + err;
                    reject(reason);
                });
            })
                .on("end", function () { return resolve(results); });
            // Pipe audio file through read/write stream
            audioReadStream.pipe(recogniseStream);
        });
    };
    /** Empty text file */
    STTStream.prototype.emptyTextFile = function () {
        fs_1.writeFileSync(this.textFilename, "");
    };
    return STTStream;
}());
exports.default = STTStream;
