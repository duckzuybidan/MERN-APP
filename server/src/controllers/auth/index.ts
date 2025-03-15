import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { lucia } from '../../lib/lucia';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../../lib/nodemailer';
import { googlOAuthClient } from '../../lib/arctic';
const htmlContent = (url: string, title: string, content: string) => {
    return (
        `<!DOCTYPE html>
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
        </html>`
    )}
const userVerificationContent = "You're almost there! Please verify your email address by clicking the button below. This link will expire in 5 minutes"
const resetPasswordContent = "Please reset your password by clicking the button below. This link will expire in 5 minutes"
const signUp = async (req: Request, res: Response)  => {
    const { username, password, email } = req.body
    try {
        if (!username || !password || !email) {
            res.status(400).json({
                success: false,
                message: 'Missing username, password, or email'
            })
            return
        }
        const existUser = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (existUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists'
            })
            return
        }
        const { Argon2id } = await import('oslo/password');
        const hashedPassword = await new Argon2id().hash(password);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                hashedPassword
            }
        })
        
        const code = Math.random().toString(36).slice(-6)
        const token = jwt.sign({ code }, process.env.JWT_SECRET!, { expiresIn: '5m' })
        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}&userId=${user.id}`
        sendEmail(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent))
        await prisma.emailSystem.create({
            data: {
                userId: user.id,
                emailVerifications: {
                    create: {
                        code,
                    }
                }
            }
        })
        
        res.status(200).json({
            success: true,
            message: 'We have sent a verification to your email'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body
    try {
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Missing email or password'
            })
            return
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found'
            })
            return
        }
        if(user.isVerified === false) {
            res.status(400).json({
                success: false,
                message: 'Email not verified',
                needVerification: true
            })
            return
        }
        const { Argon2id } = await import('oslo/password');
        const passwordMatch = await new Argon2id().verify(user.hashedPassword!, password)
        if (!passwordMatch) {
            res.status(400).json({
                success: false,
                message: 'Incorrect password'
            })
            return
        }
        
        const session = await lucia().then((lucia) => lucia.createSession(user.id, {}))
        const sessionCookie = await lucia().then((lucia) => lucia.createSessionCookie(session.id))
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        res.status(200).json({
            success: true,
            message: 'Sign in successful'
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }
}
const verifyEmail = async (req: Request, res: Response) => {
    const { token, userId } = req.body
    try {
        if (!token || !userId) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            })
            return
        }
        const checkVerified = await prisma.user.findUnique({
            where: {
                id: userId as string
            }
        })
        if (!checkVerified) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            })
            return
        }
        if (checkVerified?.isVerified) {
            res.status(200).json({
                success: true,
                message: 'Email already verified',
            })
            return
        }
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { code: string }
        const emailSystem = await prisma.emailSystem.findUnique({
            where: {
                userId: userId as string
            },
            include: {
                emailVerifications: true
            }
        })
        const emailVerification = emailSystem && emailSystem.emailVerifications.find(emailVerification => emailVerification.code === decoded.code)
        if (!emailVerification) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
            return
        }
        const session = await lucia().then((lucia) => lucia.createSession(userId as string, {}))
        const sessionCookie = await lucia().then((lucia) => lucia.createSessionCookie(session.id))
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        await prisma.user.update({
            where: {
                id: userId as string
            },
            data: {
                isVerified: true
            }
        })
        await prisma.emailVerification.deleteMany({
            where: {
                emailSystemId: emailSystem.id
            }
        })
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        })
    }   
    catch (error) {
        console.log(error)
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({
                success: false,
                message: 'Token has expired',
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }   
}
const resendEmailVerification = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
        if (!email) {
            res.json({
                success: false,
                message: 'Missing email',
            })
            return
        }
        const user = await prisma.user.findUnique({
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
        })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            })
            return
        }
        if (user.isVerified) {
            res.status(400).json({
                success: false,
                message: 'Email already verified',
            })
            return
        }
        const code = Math.random().toString(36).slice(-6)
        const token = jwt.sign({ code }, process.env.JWT_SECRET!, { expiresIn: '5m' })
        const url = `${process.env.CLIENT_URL}/verify-email?token=${token}&userId=${user.id}`
        if(!user.emailSystem){
            await prisma.emailSystem.create({
                data: {
                    userId: user.id,
                    emailVerifications: {
                        create: {
                            code
                        }
                    }
                }
            })
            sendEmail(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent))
            res.status(200).json({
                success: true,
                message: 'Email verification sent successfully',
            })
            return
        }
        const emailVerificationLength = user.emailSystem.emailVerifications.length
        const existEmailVerification = user.emailSystem.emailVerifications[emailVerificationLength - 1]
        if (existEmailVerification) {
            const lastSent = new Date(existEmailVerification.createdAt)
            const now = new Date()
            const diff = now.getTime() - lastSent.getTime()
            if (diff < 60000) {
                res.status(400).json({
                    success: false,
                    message: `Please wait ${Math.round((60000 - diff) / 1000)} seconds before resending the email verification`,

                })
                return
            }
            await prisma.emailVerification.create({
                data: {
                    code,
                    emailSystemId: user.emailSystem.id
                }
            })
        } else {
            await prisma.emailVerification.create({
                data: {
                    code,
                    emailSystemId: user.emailSystem.id
                }
            })
        }
        sendEmail(email, 'Verify your email', htmlContent(url, 'Verify your email', userVerificationContent))
        res.status(200).json({
            success: true,
            message: 'Email verification sent successfully',
        })
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body
    try {
        if (!email) {
            res.status(400).json({
                success: false,
                message: 'Missing email',
            })
            return
        }
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            })
            return
        }
        const emailSystem = await prisma.emailSystem.findUnique({
            where: {
                userId: user.id
            },
            include: {
                resetPasswords: true
            }
        })
        const code = Math.random().toString(36).slice(-6)
        const token = jwt.sign({ code }, process.env.JWT_SECRET!, { expiresIn: '5m' })
        const url = `${process.env.CLIENT_URL}/reset-password?token=${token}&userId=${user.id}`
        if(!emailSystem){
            await prisma.emailSystem.create({
                data: {
                    userId: user.id,
                    resetPasswords: {
                        create: {
                            code
                        }
                    }
                }
            })
            sendEmail(email, 'Verify your email', htmlContent(url, 'Reset your password', resetPasswordContent))
            res.status(200).json({
                success: true,
                message: 'We have sent an email to reset your password',
            })
            return
        }
        const existResetPasswordRequest = emailSystem.resetPasswords[emailSystem.resetPasswords.length - 1]
        if (existResetPasswordRequest) {
            const lastSent = new Date(existResetPasswordRequest.createdAt)
            const now = new Date()
            const diff = now.getTime() - lastSent.getTime()
            if (diff < 60000) {
                res.status(400).json({
                    success: false,
                    message: `Please wait ${Math.round((60000 - diff) / 1000)} seconds before resending the reset password email`,

                })
                return
            }
           await prisma.resetPassword.create({
                data: {
                    code,
                    emailSystemId: emailSystem.id
                }
            })
        } else {
            await prisma.resetPassword.create({
                data: {
                    code,
                    emailSystemId: emailSystem.id
                }
            })
        }
        sendEmail(email, 'Verify your email', htmlContent(url, 'Reset your password', resetPasswordContent))
        res.status(200).json({
            success: true,
            message: 'We have sent an email to reset your password',
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
const resetPassword = async (req: Request, res: Response) => {
    const {token, userId, password} = req.body
    try {
        if (!token || !userId || !password) {
            res.status(400).json({
                success: false,
                message: 'Missing token, userId, or password',
            })
            return
        }
        const user = await prisma.user.findUnique({
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
        })
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'User not found',
            })
            return
        }
        const decoded = jwt.verify(token as string, process.env.JWT_SECRET!) as { code: string }
        const resetPasswordRequest = user.emailSystem && user.emailSystem.resetPasswords.find(resetPassword => resetPassword.code === decoded.code)
        if (!resetPasswordRequest) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
            return
        }
        const { Argon2id } = await import('oslo/password');
        const hashedPassword = await new Argon2id().hash(password);
        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                hashedPassword
            }
        })
        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        })
    } catch (error) {
        console.log(error)
        if (error instanceof jwt.TokenExpiredError) {
            res.status(400).json({
                success: false,
                message: 'Token has expired',
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(400).json({
                success: false,
                message: 'Invalid token',
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    }
}
const oAuth = async (_: Request, res: Response) => {
    try {
        const {generateState, generateCodeVerifier} = await import('arctic')
        const state = generateState()
        const codeVerifier = generateCodeVerifier()
        res.cookie('state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        res.cookie('code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        })
        const url = await googlOAuthClient().then((client) => {
            return client.createAuthorizationURL(state, codeVerifier, {
                scopes: ['profile', 'email'],
            })
        })
        const modifiedUrl = new URL(url.toString());
        modifiedUrl.searchParams.append('prompt', 'consent');
        res.status(200).json({
            success: true,
            message: 'OAuth successful',
            url: modifiedUrl.toString(),
        })
    }catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
const oAuthCallback = async (req: Request, res: Response) => {
    const {code, state} = req.query
    try {
        if (!code || !state) {
            res.status(400).json({
                success: false,
                message: 'Missing code or state',
            })
            return
        }
        const codeVerifier = req.cookies.code_verifier
        const savedState = req.cookies.state
        if(!codeVerifier || !savedState) {
            res.status(400).json({
                success: false,
                message: 'Missing code verifier or state',
            })
            return
        }
        if(state !== savedState) {
            res.status(400).json({
                success: false,
                message: 'State does not match',
            })
            return
        }
        const { accessToken } = await googlOAuthClient().then((client) => {
            return client.validateAuthorizationCode(code as string, codeVerifier)
        })
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })
        const googleData = await googleResponse.json().then((data) => {
            return data as {
                id: string
                email: string
                name: string
                picture: string
            }
        })
        const existUser = await prisma.user.findUnique({
            where: {
                email: googleData.email
            }
        })
        let userId: string = ''
        if(existUser) {
            userId = existUser.id
        }
        if(!existUser) {
            const user = await prisma.user.create({
                data: {
                    email: googleData.email,
                    username: googleData.name,
                    avatar: googleData.picture,
                    isVerified: true
                }
            })
            userId = user.id
        }
        const session = await lucia().then((lucia) => lucia.createSession(userId, {}))
        const sessionCookie = await lucia().then((lucia) => lucia.createSessionCookie(session.id))
        res.cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        res.clearCookie('state')
        res.clearCookie('code_verifier')
        res.redirect(process.env.CLIENT_URL!)
    }catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
}
const signOut = async (req: Request, res: Response) => {
    const sessionId = req.cookies[process.env.SESSION_NAME || "E-COMMERCE-cookie"]
    await prisma.session.deleteMany({
        where: {
            id: sessionId
        }
    })
    res.clearCookie(process.env.SESSION_NAME!).status(200).json({
        success: true,
        message: 'Logged out successfully',
    })
}
const updateProfile = async (req: Request, res: Response) => {
    const { username, email, phone, avatar, id, addresses } = req.body
    try {
        const addressesToCreate = addresses.filter((address: any) => !address.id).map((address: any) => ({
            ...address,
            userId: id,
            id: undefined
        }))
        const addressesToUpdate = addresses.filter((address: any) => address.id).map((address: any) => ({
            ...address,
            userId: id,
        }))
        const createOperations = addressesToCreate.map((address: any) => 
            prisma.address.create({ data: address })
        )
        const updateOperations = addressesToUpdate.map((address: any) => 
            prisma.address.update({ 
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
            })
        )
        await prisma.$transaction([...createOperations, ...updateOperations])
        await prisma.user.update({
            where: {
                email
            },
            data: {
                username,
                phone,
                avatar
            }
        })
        const user = await prisma.user.findUnique({
            where: {
                email
            },
            include: {
                addresses: true
            }
        })
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}
const deleteAddress = async (req: Request, res: Response) => {
    const { id } = req.query
    try {
        const address = await prisma.address.delete({
            where: {
                id: id as string
            }
        })
        res.status(200).json({
            success: true,
            message: 'Address deleted successfully',
            address
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        })
    }
}  
export {
    signUp,
    signIn,
    verifyEmail,
    resendEmailVerification,
    forgotPassword,
    resetPassword,
    oAuth,
    oAuthCallback,
    signOut,
    updateProfile,
    deleteAddress
}
    