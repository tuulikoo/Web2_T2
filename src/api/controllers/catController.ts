import {NextFunction, Request, Response} from 'express';
import {Cat, LoginUser} from '../../types/DBTypes';
import CatModel from '../models/catModel';
import CustomError from '../../classes/CustomError';
import {MessageResponse, PostMessage} from '../../types/MessageTypes';
// TODO: create following functions:
// - catGetByUser - get all cats by current user id****
// - catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
// - catPutAdmin - only admin can change cat owner*****
// - catDeleteAdmin - only admin can delete cat*****
// - catDelete - only owner can delete cat*****
// - catPut - only owner can update cat*****
// - catGet - get cat by id**********
// - catListGet - get all cats******
// - catPost - create new cat********
const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.find();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGet = async (
  req: Request<{id: string}>,
  res: Response<Cat>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.findById(req.params.id);
    if (!cats) {
      throw new CustomError('Cat not found', 404);
    }
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const catGetByUser = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError('Invalid user data', 400);
    }
    const cats = await CatModel.find({owner: res.locals.user._id});
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

/**
 *
Create a postCat function that sends a POST request to /api/v1/cats/ with the following parameters:
- token: string - user token
- pic: string - path to the cat picture file
The function should return a Promise that resolves to a MessageResponse & {data: Cat} object.
 */
const catPost = async (
  req: Request<{token: string; pic: string}, {}, Omit<Cat, '_id'>>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  console.log('Uploaded File:', req.file);
  console.log('Uploaded File Path:', req.file?.path);
  req.body.filename = req.file?.path || '';
  try {
    console.log('res.locals.user', res.locals.user);
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError('Invalid user data', 400);
    }

    req.body.location = {
      ...req.body.location,
      type: 'Point',
    };

    const cat = await CatModel.create({
      ...req.body,
      owner: res.locals.user._id,
    });
    console.log('cat', cat);
    const response: MessageResponse & {data: Cat} = {
      message: 'OK',
      data: cat,
    };
    console.log('Response Body:', response);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response<PostMessage>,
  next: NextFunction
) => {
  try {
    req.body.location = {
      ...req.body.location,
      type: 'Point',
    };
    const cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError('Invalid user data', 400);
    }
    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }
    res.json({message: 'Cat updated', _id: cat._id});
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response<PostMessage>,
  next: NextFunction
) => {
  try {
    // Check if the user is an admin
    if (!res.locals.user || res.locals.user.role !== 'admin') {
      throw new CustomError(
        'Permission denied. Only admin can update the cat.',
        403
      );
    }

    req.body.location = {
      ...req.body.location,
      type: 'Point',
    };
    const cat = await CatModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    res.json({message: 'Cat updated', _id: cat._id});
  } catch (error) {
    next(error);
  }
};
const catDelete = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError(
        'Permission denied. You can only delete your own cat.',
        403
      );
    }
    const cat = await CatModel.findByIdAndDelete(req.params.id);

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(error);
  }
};

const catDeleteAdmin = async (
  req: Request<{id: string}>,
  res: Response<MessageResponse>,
  next: NextFunction
) => {
  try {
    // Check if the user is an admin
    if (!res.locals.user || res.locals.user.role !== 'admin') {
      throw new CustomError(
        'Permission denied. Only admin can delete the cat.',
        403
      );
    }

    const cat = await CatModel.findByIdAndDelete(req.params.id);

    if (!cat) {
      throw new CustomError('Cat not found', 404);
    }

    res.json({message: 'Cat deleted'});
  } catch (error) {
    next(error);
  }
};
//catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const {minLat, maxLat, minLon, maxLon} = req.query;
    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $box: [
            [Number(minLon), Number(minLat)],
            [Number(maxLon), Number(maxLat)],
          ],
        },
      },
    });
    res.json(cats);
  } catch (error) {
    next(error);
  }
};
export {
  catDelete,
  catDeleteAdmin,
  catGet,
  catGetByBoundingBox,
  catGetByUser,
  catListGet,
  catPost,
  catPut,
  catPutAdmin,
};
