import express from 'express';
import Topic from '../controller/topic/index';

const router = express.Router();

router.post('/operate', Topic.topicOperator);
router.get('/list', Topic.topicList);
router.get('/detail', Topic.topicDetail);

export default router;
