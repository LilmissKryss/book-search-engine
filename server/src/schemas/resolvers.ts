import User from "../models/User.js";
import { signToken } from "../utils/auth.js";
import { AuthenticationError } from "apollo-server-express";

// Define types for context and arguments
interface MyContext {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface LoginArgs {
  email: string;
  password: string;
}

interface AddUserArgs {
  username: string;
  email: string;
  password: string;
}

interface BookInput {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  link: string;
}

const resolvers = {
  Query: {
    me: async (_: any, __: any, context: MyContext) => {
      if (!context.user) {
        throw new AuthenticationError("Not authenticated");
      }
      return User.findById(context.user._id);
    },
  },

  Mutation: {
    login: async (_: any, { email, password }: LoginArgs) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("Invalid credentials");
      }

      const correctPassword = await user.isCorrectPassword(password);

      if (!correctPassword) {
        throw new AuthenticationError("Invalid credentials");
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (_: any, { username, email, password }: AddUserArgs) => {
      try {
        console.log("Creating user with:", { username, email, password });
        const user = await User.create({ username, email, password });
        console.log("User created:", user);
        const token = signToken(user);
        console.log(
          "Token generated:",
          token ? "Token created successfully" : "Token creation failed"
        );
        return { token, user };
      } catch (error) {
        console.error("Error in addUser resolver:", error);
        throw error;
      }
    },

    saveBook: async (
      _: any,
      { bookData }: { bookData: BookInput },
      context: MyContext
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $push: { savedBooks: bookData } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    removeBook: async (
      _: any,
      { bookId }: { bookId: string },
      context: MyContext
    ) => {
      if (!context.user) {
        throw new AuthenticationError("You need to be logged in!");
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      return updatedUser;
    },
  },
};

export { resolvers };
