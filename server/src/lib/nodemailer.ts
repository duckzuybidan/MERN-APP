import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.email.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });
export const sendEmail = (to: string, subject: string, html: string) => {
    try {
        transporter.sendMail({
            from: {
                name: "E-Commerce",
                address: process.env.SENDER_EMAIL!
            },
            to,
            subject,
            html
        });
    } catch (error) {
        console.log(error);
    }

}