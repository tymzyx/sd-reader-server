import BookModel from '../../models/book/index';
import KeywordModel from '../../models/keyword/index';
import { segmentOperator, pageOperator } from '../../utils/contentOperator/index';
import uuidv4 from 'uuid/v4';
import pinyin from 'pinyin';

let globalBookContent = {};
let globalContentQuery;

class Book {
    async bookList(req, res) {
        const { type, startNum, limit } = req.query;
        try {
            const list = await BookModel.find(
                {
                    type
                },
                'title image id',
                {
                    skip: +startNum,
                    limit: +limit
                }
            );
            res.send({
                status: 1,
                message: { list }
            });
        } catch (err) {
            console.log('查询书籍列表失败', err);
            res.send({
                status: 0,
                type: 'QUERY_BOOK_LIST_FAILED',
                message: '查询书籍列表失败',
            });
        }
    }

    async bookDetail(req, res) {
        const { bookId } = req.query;
        try {
            const detail = await BookModel.findOne({ id: bookId }, 'id title image author share brief readers score');
            const detailInfo = {
                id: detail.id,
                title: detail.title,
                image: detail.image || '',
                author: detail.author,
                share: detail.share,
                brief: detail.brief,
                readers: detail.readers,
                score: detail.score
            };
            res.send({
                status: 1,
                message: detailInfo
            });
        } catch (err) {
            console.log('查询书籍详情失败', err);
            res.send({
                status: 0,
                type: 'QUERY_BOOK_DETAIL_FAILED',
                message: '查询书籍详情失败',
            });
        }
    }

    async bookContent(req, res) {
        const { bookId, pageNum = 1, wordNum, rowNum } = req.query;
        try {
            if (globalBookContent.id !== bookId) {
                globalContentQuery = await BookModel.findOne({ id: bookId }, 'content');
                globalBookContent.id = bookId;
            }
            if (
                globalBookContent.id !== bookId ||
                globalBookContent.wordNum !== wordNum ||
                globalBookContent.rowNum !== rowNum
            ) {
                globalBookContent = {
                    ...globalBookContent,
                    wordNum,
                    rowNum
                };

                let splitContent = [];
                globalContentQuery.content.forEach((segment, index) => {
                    splitContent = splitContent.concat(segmentOperator(segment, +wordNum));
                    index !== (globalContentQuery.content.length - 1) && splitContent.push('blank line');
                });
                const operatedContent = pageOperator(splitContent, +rowNum);
                globalBookContent.content = operatedContent;
                globalBookContent.totalPage = operatedContent.length;
            }
            let sNum = pageNum - 10 < 0 ? 0 : pageNum - 10;
            if (sNum > globalBookContent.totalPage) {
                sNum = globalBookContent.totalPage - 20;
            }
            const eNum = sNum + 20;
            const retBookContent = {
                id: globalBookContent.id,
                content: globalBookContent.content.slice(sNum, eNum),
                totalPage: globalBookContent.totalPage
            };
            res.send({
                status: 1,
                message: retBookContent
            });
        } catch (err) {
            console.log('获取书籍内容失败', err);
            res.send({
                status: 0,
                type: 'QUERY_BOOK_DETAIL_FAILED',
                message: '获取书籍内容失败',
            });
        }
    }

    async bookUpload(req, res) {
        try {
            const { title, author, type, share } = req.body;
            let { brief, image } = req.body;
            const { buffer } = req.file;
            brief = brief === undefined ? '' : brief;
            image = image === undefined ? '' : image;

            const pinyinLists = pinyin(title, {
                style: pinyin.STYLE_NORMAL
            });
            const pinyinList = [];
            pinyinLists.forEach(item => {
                pinyinList.push(item[0]);
            });
            const pinyinStr = pinyinList.join(' ');

            const authorPinyinLists = pinyin(author, {
                style: pinyin.STYLE_NORMAL
            });
            const authorPinyinList = [];
            authorPinyinLists.forEach(item => {
                authorPinyinList.push(item[0]);
            });
            const author_pinyin = authorPinyinList.join(' ');

            const bookContent = buffer.toString();
            let dataList = bookContent.split('\n');
            dataList = dataList.map(ele => (
                ele.trim().replace(/[\r\n]/g, '')
            )).filter(ele => ele);

            const bookDetail = {
                id: uuidv4(),
                title,
                author,
                author_pinyin,
                share,
                type,
                brief,
                image,
                pinyin: pinyinStr,
                content: dataList,
                score: 0,
                readers: 0
            };
            await BookModel.create(bookDetail);
            res.send({
                status: 1,
                message: 'success',
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: 0,
                type: 'UPLOAD_BOOK_FAILED',
                message: '上传书籍失败',
            });
        }
    }

    // 上传书籍图片
    bookCover(req, res) {
        const { buffer } = req.file;
        res.send({
            status: 1,
            message: {
                img: buffer.toString('base64')
            }
        });
    }

    async bookSearchTips(req, res) {
        const { keyword } = req.query;
        try {
            const reg = new RegExp(keyword, 'i');
            const result = await BookModel.find(
                {
                    $or: [
                        { title: { $regex: reg }},
                        { pinyin: { $regex: reg }},
                        { author: { $regex: reg }},
                        { author_pinyin: { $regex: reg }}
                    ]
                },
                'title author pinyin author_pinyin',
                {
                    limit: 100
                }
            );
            const cacheWords = await KeywordModel.find({
                keyword: { $regex: reg }
            }, 'keyword', { limit: 100 });
            if (result.length || cacheWords.length) {
                const items = [];
                cacheWords.forEach(word => {
                    items.push(word.keyword);
                });
                result.forEach(single => {
                    if (reg.test(single.title) || reg.test(single.pinyin)) {
                        items.push(single.title);
                    }
                    if (reg.test(single.author) || reg.test(single.author_pinyin)) {
                        items.push(single.author);
                    }
                });
                res.send({
                    status: 1,
                    message: {
                        items
                    }
                });
            } else {
                res.send({
                    status: 1,
                    message: {
                        items: []
                    }
                });
            }
        } catch (error) {
            console.log('error', error);
            res.send({
                status: 0,
                type: 'SEARCH_TIPS_FAILED',
                message: '关键词联想失败',
            });
        }
    }

    async bookSearch(req, res) {
        const { keyword } = req.query;
        try {
            const reg = new RegExp(keyword, 'i');
            const result = await BookModel.find(
                {
                    $or: [
                        { title: { $regex: reg }},
                        { pinyin: { $regex: reg }},
                        { author: { $regex: reg }},
                        { author_pinyin: { $regex: reg }}
                    ]
                },
                'title author image brief'
            );
            if (result.length) {
                res.send({
                    status: 1,
                    message: {
                        results: result
                    }
                });
                const keywords = await KeywordModel.find({ keyword });
                if (!keywords.length) {
                    await KeywordModel.create({
                        id: uuidv4(),
                        keyword
                    });
                }
            } else {
                res.send({
                    status: 1,
                    message: {
                        results: []
                    }
                });
            }
        } catch (error) {
            console.log('error', error);
            res.send({
                status: 0,
                type: 'SEARCH_BOOK_FAILED',
                message: '搜索书籍失败',
            });
        }
    }
}

export default new Book();
