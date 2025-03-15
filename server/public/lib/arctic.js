"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlOAuthClient = void 0;
const googlOAuthClient = async (baseUrl) => {
    const { Google } = await import('arctic');
    return new Google(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, baseUrl + '/api/auth/oauth/callback');
};
exports.googlOAuthClient = googlOAuthClient;
