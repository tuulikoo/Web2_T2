import express from 'express';
import {authenticate} from '../../middlewares';
import {
  checkToken,
  userDeleteCurrent,
  userGet,
  userListGet,
  userPost,
  userPutCurrent,
} from '../controllers/userController';

const router = express.Router();

router
  .route('/')
  .get(userListGet)
  .post(userPost)
  .put(authenticate, userPutCurrent)
  .delete(authenticate, userDeleteCurrent);

router.get('/token', authenticate, checkToken);

router.route('/:id').get(userGet);

export default router;
