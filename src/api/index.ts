import express from 'express';
import userRoute from './routes/userRoute';
import catRoute from './routes/catRoute';
import authRoute from './routes/authRoute';
import {MessageResponse} from '../types/MessageTypes';

const router = express.Router();

router.use('/users', userRoute);
router.use('/cats', catRoute);
router.use('/auth', authRoute);

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'routes: auth, user, cat',
  });
});

export default router;