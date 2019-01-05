/**
 * Created by songli on 19/1/4.
 */

import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import router from './routes/index';
import config from './config/index';

const app = express();

// 解决跨域
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("X-Powered-By", '3.2.1');
    if (req.method === 'OPTIONS') {
        res.send(200);
    } else {
        next();
    }
});

app.get('/api', (req, res) => {
    res.json({message: 'api can work!'});
});

const port = process.env.PORT || 2223; // 设置启动端口
mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true }); // 连接数据库

// body-parser解析post和url信息中的参数
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// 使用morgan将请求日志打印到控制台
app.use(morgan('dev'));

router(app);

app.listen(port, () => console.log('sd-reader api ran at http://localhost:' + port));
