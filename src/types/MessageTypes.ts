import {UserOutput} from './DBTypes';

type MessageResponse = {
  message: string;
};

type ErrorResponse = MessageResponse & {
  stack?: string;
};

type LoginResponse = {
  token: string;
  user: UserOutput;
};

type UploadResponse = MessageResponse & {
  id: number;
};
type PostMessageUser = MessageResponse & {
  data: UserOutput;
};
type PostMessage = MessageResponse & {
  _id: number;
};

export {
  MessageResponse,
  ErrorResponse,
  LoginResponse,
  UploadResponse,
  PostMessage,
  PostMessageUser,
};
