import {NextFunction, Request, Response} from 'express';
import {Cat} from '../../types/DBTypes';
import CatModel from '../models/catModel';
import CustomError from '../../classes/CustomError';
import {MessageResponse} from '../../types/MessageTypes';

const catListGet = async (
  _req: Request,
  res: Response<Cat[]>,
  next: NextFunction
) => {
  try {
    const cats = await CatModel.find().select('-__v').populate({
      path: 'owner',
      select: '-__v -password -role',
    });
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
    const cats = await CatModel.findById(req.params.id)
      .select('-__v')
      .populate({
        path: 'owner',
        select: '-__v -password -role',
      });
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

const catPost = async (
  req: Request<{token: string; pic: string}, {}, Omit<Cat, '_id'>>,
  res: Response<MessageResponse & {data: Cat}>,
  next: NextFunction
) => {
  req.body.filename = req.file?.path || '';

  try {
    if (!res.locals.user || !('_id' in res.locals.user)) {
      throw new CustomError('Invalid user data', 400);
    }
    //koordinaatit res.locals.coords tallennetaan requestiin
    if (res.locals.coords) {
      req.body.location = {
        type: res.locals.coords.type,
        coordinates: res.locals.coords.coordinates,
      };
    } else {
      req.body.location = {
        type: 'Point',
        coordinates: [24, 61],
      };
    }

    const cat = await CatModel.create({
      ...req.body,
      owner: res.locals.user._id,
    });
    const response: MessageResponse & {data: Cat} = {
      message: 'OK',
      data: cat,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const catPut = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response<MessageResponse>,
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
    const response: MessageResponse & {data: Cat} = {
      message: 'OK',
      data: cat,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const catPutAdmin = async (
  req: Request<{id: string}, {}, Omit<Cat, '_id'>>,
  res: Response<MessageResponse>,
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

    const response: MessageResponse & {data: Cat} = {
      message: 'OK',
      data: cat,
    };
    res.status(200).json(response);
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

    const response: MessageResponse & {data: Cat} = {
      message: 'Cat deleted',
      data: cat as unknown as Cat,
    };
    res.status(200).json(response);
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
    const response: MessageResponse & {data: Cat} = {
      message: 'Cat deleted',
      data: cat as unknown as Cat,
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
//catGetByBoundingBox - get all cats by bounding box coordinates (getJSON)
const catGetByBoundingBox = async (
  req: Request<{}, {}, {}, {topRight: string; bottomLeft: string}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const topRight = req.query.topRight.split(',');
    const bottomLeft = req.query.bottomLeft.split(',');
    const cats = await CatModel.find({
      location: {
        $geoWithin: {
          $box: [
            [Number(bottomLeft[1]), Number(bottomLeft[0])],
            [Number(topRight[1]), Number(topRight[0])],
          ],
        },
      },
    })
      .select('-__v')
      .populate({
        path: 'owner',
        select: '-__v -password -role',
      });
    console.log('Bbox cats', cats);
    res.json(cats);
  } catch (error) {
    next(new CustomError('Error while getting cats', 500));
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
