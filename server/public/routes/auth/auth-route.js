"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../controllers/auth");
const auth_middleware_1 = require("../../middleware/auth-middleware");
const handle_file_middleware_1 = require("../../middleware/handle-file-middleware");
const router = express_1.default.Router();
router.post('/sign-up', auth_1.signUp);
router.post('/sign-in', auth_1.signIn);
router.get("/check-auth", auth_middleware_1.authMiddleware, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authenticated user!",
        user: req.body.user
    });
});
router.post('/verify-email', auth_1.verifyEmail);
router.post('/resend-email-verification', auth_1.resendEmailVerification);
router.post('/forgot-password', auth_1.forgotPassword);
router.post('/reset-password', auth_1.resetPassword);
router.get('/oauth', auth_1.oAuth);
router.get('/oauth/callback', auth_1.oAuthCallback);
router.get("/logout", auth_1.signOut);
router.put('/update-profile', handle_file_middleware_1.uploadAvatarMiddleware, auth_1.updateProfile);
router.delete('/delete-address', auth_1.deleteAddress);
exports.default = router;
