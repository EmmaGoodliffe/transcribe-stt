"use strict";
/**
 * Transcribe audio of any length using Google's Speech to Text API
 * @remarks
 * See <a href="#classes">classes</a>
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
var DistributedSTTStream_1 = require("./DistributedSTTStream");
Object.defineProperty(exports, "DistributedSTTStream", { enumerable: true, get: function () { return DistributedSTTStream_1.default; } });
var STTStream_1 = require("./STTStream");
Object.defineProperty(exports, "STTStream", { enumerable: true, get: function () { return STTStream_1.default; } });
__exportStar(require("./types"), exports);
