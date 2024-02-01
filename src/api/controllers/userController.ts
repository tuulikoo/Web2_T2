//userController
// TODO: create the following functions:
// - userGet - get user by id
// - userListGet - get all users
// - userPost - create new user. Remember to hash password
// - userPutCurrent - update current user
// - userDeleteCurrent - delete current user
// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query

import {Request, Response, NextFunction} from 'express';
import {UserInput, UserOutput} from '../../types/DBTypes';
import UserModel from '../models/userModel';
import CustomError from '../../classes/CustomError';
import {MessageResponse, PostMessageUser} from '../../types/MessageTypes';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const checkToken = async (
  req: Request,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;
    console.log('Authorization Header:', bearer);
    if (!bearer) {
      console.log('No token provided');
      throw new CustomError('No token provided', 401);
    }
    const token = bearer.split(' ')[1];
    console.log('Extracted Token:', token);
    if (!token) {
      throw new CustomError('No token provided', 401);
    }

    if (!process.env.JWT_SECRET) {
      throw new CustomError('JWT secret not set', 500);
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as UserOutput;

    res.locals.user = decodedToken;

    next();
  } catch (error) {
    console.error('Token Check Error:', (error as Error).message);
    next(new CustomError((error as Error).message, 400));
  }
};

// - checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
const userListGet = async (
  _req: Request,
  res: Response<UserOutput[]>,
  next: NextFunction
) => {
  try {
    const users = await UserModel.find();
    res.json(users);
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
    // User information is already available in res.locals.user
    res.json(res.locals.user);
  } catch (error) {
    next(error);
  }
};
// - userPost - create new user. Remember to hash password
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
//userPutCurrent - update current user
//checkToken - check if current user token is valid: return data from res.locals.user as UserOutput. No need for database query
const userPutCurrent = async (
  req: Request<{}, {}, Partial<UserInput>>,
  res: Response<UserOutput>,
  next: NextFunction
) => {
  try {
    // Update the user based on the user information available in res.locals.user
    const user = await UserModel.findByIdAndUpdate(
      res.locals.user._id,
      req.body,
      {new: true}
    );
    if (!user) {
      throw new CustomError('User not found', 404);
    }
    res.json(user);
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
    res.json({message: 'User deleted'});
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
