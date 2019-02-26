/**
 * 读取本地书籍文件入库（暂时仅支持txt文件）
 * author: tymzyx
 * date: 2019.1
 * */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import BookModel from '../../models/book/index';
import config from '../../config/index';

mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true });

// 目前采用手动输入的方式，之后考虑通过解析文件获取相应信息
const bookDetail = {
    title: '我们仨',
    author: '杨绛',
    score: 5,
    readers: 0,
    share: '1',
    type: '小说',
    brief: '',
    content: []
};

// 书籍路径
const bookUrl = path.resolve(__dirname, '../../test.txt');

const saveBook = () => {
    fs.readFile(bookUrl, async(err, data) => {
        if (err) {
            console.log('error', err);
            process.exit();
        } else {
            try {
                data = data.toString();
                let dataList = data.split('\n');
                dataList = dataList.map(ele => (
                    ele.trim().replace(/[\r\n]/g, '')
                )).filter(ele => ele);
                bookDetail.content = dataList;
                const count = await BookModel.countDocuments({});
                bookDetail.id = String(count + 1);
                await BookModel.create(bookDetail);
                console.log('save success!');
            } catch (err) {
                console.log('error', err);
            } finally {
                process.exit();
            }
        }
    });
};

saveBook();
