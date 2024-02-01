//userModel

import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

/**type User = Partial<Document> & {
  _id: Types.ObjectId | string;
  user_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}; */
const userSchema = new mongoose.Schema<User>({
  user_name: {
    type: String,
    required: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

const UserModel = mongoose.model<User>('User', userSchema);
export default UserModel;
