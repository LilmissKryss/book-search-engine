import { jest } from '@jest/globals';

class MockApolloLink {
  constructor() {}
  concat() {
    return this;
  }
}

export const createHttpLink = jest.fn(() => new MockApolloLink());
export const setContext = jest.fn(() => new MockApolloLink());

export class ApolloClient {
  constructor() {
    return {
      query: jest.fn(),
      mutate: jest.fn(),
    };
  }
}

export class InMemoryCache {
  constructor() {}
}

export const gql = jest.fn((query) => query); 