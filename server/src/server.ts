import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv'
import authRouter from './routes/auth/auth-route'
import adminRouter from './routes/admin/admin-route'
import userRouter from './routes/user/user-route'
import bodyParser from 'body-parser'
import path from 'path'
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

app.use('/api',
    cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma', 'X-Requested-With'],
    })
)
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit:50000 }));
app.use(bodyParser.json({ limit: '50mb'}));
app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use(express.static(path.join(__dirname, "public")));

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})