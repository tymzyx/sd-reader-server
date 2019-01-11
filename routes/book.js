import express from 'express';
import Book from '../controller/book/index';

const router = express.Router();

router.get('/detail', Book.bookDetail);

export default router;
