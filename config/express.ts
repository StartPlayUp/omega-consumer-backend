import express from "express";
import "reflect-metadata";
import routes from "../routes";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import cors from 'cors';
// import path from 'path';
import hpp from 'hpp';
import helmet from 'helmet';
const server = express()

if (process.env.NODE_ENV !== 'production') {
    server.use(cors({
        origin: '*'
    }));
}

require('dotenv').config();
server.use(cookieParser())
server.use(express.json())
server.use(express.urlencoded({ extended: false }));
server.use(express.json())
server.use(morgan('combined'));
server.use(hpp());
server.use(helmet({ contentSecurityPolicy: false }));
// server.use(express.static(path.join(__dirname, '../public')))
server.use('/api', routes)

export default server;
