//userController
// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query

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
import jwt from 'jsonwebtoken';

const checkToken = async (
  req: Request<{token: string}>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new CustomError('No token provided', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new CustomError('JWT secret not set', 500);
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as Partial<UserOutput>;

    const userOutput: UserOutput = {
      _id: decodedToken._id || '',
      user_name: decodedToken.user_name || '',
      email: decodedToken.email || '',
    };

    res.locals.user = userOutput;
    res.json(userOutput);

    next();
  } catch (error) {
    console.error('Token Check Error:', (error as Error).message);
    next(new CustomError((error as Error).message, 400));
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
    // hash the password with bcrypt before saving it to the user
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
