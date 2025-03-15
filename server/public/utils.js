"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBase64Image = void 0;
const decodeBase64Image = (dataString) => {
    const matches = dataString.match(/^data:(.*?);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }
    if (!matches[1].includes('image')) {
        return null;
    }
    return {
        type: matches[1],
        buffer: Buffer.from(matches[2], 'base64'),
    };
};
exports.decodeBase64Image = decodeBase64Image;
