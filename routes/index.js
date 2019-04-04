import user from './user';
import book from './book';
import topic from './topic';

export default app => {
    app.use('/api/user', user);
    app.use('/api/book', book);
    app.use('/api/topic', topic);
};
