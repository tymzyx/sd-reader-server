import user from './user';
import book from './book';

export default app => {
    app.use('/api/user', user);
    app.use('/api/book', book);
};
