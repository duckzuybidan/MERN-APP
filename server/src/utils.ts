export const decodeBase64Image = (dataString: string) => {
    const matches = dataString.match(/^data:(.*?);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
        return null
    }
    if(!matches[1].includes('image')) {
        return null
    }
    return {
        type: matches[1],
        buffer: Buffer.from(matches[2], 'base64'),
    };
};
