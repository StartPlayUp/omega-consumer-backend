import { Request, Response } from 'express';
import { createUser, getUserFromId, loginCheckUser, updateUser, verifyEmailUser } from '../../service/User.service';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import config from '../../config'
import { sendMail } from '../../utilities/apiUtilities';


const transporter = nodemailer.createTransport(config.mailConfig);

const register = async (req: Request, res: Response) => {
    const { id, nickname, email, password } = req.body;
    console.log("register : ", id, nickname, email, password)
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const emailToken = crypto.randomBytes(64).toString('hex');
    const result = await createUser({
        id,
        nickname,
        email,
        password: hashPassword,
        emailToken,
        isVerified: false,
    });
    const mailOptions = {
        from: '"Verify your email <startPlayUp@gmail.com>',
        to: email,
        subject: 'codewithsid = - verfiy your email',
        html: `
            <h2> ${nickname} 회원님</h2>
            <h4> 가입하시려면 이메일 인증이 필요합니다. 아래 인증하기 버튼을 눌러주세요</h4>
            <a href="http://${req.headers.host}/api/user/verify-email?token=${emailToken}">인증하기</a>
        `
    }
    if (result.success) {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            }
            else {
                console.log("인증 메일을 보냈습니다.")
            }
        })

        return res.status(201).json(result);
    }
    else {
        return res.status(500).json(result)
    }
}

const createToken = ({ id, nickname }: { id: string, nickname: string }) => {
    const secret: any = process.env.JWT_SECRET
    return jwt.sign({ id, nickname }, secret, { expiresIn: '1h' });
}


const login = async (req: Request, res: Response) => {
    const { id, password } = req.body;
    console.log(id, password)
    const result = await loginCheckUser({ id, password });
    if (result.success) {
        const token = createToken({ id, nickname: result.user.nickname })
        res.cookie('access-token', token, {
            secure: true,
            httpOnly: true,
            maxAge: 3600000
        })
        // res.redirect('/dashboard')
        return res.status(201).json(result);
    }
    else {
        return res.status(500).json(result)
    }
}

const getLoadMyInfo = async (req: Request, res: Response) => {
    const { id, nickname } = req.user as { id: string, nickname: string }
    console.log("getLoadMyInfo", id, nickname);
    // const token = createToken(id)
    // res.cookie('access-token', token, {
    //     secure: true,
    //     httpOnly: true,
    //     maxAge: 3600000
    // })
    return res.status(201).json({ success: true, id, nickname });
}




const verifyEmail = async (req: Request, res: Response) => {
    const emailToken = req.query.token as string
    console.log(emailToken)
    const result = await verifyEmailUser({ emailToken })
    if (result.success) {
        return res.status(201).redirect("/");
    }
    else {
        return res.status(500).redirect("/");
    }
}



const sendVerifyEmail = async (req: Request, res: Response) => {
    const id = req.user.id as string;
    const nickname = req.user.nickname as string;
    const email = req.body.email as string;
    const host = req.headers.host;
    const emailToken = crypto.randomBytes(64).toString('hex');
    const result = await updateUser({ id, email, emailToken })
    console.log("update User", result)
    if (result.success) {
        await sendMail({ host, email, emailToken, nickname });
        return res.status(201).json({
            success: true,
            message: "인증메일을 보냈습니다."
        })
    }
    else {
        return res.status(201).json({
            success: false,
            message: "인증 메일 보내기에 실패하였습니다."
        });
    }
}

const logout = async (req: Request, res: Response) => {
    res.cookie('access-token', "", { maxAge: 1 })
    res.status(201).json({ success: true })
}


const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string }
    const result = await getUserFromId({ id });
    if (result.success) {
        return res.status(201).json(result);
    }
    else {
        return res.status(500).json(result)
    }
}


const getUser = async (req: Request, res: Response) => {
    const { id } = req.user as { id: string }
    const result = await getUserFromId({ id });
    if (result.success) {
        return res.status(201).json(result);
    }
    else {
        return res.status(500).json(result)
    }
}




export { register, getUser, deleteUser, login, logout, verifyEmail, sendVerifyEmail, getLoadMyInfo }
