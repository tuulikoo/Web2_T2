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

type UpdateMessageResponse<T> = MessageResponse & {data?: T};

export {
  MessageResponse,
  ErrorResponse,
  LoginResponse,
  UploadResponse,
  PostMessage,
  PostMessageUser,
  UpdateMessageResponse,
};
