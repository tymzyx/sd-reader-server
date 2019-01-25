import express from 'express';
import Book from '../controller/book/index';

const router = express.Router();

router.get('/detail', Book.bookDetail);
router.get('/content', Book.bookContent);

export default router;
