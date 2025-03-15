export const googlOAuthClient = async (baseUrl: string) => {
    const { Google } = await import('arctic')
    return new Google(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        baseUrl + '/api/auth/oauth/callback'
    )
}