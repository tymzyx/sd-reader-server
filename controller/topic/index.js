import TopicModel from '../../models/topic/index';
import uuidv1 from 'uuid/v1';
import dtime from 'time-formater';

class Topic {
    async topicOperator(req, res) {
        try {
            const { id, title, content, type, isActive, creator = 'admin' } = req.body;
            const uid = uuidv1();
            const time = dtime(new Date()).format('YYYY-MM-DD HH:MM');
            const comments = [];
            const topicItem = {
                title,
                content,
                creator,
                time,
                comments,
                is_active: isActive
            };
            switch (type) {
                case '0': // 新建add
                    topicItem.id = uid;
                    await TopicModel.create(topicItem);
                    break;
                case '1': // 编辑edit
                    await TopicModel.updateOne({ id }, topicItem);
                    break;
                case '2': // 删除delete
                    await TopicModel.deleteOne({ id });
                    break;
                default:
                    break;
            }
            res.send({
                status: 1,
                message: 'success',
            });
        } catch (error) {
            console.log(error);
            res.send({
                status: 0,
                type: 'OPERATE_TOPIC_FAILED',
                message: '操作话题信息失败',
            });
        }
    }

    async topicList(req, res) {
        const { startNum, limit } = req.query;
        try {
            const list = await TopicModel.find(
                {},
                'title content id creator is_active comments',
                {
                    skip: +startNum,
                    limit: +limit
                }
            );
            res.send({
                status: 1,
                message: { list }
            });
        } catch (error) {
            console.log('获取话题列表失败', error);
            res.send({
                status: 0,
                type: 'QUERY_TOPIC_LIST_FAILED',
                message: '获取话题列表失败',
            });
        }
    }

    async topicDetail(req, res) {
        const { id } = req.query;
        try {
            const detail = await TopicModel.findOne(
                { id },
                'title content id creator is_active comments'
            );
            res.send({
                status: 1,
                message: detail
            });
        } catch (error) {
            console.log('获取话题详情失败', error);
            res.send({
                status: 0,
                type: 'QUERY_TOPIC_DETAIL_FAILED',
                message: '获取话题详情失败',
            });
        }
    }
}

export default new Topic();
