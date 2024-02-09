import {Request, Response, NextFunction} from 'express';
import {User, UserInput, UserOutput} from '../../types/DBTypes';
import UserModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {
  MessageResponse,
  PostMessageUser,
  UpdateMessageResponse,
} from '../../types/MessageTypes';
import bcrypt from 'bcryptjs';
import CatModel from '../models/catModel';

const checkToken = async (
  req: Request,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError('User not found', 400);
    }
    const {password, role, ...OutputUser} = res.locals.user;
    res.json(OutputUser);
  } catch (error) {
    next(error);
  }
};

const userListGet = async (
  _req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find().select('_id user_name email');
    const transformedUsers: UserOutput[] = users.map((user) => ({
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    }));

    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
};

const userGet = async (
  req: Request<{id: string}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      throw new CustomError('User not found', 404);
    }
    const response: Pick<User, '_id' | 'user_name' | 'email'> = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const userPost = async (
  req: Request<{}, {}, UserInput>,
  res: Response<PostMessageUser>,
  next: NextFunction
) => {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds);
    const user = await UserModel.create({
      ...req.body,
      password: passwordHash,
    });

    const sanitizedUser = {
      _id: user._id,
      user_name: user.user_name,
      email: user.email,
    };

    res.status(200).json({message: 'OK', data: sanitizedUser});
    console.log('userPost as UserOutput', sanitizedUser);
  } catch (error) {
    next(error);
  }
};

const userPutCurrent = async (
  req: Request<{}, {}, Partial<UserInput>>,
  res: Response<UpdateMessageResponse<Partial<UserInput>>>,
  next: NextFunction
) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      res.locals.user._id,
      req.body,
      {new: true}
    );

    if (!updatedUser) {
      throw new CustomError('User not found', 404);
    }

    const response: UpdateMessageResponse<Partial<UserInput>> = {
      message: 'OK',
      data: req.body,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

const userDeleteCurrent = async (
  req: Request,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    // Delete the user based on the user information available in res.locals.user
    const user = await UserModel.findByIdAndDelete(res.locals.user._id);
    if (!user || !res.locals.user._id) {
      throw new CustomError('User not found', 404);
    }
    await CatModel.deleteMany({owner: res.locals.user._id});
    const response: MessageResponse & {data: Partial<User>} = {
      message: 'User deleted',
      data: {
        _id: res.locals.user._id,
        user_name: res.locals.user.user_name,
        email: res.locals.user.email,
      },
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};
export {
  userListGet,
  userGet,
  userPost,
  userPutCurrent,
  userDeleteCurrent,
  checkToken,
};
