/* eslint-disable @typescript-eslint/no-var-requires */
import { server as mockServer } from './mock.js';
import express from 'express';

import cors from 'cors';
// const axios = require("axios");
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

// const express = require('express');
// const cors = require('cors');
// // const axios = require("axios");
// const { createProxyMiddleware } = require('http-proxy-middleware');
// require('dotenv').config();

if (process.env.MSW_ENABLE  === 'true') {
    console.log('Start Mock Service Worker');
    mockServer.listen();
}

const app = express();

if (process.env.TARGET_SERVER == null || process.env.TARGET_SERVER.length === 0) {
    console.log('Please add the Target Server address in the .env file');
} else {
    console.log(`Target Server: ${process.env.TARGET_SERVER}`);
}

if (process.env.JWT_TOKEN == null || process.env.JWT_TOKEN.length === 0) {
    console.log('Please add the JWT TOKEN in the .env file');
} else {
    console.log(`JWT Token: ${process.env.JWT_TOKEN}`);
}

const TARGET = process.env.TARGET_SERVER;
const JWT = process.env.JWT_TOKEN;

const httpProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
    logger: console,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Authorization', JWT);
    }
});

const wsProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true, // for vhosted sites, changes host header to match to target's host
    logger: console,
    ws: true,
    onProxyReqWs: (proxyReq, req, socket, options, head) => {
        proxyReq.setHeader('accept', 'json');
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Authorization', JWT);
    }
});

const corsOptions = {
    origin: 'http://localhost:8000',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// app.get("/apis/logo", (req, res) => {
//   console.log(req);
//   axios
//     .get("http://10.1.2.27:4000/apis/logo")
//     .then((res) => {
//       console.log(res);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.use('/apis/query/denovo', wsProxy);
app.use('/apis/query/sl/peptide', wsProxy);
app.use('/apis/query/peptide', wsProxy);
app.use('/apis/query/lfq/peptide', wsProxy);
app.use('/apis/query/riq/peptide', wsProxy);
app.use('/apis/query/silac/peptide', wsProxy);
app.use('/apis/query/lfq/protein-fold-change', wsProxy);
app.use('/apis/query/riq/protein-fold-change', wsProxy);
app.use('/apis', httpProxy);

app.get('/', (req, res) => {
    res.json({
        text: 'local proxy server is working. [GET]'
    });
});

const server = app.listen(4000);

console.log('Local Proxy Server: listening on port 4000');

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());
