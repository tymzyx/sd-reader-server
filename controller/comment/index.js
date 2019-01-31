import CommentModel from '../../models/comment/index';
import uuidv4 from 'uuid/v4';
import dtime from 'time-formater';

class Comment {
    async addComment(req, res) {
        try {
            const { author, content, type, toId, likes, rate } = req.body;
            const time = dtime(new Date()).format('YYYY-MM-DD HH:MM');
            const uid = uuidv4();
            let newComment;
            if (type === 'book') {
                newComment = {
                    id: uid,
                    author,
                    content,
                    type,
                    toId,
                    likes,
                    rate,
                    time
                };
            } else if (type === 'user') {
                newComment = {
                    id: uid,
                    author,
                    content,
                    type,
                    toId,
                    time
                };
            }
            await CommentModel.create(newComment);
            res.send({
                status: 1,
                message: '添加评论成功',
            });
        } catch (err) {
            console.log('添加评论失败', err);
            res.send({
                status: 0,
                type: 'COMMENT_FAILED',
                message: '添加评论失败',
            });
        }

    }
}

export default new Comment();
