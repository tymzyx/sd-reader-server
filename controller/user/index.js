import UserModel from '../../models/user/index';
import crypto from 'crypto';
import dtime from 'time-formater';

const mockData = {
    username: 'test',
    password: 'test',
    email: 'test',
    mobile: 'test'
};

class User {
    constructor() {
        this.register = this.register.bind(this);
        this.encryption = this.encryption.bind(this);
    }

    async register(req, res) {
        const { username, password, email, mobile } = req.body;
        // const { username, password, email, mobile } = mockData;
        try {
            const existedUser = await UserModel.findOne({ name: username });
            if (existedUser) {
                console.log('该用户已经存在');
                res.send({
                    status: 0,
                    type: 'USER_HAS_EXIST',
                    message: '该用户已经存在',
                });
            } else {
                const newPassword = this.encryption(password);
                const newUser = {
                    name: username,
                    password: newPassword,
                    create_time: dtime(new Date()).format('YYYY-MM-DD'),
                    email,
                    mobile
                };
                await UserModel.create(newUser);
                res.send({
                    status: 1,
                    message: '用户注册成功',
                });
            }
        } catch(err) {
            console.log('注册用户失败', err);
            res.send({
                status: 0,
                type: 'REGISTER_FAILED',
                message: '用户注册失败',
            });
        }
    }
    encryption(password) {
        const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password));
        return newpassword
    }
    Md5(password) {
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }
}

export default new User();
