import STTStream_, { STTStreamOptions, AudioEncoding } from "./STTStream";
import DistributedSTTStream, {
  STTStreamOptionsAppend,
} from "./DistributedSTTStream";

/**
 * Overridden
 * @alpha
 */
export const STTStream = STTStream_;

export { DistributedSTTStream };

export { STTStreamOptions, AudioEncoding, STTStreamOptionsAppend };
