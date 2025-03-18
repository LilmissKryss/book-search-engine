import type { Request, Response } from "express";
// import user model
import User from "../models/User.js";
// import sign token function from auth
import { signToken } from "../services/auth.js";

interface MongoError {
  code?: number;
  message: string;
}

// get a single user by either their id or their username
export const getSingleUser = async (req: Request, res: Response) => {
  const foundUser = await User.findOne({
    $or: [
      { _id: req.user ? req.user._id : req.params.id },
      { username: req.params.username },
    ],
  });

  if (!foundUser) {
    return res
      .status(400)
      .json({ message: "Cannot find a user with this id!" });
  }

  return res.json(foundUser);
};

// create a user, sign a token, and send it back
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    if (!user) {
      return res.status(400).json({ message: "Could not create user!" });
    }

    const token = signToken(user.username, user.email, user._id);
    return res.json({ token, user });
  } catch (err) {
    console.error(err);
    if ((err as MongoError).code === 11000) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

// login a user, sign a token, and send it back
export const login = async (req: Request, res: Response) => {
  const user = await User.findOne({
    $or: [{ username: req.body.username }, { email: req.body.email }],
  });
  if (!user) {
    return res.status(400).json({ message: "Can't find this user" });
  }

  const correctPw = await user.isCorrectPassword(req.body.password);

  if (!correctPw) {
    return res.status(400).json({ message: "Wrong password!" });
  }
  const token = signToken(user.username, user.password, user._id);
  return res.json({ token, user });
};

// save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
export const saveBook = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { savedBooks: req.body } },
      { new: true, runValidators: true }
    );
    return res.json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
};

// remove a book from `savedBooks`
export const deleteBook = async (req: Request, res: Response) => {
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $pull: { savedBooks: { bookId: req.params.bookId } } },
    { new: true }
  );
  if (!updatedUser) {
    return res
      .status(404)
      .json({ message: "Couldn't find user with this id!" });
  }
  return res.json(updatedUser);
};
