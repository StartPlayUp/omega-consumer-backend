import express from "express";
import "reflect-metadata";
import routes from "../routes";
import cookieParser from "cookie-parser";
import morgan from 'morgan';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';

import options from '../swagger.option'
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const server = express()

// const options = {
//     definition: {
//         openapi: '3.0.0',
//         info: {
//             title: 'Hello World',
//             version: '1.0.0',
//         },
//     },
//     apis: ['./src/routes*.js'], // files containing annotations as above
// };

if (process.env.NODE_ENV !== 'production') {
    server.use(cors({
        origin: '*'
    }));
}
const swaggerSpec = swaggerJsdoc(options);
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
