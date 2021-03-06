import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { checkEmailVerifyFromId } from '../../service/User.service';
import requestIp from 'request-ip';
// import cookie from 'cookie-parser'

declare namespace Express {
    export interface Res extends Response {
        user: string
    }
}


const loginRequired = async (req: any, res: any, next: NextFunction) => {
    try {
        const token = req.cookies['access-token']
        const secret: any = process.env.JWT_SECRET
        if (token) {
            const validateToken: any = jwt.verify(token, secret);
            if (validateToken) {
                req.user = {
                    id: validateToken.id,
                    nickname: validateToken.nickname
                }
                next()
            }
            else {
                console.log("token expires");
                // res.redirect('/')
                res.status(500).json({ success: false, message: "token expires" })
            }

        }
        else {
            console.log('token not found')
            // res.redirect('/')
            res.status(500).json({ success: false, message: "token not found" })

        }
    }
    catch (err) {
        // console.log(err)
        res.cookie('access-token', "", { maxAge: 1 })
        // res.redirect('/')
    }
}

const emailVerified = async (req: Request, res: any, next: NextFunction) => {
    const id = req.body.id as string;
    console.log(id)
    const result = await checkEmailVerifyFromId({ id });
    if (result.success) {
        next()
    }
    else {
        console.log(result.error)
        return res.status(500).json(result)
    }
}

const isNotEmailVerified = async (req: Request, res: any, next: NextFunction) => {
    const id = req.body.id as string;
    console.log(id)
    const result = await checkEmailVerifyFromId({ id });
    if (result.success) {
        result.error = "이미 이메일 인증을 받았습니다."
        console.log(result.error)
        return res.status(500).json(result).redirect('/emailVerify')
    }
    else {
        next()
    }
}

const ipMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const clientIp = requestIp.getClientIp(req);

    if (req.user === undefined) {
        req.user = {}
    }
    req.user.ipAddress = clientIp as string;
    next();
};

export { loginRequired, emailVerified, isNotEmailVerified, ipMiddleware }