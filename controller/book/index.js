import BookModel from '../../models/book/index';

class Book {
    constructor() {

    }

    async bookDetail(req, res) {
        const { bookId } = req.query;
        console.log(req.query);
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
}

export default new Book();
