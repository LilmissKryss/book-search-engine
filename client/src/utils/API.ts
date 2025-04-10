import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { gql } from "@apollo/client";
import type { User } from "./types";

// Create Apollo Client
export const createApolloClient = () => {
  // In test environment, return a mock client
  if (process.env.NODE_ENV === "test") {
    return new ApolloClient({
      cache: new InMemoryCache(),
    });
  }

  const httpLink = createHttpLink({
    uri: "http://localhost:3001/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("id_token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
};

const client = createApolloClient();

// GraphQL Queries and Mutations
const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        savedBooks {
          _id
          title
          authors
          description
        }
      }
    }
  }
`;

const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
        email
        savedBooks {
          _id
          title
          authors
          description
        }
      }
    }
  }
`;

const GET_ME = gql`
  query getMe {
    me {
      _id
      username
      email
      savedBooks {
        _id
        title
        authors
        description
      }
    }
  }
`;

const SAVE_BOOK = gql`
  mutation saveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      username
      email
      savedBooks {
        _id
        title
        authors
        description
      }
    }
  }
`;

const REMOVE_BOOK = gql`
  mutation removeBook($bookId: ID!) {
    removeBook(bookId: $bookId) {
      _id
      username
      email
      savedBooks {
        _id
        title
        authors
        description
      }
    }
  }
`;

// API Functions
export const getMe = async (): Promise<User> => {
  try {
    const { data } = await client.query({
      query: GET_ME,
    });
    return data.me;
  } catch (err) {
    console.error("Error fetching user data:", err);
    throw err;
  }
};

export const createUser = async (userData: {
  username: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  try {
    const { data } = await client.mutate({
      mutation: ADD_USER,
      variables: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      },
    });
    return data.addUser;
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

export const loginUser = async (userData: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  try {
    const { data } = await client.mutate({
      mutation: LOGIN_USER,
      variables: {
        email: userData.email,
        password: userData.password,
      },
    });
    return data.login;
  } catch (err) {
    console.error("Error logging in:", err);
    throw err;
  }
};

export const saveBook = async (bookData: {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
}): Promise<User> => {
  try {
    const { data } = await client.mutate({
      mutation: SAVE_BOOK,
      variables: {
        bookData,
      },
    });
    return data.saveBook;
  } catch (err) {
    console.error("Error saving book:", err);
    throw err;
  }
};

export const deleteBook = async (bookId: string): Promise<User> => {
  try {
    const { data } = await client.mutate({
      mutation: REMOVE_BOOK,
      variables: {
        bookId,
      },
    });
    return data.removeBook;
  } catch (err) {
    console.error("Error deleting book:", err);
    throw err;
  }
};

// Google Books API search
export const searchGoogleBooks = (query: string) => {
  return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
};

export { client };
