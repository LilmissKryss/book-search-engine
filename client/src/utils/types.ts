export interface Book {
  _id?: string;
  bookId?: string;
  title: string;
  authors: string[];
  description: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  savedBooks: Book[];
}

export interface AuthResponse {
  token: string;
  user: User;
} 