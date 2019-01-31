import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    id: String,
    author: String,   // 评论人id
    content: String,  // 评论内容
    likes: Number,    // 点赞数（仅类型为书评时拥有该字段）
    type: String,     // 评论类型（书评-book，回复-user）
    toId: String,     // 被评论id
    time: String,     // 评论时间（YYYY-MM-DD HH:MM）
    rate: Number      // 评分（仅类型为书评时拥有该字段）
});

const Comment = mongoose.model('Comment', commentSchema, 'comment');

export default Comment;
