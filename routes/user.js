import express from 'express';
import User from '../controller/user/index';

const router = express.Router();

router.post('/register', User.register);

export default router;
