import UserModel from '../../models/user/index';
import crypto from 'crypto';
import dtime from 'time-formater';
import uuidv4 from 'uuid/v4';

const mockData = {
    username: 'test',
    password: 'test',
    email: 'test',
    mobile: 'test'
};

class User {
    constructor() {
        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.encryption = this.encryption.bind(this);
    }

    async register(req, res) {
        const { password, email, mobile } = req.body;
        const username = req.body.username || mobile;
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
                    id: uuidv4(),
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
        } catch (err) {
            console.log('注册用户失败', err);
            res.send({
                status: 0,
                type: 'REGISTER_FAILED',
                message: '用户注册失败',
            });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;
        try {
            const userInfo = await UserModel.findOne({name: username});
            if (userInfo) {
                if (userInfo.password === this.encryption(password)) {
                    res.send({
                        status: 1,
                        type: 'SUCCESS',
                        message: '登陆成功~',
                    })
                } else {
                    res.send({
                        status: 0,
                        type: 'FAILED',
                        message: '密码错误~',
                    })
                }
            } else {
                res.send({
                    status: 0,
                    type: 'FAILED',
                    message: '账号不存在~',
                })
            }
        } catch (err) {
            console.log(err);
            res.send({
                status: 0,
                type: 'FAILED',
                message: '登录失败~',
            })
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
