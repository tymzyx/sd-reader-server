import BookModel from '../../models/book/index';
import { segmentOperator, pageOperator } from '../../utils/contentOperator/index';

let globalBookContent = {};
let globalContentQuery;

class Book {
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
}

export default new Book();
