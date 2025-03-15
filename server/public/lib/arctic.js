"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googlOAuthClient = void 0;
const protocol = req.headers.host?.includes('localhost') ? 'http' : 'https'
const baseUrl = `${protocol}://${req.headers.host}`
const googlOAuthClient = async () => {
    const { Google } = await import('arctic');
    return new Google(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, baseUrl + '/api/auth/oauth/callback');
};
exports.googlOAuthClient = googlOAuthClient;
