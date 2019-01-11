import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
    id: Number,
    name: String,
    password: String,
    vip: { type: Boolean, default: false },
    is_active: Boolean,
    avatar: String,
    mobile: String,
    email: String,
    create_time: String
});

const User = mongoose.model('User', userSchema, 'user');

export default User;
