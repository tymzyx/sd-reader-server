import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const bookSchema = new Schema({
    id: Number,
    title: String,
    author: String,
    score: Number,
    readers: { type: Number, default: 0 },
    share: Number, // 分享人id
    type: String,
    problems: Array,
    brief: String,
    content: Array,
    catalog: Array,
    image: String
});

const Book = mongoose.model('Book', bookSchema, 'book');

export default Book;
