import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const topicSchema = new Schema({
    id: String,
    creator: String,
    is_active: Boolean,
    title: String,
    content: String,
    time: String,
    comments: Array
});

const Topic = mongoose.model('Topic', topicSchema, 'topic');

export default Topic;
