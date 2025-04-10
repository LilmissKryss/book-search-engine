import { jest } from '@jest/globals';
import type { User, AuthResponse } from '../utils/types';

// Mock Apollo Client
const mockApolloClient = {
  query: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })) as jest.Mock<any>,
  mutate: jest.fn().mockImplementation(() => Promise.resolve({ data: {} })) as jest.Mock<any>,
  cache: {
    reset: jest.fn(),
  },
};

// Mock fetch with proper typing
const mockFetch = jest.fn<() => Promise<Response>>();
global.fetch = mockFetch as unknown as typeof fetch;

// Mock the Apollo Client module
jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn(() => mockApolloClient),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn(),
  gql: jest.fn((template) => template),
}));

// Mock the Apollo Client link context module
jest.mock('@apollo/client/link/context', () => ({
  setContext: jest.fn(),
}));

// Mock process.env
process.env.NODE_ENV = 'test';

// Mock the API module
jest.mock('../utils/API', () => {
  const { getMe, createUser, loginUser, saveBook, deleteBook, searchGoogleBooks } = jest.requireActual('../utils/API');
  return {
    getMe,
    createUser,
    loginUser,
    saveBook,
    deleteBook,
    searchGoogleBooks,
    createApolloClient: jest.fn(() => mockApolloClient),
  };
});

// Import the mocked functions
import { getMe, createUser, loginUser, saveBook, deleteBook, searchGoogleBooks } from '../utils/API';

describe('GraphQL API Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockApolloClient.query.mockReset();
    mockApolloClient.mutate.mockReset();
    mockFetch.mockReset();
    
    // Reset default implementations
    mockApolloClient.query.mockImplementation(() => Promise.resolve({ data: {} }));
    mockApolloClient.mutate.mockImplementation(() => Promise.resolve({ data: {} }));
  });

  describe('getMe', () => {
    it('should fetch user data successfully', async () => {
      const mockData: User = {
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
        savedBooks: []
      };

      mockApolloClient.query.mockResolvedValueOnce({ data: { me: mockData } });

      const result = await getMe();
      expect(result).toEqual(mockData);
      expect(mockApolloClient.query).toHaveBeenCalledTimes(1);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123'
      };

      const mockData: AuthResponse = {
        token: 'test-token',
        user: {
          _id: '1',
          username: 'newuser',
          email: 'new@example.com',
          savedBooks: []
        }
      };

      mockApolloClient.mutate.mockResolvedValueOnce({ data: { addUser: mockData } });

      const result = await createUser(userData);
      expect(result).toEqual(mockData);
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    });
  });

  describe('loginUser', () => {
    it('should login successfully with correct credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockData: AuthResponse = {
        token: 'test-token',
        user: {
          _id: '1',
          username: 'testuser',
          email: 'test@example.com',
          savedBooks: []
        }
      };

      mockApolloClient.mutate.mockResolvedValueOnce({ data: { login: mockData } });

      const result = await loginUser(userData);
      expect(result).toEqual(mockData);
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    });

    it('should throw error with incorrect credentials', async () => {
      const userData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      mockApolloClient.mutate.mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(loginUser(userData)).rejects.toThrow('Invalid credentials');
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveBook', () => {
    it('should save a book successfully', async () => {
      const bookData = {
        bookId: '1',
        title: 'Test Book',
        authors: ['Test Author'],
        description: 'Test Description'
      };

      const mockData: User = {
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
        savedBooks: [{ ...bookData, _id: '1' }]
      };

      mockApolloClient.mutate.mockResolvedValueOnce({ data: { saveBook: mockData } });

      const result = await saveBook(bookData);
      expect(result.savedBooks).toContainEqual(expect.objectContaining(bookData));
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book successfully', async () => {
      const mockData: User = {
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
        savedBooks: []
      };

      mockApolloClient.mutate.mockResolvedValueOnce({ data: { removeBook: mockData } });

      const result = await deleteBook('1');
      expect(result.savedBooks).toHaveLength(0);
      expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Google Books API', () => {
  it('should search books successfully', async () => {
    const mockResponse = {
      items: [
        {
          id: '1',
          volumeInfo: {
            title: 'Test Book',
            authors: ['Test Author'],
            description: 'Test Description'
          }
        }
      ]
    };

    const mockFetchResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      redirected: false,
      type: 'basic' as ResponseType,
      url: 'https://www.googleapis.com/books/v1/volumes?q=test',
      json: () => Promise.resolve(mockResponse),
      text: () => Promise.resolve(JSON.stringify(mockResponse)),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      bodyUsed: false,
      body: null,
      clone: function() { return this; }
    } as Response;

    mockFetch.mockResolvedValueOnce(mockFetchResponse);

    const response = await searchGoogleBooks('test');
    const data = await response.json();
    expect(data.items).toHaveLength(1);
    expect(data.items[0].volumeInfo.title).toBe('Test Book');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
}); 