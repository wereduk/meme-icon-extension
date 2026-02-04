/**
 * Jest setup file
 * Global test configuration
 */

// Mock chrome API for tests
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
  },
  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
};

// Setup test timeout
jest.setTimeout(10000);
