import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const keywordSchema = new Schema({
    id: String,
    keyword: String
});

const Keyword = mongoose.model('Keyword', keywordSchema, 'keyword');

export default Keyword;
