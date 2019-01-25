import BookModel from '../../models/book/index';
import { segmentOperator, pageOperator } from '../../utils/contentOperator/index';

let globalBookContent;

class Book {
    constructor() {

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
                message: { data: detailInfo, code: 200 }
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
        const { bookId, pageNum, wordNum, rowNum } = req.query;
        try {
            globalBookContent = {};
            const query = await BookModel.findOne({ id: bookId }, 'content');
            globalBookContent.id = bookId;
            let splitContent = [];
            query.content.forEach((segment, index) => {
                splitContent = splitContent.concat(segmentOperator(segment, +wordNum));
                index !== (query.content.length - 1) && splitContent.push('blank line');
            });
            const operatedContent = pageOperator(splitContent, +rowNum);
            globalBookContent.content = operatedContent;
            globalBookContent.totalPage = operatedContent.length;
            res.send({
                status: 1,
                message: { data: globalBookContent, code: 200 }
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
