"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    host: "smtp.email.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.APP_PASSWORD,
    },
});
const sendEmail = (to, subject, html) => {
    try {
        transporter.sendMail({
            from: {
                name: "E-Commerce",
                address: process.env.SENDER_EMAIL
            },
            to,
            subject,
            html
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.sendEmail = sendEmail;
