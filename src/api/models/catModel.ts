import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

// TODO: mongoose schema for cat
/**type Cat = Partial<Document> & {
  _id?: Types.ObjectId | string;
  cat_name: string;
  weight: number;
  owner: Types.ObjectId | User;
  filename: string;
  birthdate: Date;
  location: Point;
}; */
const catSchema = new mongoose.Schema<Cat>({
  cat_name: {
    type: String,
    required: true,
    minlength: 2,
  },
  weight: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

const CatModel = mongoose.model<Cat>('Cat', catSchema);
export default CatModel;
