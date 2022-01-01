import express, { Router } from 'express';
import { register, getUser, login, logout, verifyEmail, sendVerifyEmail, getLoadMyInfo } from '../../controller/User.controller';
import { loginRequired, emailVerified, isNotEmailVerified } from '../../middleware'
const router = Router()

router.post('/register', register);
router.get('/getUser', loginRequired, getUser)
router.post('/login', login)
router.post('/logout', loginRequired, logout)
router.post('/sendVerifyEmail', loginRequired, isNotEmailVerified, sendVerifyEmail)
router.get('/verify-email', verifyEmail)
router.get('/loadMyInfo', loginRequired, getLoadMyInfo)


export default router