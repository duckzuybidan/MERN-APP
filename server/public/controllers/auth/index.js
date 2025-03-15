"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateProfile = exports.signOut = exports.oAuthCallback = exports.oAuth = exports.resetPassword = exports.forgotPassword = exports.resendEmailVerification = exports.verifyEmail = exports.signIn = exports.signUp = void 0;
const prisma_1 = require("../../lib/prisma");
const lucia_1 = require("../../lib/lucia");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = require("../../lib/nodemailer");
const arctic_1 = require("../../lib/arctic");
const htmlContent = (url, title, content) => {
    return (`<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            }
            .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
            text-align: center;
            padding: 10px 0;
            }
            .header img {
            max-width: 100px;
            }
            .content {
            text-align: center;
            margin: 20px 0;
            }
            .button {
            background-color: #007bff;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-size: 16px;
            display: inline-block;
            margin-top: 20px;
            font-weight: bold;
            }
            .footer {
            font-size: 12px;
            text-align: center;
            color: #666;
            margin-top: 30px;
            }
        </style>
        </head>
        <body>
        <div class="container">
            <div class="header">
            <h1>${title}</h1>
            </div>
            <div class="content">
            <p>Hi,</p>
            <p>${content}</p>
            <a href="${url}" class="button">${title}</a>
            </div>
            <div class="footer">
            <p>If you didn’t request this email, you can safely ignore it.</p>
            <p>&copy; 2024. All rights reserved.</p>
            </div>
        </div>
        </body>
        </html>`);
};
const userVerificationContent = "You're almost there! Please verify your email address by clicking the button below. This link will expire in 5 minutes";
const resetPasswordContent = "Please reset your password by clicking the button below. This link will expire in 5 minutes";
const signUp = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        if (!username || !password || !email) {
            res.status(400).json({
                success: false,
                message: 'Missing username, password, or email'
            });
            return;
        }
        const existUser = await prisma_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (existUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            });
            return;
        }
        const { Argon2id } = await import('oslo/password');
        const hashedPassword = await new Argon2id().hash(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                username,
                email,
                hashedPassword
            }
        });
        const code = Math.random().toString(36).slice(-6);
        const token = jsonwebtoken_1.default.sign({ code }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}&userId=${user.id}`;
        (0, nodemailer_1.sendEmail)(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent));
        await prisma_1.prisma.emailSystem.create({
            data: {
                userId: user.id,
                emailVerifications: {
                    create: {
                        code,
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'We have sent a verification to your email'
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.signUp = signUp;
const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Missing email or password'
            });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.isVerified === false) {
            res.status(400).json({
                success: false,
                message: 'Email not verified',
                needVerification: true
            });
            return;
        }
        const { Argon2id } = await import('oslo/password');
        const passwordMatch = await new Argon2id().verify(user.hashedPassword, password);
        if (!passwordMatch) {
            res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
            return;
        }
        const session = await (0, lucia_1.lucia)().then((lucia) => lucia.createSession(user.id, {}));
        const sessionCookie = await (0, lucia_1.lucia)().then((lucia) => lucia.createSessionCookie(session.id));
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        res.status(200).json({
            success: true,
            message: 'Sign in successful'
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.signIn = signIn;
const verifyEmail = async (req, res) => {
    const { token, userId } = req.body;
    try {
        if (!token || !userId) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
        const checkVerified = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!checkVerified) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (checkVerified?.isVerified) {
            res.status(200).json({
                success: true,
                message: 'Email already verified',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const emailSystem = await prisma_1.prisma.emailSystem.findUnique({
            where: {
                userId: userId
            },
            include: {
                emailVerifications: true
            }
        });
        const emailVerification = emailSystem && emailSystem.emailVerifications.find(emailVerification => emailVerification.code === decoded.code);
        if (!emailVerification) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
        const session = await (0, lucia_1.lucia)().then((lucia) => lucia.createSession(userId, {}));
        const sessionCookie = await (0, lucia_1.lucia)().then((lucia) => lucia.createSessionCookie(session.id));
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        await prisma_1.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                isVerified: true
            }
        });
        await prisma_1.prisma.emailVerification.deleteMany({
            where: {
                emailSystemId: emailSystem.id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(400).json({
                success: false,
                message: 'Token has expired',
            });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};
exports.verifyEmail = verifyEmail;
const resendEmailVerification = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            res.json({
                success: false,
                message: 'Missing email',
            });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email
            },
            include: {
                emailSystem: {
                    include: {
                        emailVerifications: true
                    }
                }
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'Email already verified',
            });
            return;
        }
        const code = Math.random().toString(36).slice(-6);
        const token = jsonwebtoken_1.default.sign({ code }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}&userId=${user.id}`;
        if (!user.emailSystem) {
            await prisma_1.prisma.emailSystem.create({
                data: {
                    userId: user.id,
                    emailVerifications: {
                        create: {
                            code
                        }
                    }
                }
            });
            (0, nodemailer_1.sendEmail)(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent));
            res.status(200).json({
                success: true,
                message: 'Email verification sent successfully',
            });
            return;
        }
        const emailVerificationLength = user.emailSystem.emailVerifications.length;
        const existEmailVerification = user.emailSystem.emailVerifications[emailVerificationLength - 1];
        if (existEmailVerification) {
            const lastSent = new Date(existEmailVerification.createdAt);
            const now = new Date();
            const diff = now.getTime() - lastSent.getTime();
            if (diff < 60000) {
                res.status(400).json({
                    success: false,
                    message: `Please wait ${Math.round((60000 - diff) / 1000)} seconds before resending the email verification`,
                });
                return;
            }
            await prisma_1.prisma.emailVerification.create({
                data: {
                    code,
                    emailSystemId: user.emailSystem.id
                }
            });
        }
        else {
            await prisma_1.prisma.emailVerification.create({
                data: {
                    code,
                    emailSystemId: user.emailSystem.id
                }
            });
        }
        (0, nodemailer_1.sendEmail)(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent));
        res.status(200).json({
            success: true,
            message: 'Email verification sent successfully',
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.resendEmailVerification = resendEmailVerification;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Missing email',
            });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const emailSystem = await prisma_1.prisma.emailSystem.findUnique({
            where: {
                userId: user.id
            },
            include: {
                resetPasswords: true
            }
        });
        const code = Math.random().toString(36).slice(-6);
        const token = jsonwebtoken_1.default.sign({ code }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const url = `${process.env.CLIENT_URL}/reset-password?token=${token}&userId=${user.id}`;
        if (!emailSystem) {
            await prisma_1.prisma.emailSystem.create({
                data: {
                    userId: user.id,
                    resetPasswords: {
                        create: {
                            code
                        }
                    }
                }
            });
            (0, nodemailer_1.sendEmail)(email, 'Verify your email', htmlContent(url, 'Reset your password', resetPasswordContent));
            res.status(200).json({
                success: true,
                message: 'We have sent an email to reset your password',
            });
            return;
        }
        const existResetPasswordRequest = emailSystem.resetPasswords[emailSystem.resetPasswords.length - 1];
        if (existResetPasswordRequest) {
            const lastSent = new Date(existResetPasswordRequest.createdAt);
            const now = new Date();
            const diff = now.getTime() - lastSent.getTime();
            if (diff < 60000) {
                res.status(400).json({
                    success: false,
                    message: `Please wait ${Math.round((60000 - diff) / 1000)} seconds before resending the reset password email`,
                });
                return;
            }
            await prisma_1.prisma.resetPassword.create({
                data: {
                    code,
                    emailSystemId: emailSystem.id
                }
            });
        }
        else {
            await prisma_1.prisma.resetPassword.create({
                data: {
                    code,
                    emailSystemId: emailSystem.id
                }
            });
        }
        (0, nodemailer_1.sendEmail)(email, 'Verify your email', htmlContent(url, 'Reset your password', resetPasswordContent));
        res.status(200).json({
            success: true,
            message: 'We have sent an email to reset your password',
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { token, userId, password } = req.body;
    try {
        if (!token || !userId || !password) {
            res.status(400).json({
                success: false,
                message: 'Missing token, userId, or password',
            });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                emailSystem: {
                    include: {
                        resetPasswords: true
                    }
                }
            }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const resetPasswordRequest = user.emailSystem && user.emailSystem.resetPasswords.find(resetPassword => resetPassword.code === decoded.code);
        if (!resetPasswordRequest) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
            return;
        }
        const { Argon2id } = await import('oslo/password');
        const hashedPassword = await new Argon2id().hash(password);
        await prisma_1.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                hashedPassword
            }
        });
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(400).json({
                success: false,
                message: 'Token has expired',
            });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
};
exports.resetPassword = resetPassword;
const oAuth = async (_, res) => {
    try {
        const { generateState, generateCodeVerifier } = await import('arctic');
        const state = generateState();
        const codeVerifier = generateCodeVerifier();
        res.cookie('state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });
        const url = await (0, arctic_1.googlOAuthClient)().then((client) => {
            return client.createAuthorizationURL(state, codeVerifier, {
                scopes: ['profile', 'email'],
            });
        });
        const modifiedUrl = new URL(url.toString());
        modifiedUrl.searchParams.append('prompt', 'consent');
        res.status(200).json({
            success: true,
            message: 'OAuth successful',
            url: modifiedUrl.toString(),
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.oAuth = oAuth;
const oAuthCallback = async (req, res) => {
    const { code, state } = req.query;
    try {
        if (!code || !state) {
            res.status(400).json({
                success: false,
                message: 'Missing code or state',
            });
            return;
        }
        const codeVerifier = req.cookies.code_verifier;
        const savedState = req.cookies.state;
        if (!codeVerifier || !savedState) {
            res.status(400).json({
                success: false,
                message: 'Missing code verifier or state',
            });
            return;
        }
        if (state !== savedState) {
            res.status(400).json({
                success: false,
                message: 'State does not match',
            });
            return;
        }
        const { accessToken } = await (0, arctic_1.googlOAuthClient)().then((client) => {
            return client.validateAuthorizationCode(code, codeVerifier);
        });
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        const googleData = await googleResponse.json().then((data) => {
            return data;
        });
        const existUser = await prisma_1.prisma.user.findUnique({
            where: {
                email: googleData.email
            }
        });
        let userId = '';
        if (existUser) {
            userId = existUser.id;
        }
        if (!existUser) {
            const user = await prisma_1.prisma.user.create({
                data: {
                    email: googleData.email,
                    username: googleData.name,
                    avatar: googleData.picture,
                    isVerified: true
                }
            });
            userId = user.id;
        }
        const session = await (0, lucia_1.lucia)().then((lucia) => lucia.createSession(userId, {}));
        const sessionCookie = await (0, lucia_1.lucia)().then((lucia) => lucia.createSessionCookie(session.id));
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        res.clearCookie('state');
        res.clearCookie('code_verifier');
        res.redirect(process.env.CLIENT_URL);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.oAuthCallback = oAuthCallback;
const signOut = async (req, res) => {
    const sessionId = req.cookies[process.env.SESSION_NAME || "E-COMMERCE-cookie"];
    await prisma_1.prisma.session.deleteMany({
        where: {
            id: sessionId
        }
    });
    res.clearCookie(process.env.SESSION_NAME).status(200).json({
        success: true,
        message: 'Logged out successfully',
    });
};
exports.signOut = signOut;
const updateProfile = async (req, res) => {
    const { username, email, phone, avatar, id, addresses } = req.body;
    try {
        const addressesToCreate = addresses.filter((address) => !address.id).map((address) => ({
            ...address,
            userId: id,
            id: undefined
        }));
        const addressesToUpdate = addresses.filter((address) => address.id).map((address) => ({
            ...address,
            userId: id,
        }));
        const createOperations = addressesToCreate.map((address) => prisma_1.prisma.address.create({ data: address }));
        const updateOperations = addressesToUpdate.map((address) => prisma_1.prisma.address.update({
            where: { id: address.id },
            data: {
                lat: address.lat,
                lng: address.lng,
                houseNumber: address.houseNumber,
                road: address.road,
                suburb: address.suburb,
                city: address.city,
                state: address.state,
                country: address.country,
                postcode: address.postcode,
            }
        }));
        await prisma_1.prisma.$transaction([...createOperations, ...updateOperations]);
        await prisma_1.prisma.user.update({
            where: {
                email
            },
            data: {
                username,
                phone,
                avatar
            }
        });
        const user = await prisma_1.prisma.user.findUnique({
            where: {
                email
            },
            include: {
                addresses: true
            }
        });
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.updateProfile = updateProfile;
const deleteAddress = async (req, res) => {
    const { id } = req.query;
    try {
        const address = await prisma_1.prisma.address.delete({
            where: {
                id: id
            }
        });
        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            address
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteAddress = deleteAddress;
