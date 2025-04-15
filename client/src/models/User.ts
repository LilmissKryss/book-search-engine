import type { Book } from "./Book";

export interface User {
  username: string;
  email: string;
  password: string;
  savedBooks?: Book[];
}
