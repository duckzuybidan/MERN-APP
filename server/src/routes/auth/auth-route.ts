import express, { Request, Response } from "express";
import { 
  signUp, 
  signIn, 
  verifyEmail, 
  resendEmailVerification, 
  forgotPassword, resetPassword, 
  oAuth, 
  oAuthCallback, 
  signOut, 
  updateProfile,
  deleteAddress,
} from "../../controllers/auth";
import { authMiddleware } from "../../middleware/auth-middleware";
import { uploadAvatarMiddleware } from "../../middleware/handle-file-middleware";
const router = express.Router();

router.post('/sign-up', signUp)
router.post('/sign-in', signIn)
router.get("/check-auth", authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user: req.body.user
    });
  });
router.post('/verify-email', verifyEmail)
router.post('/resend-email-verification', resendEmailVerification)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/oauth', oAuth)
router.get('/oauth/callback', oAuthCallback)
router.get("/logout", signOut);
router.put('/update-profile', uploadAvatarMiddleware, updateProfile)
router.delete('/delete-address', deleteAddress)
export default router