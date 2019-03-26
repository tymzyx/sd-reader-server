import express from 'express';
import Book from '../controller/book/index';
import multer from 'multer';

const router = express.Router();
const upload = multer();

router.get('/detail', Book.bookDetail);
router.get('/content', Book.bookContent);
router.post('/upload', upload.single('book'), Book.bookUpload);
router.post('/cover', upload.single('cover'), Book.bookCover);
router.get('/keywords', Book.bookSearchTips);
router.get('/search', Book.bookSearch);

export default router;
