import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';
import { ApiError } from '../errors/ApiError';

const BASE_URL = 'http://127.0.0.1:8001';

export const api = {
  async fetchData(url: string) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async getUser(userId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/users/${userId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async createUser(userData: { id: string; name: string }) {
    try {
      const response = await axios.post(`${BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async updateUser(userId: string, userData: { name: string }) {
    try {
      const response = await axios.put(`${BASE_URL}/users/${userId}`, {
        id: userId,
        name: userData.name
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  async deleteUser(userId: string) {
    try {
      const response = await axios.delete(`${BASE_URL}/users/${userId}`);
      if (response.status === 200) {
        return response.data;
      }
      throw new ApiError(response.status, 'Failed to delete user');
    } catch (error) {
      handleApiError(error);
    }
  },

  async testConnection() {
    try {
      const response = await axios.get(`${BASE_URL}/`);
      console.log('API Connection Test:', response.data.message);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Example usage:
async function main() {
  try {
    const user = await api.getUser('123');
    console.log('User found:', user);
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 404:
          console.error('User not found');
          break;
        case 400:
          console.error('Invalid user ID');
          break;
        default:
          console.error(`Error: ${error.message}`);
      }
    }
  }
}

export async function getUserExample() {
  try {
    const user = await api.getUser('123');
    console.log('Success:', user);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      console.error('User not found');
      // Handle the 404 case appropriately
    }
    throw error;
  }
}

// Updated test function
export async function testApi() {
  try {
    // Test API connection first
    await api.testConnection();
    
    // Create a test user
    const newUser = await api.createUser({ id: "123", name: "John Doe" });
    console.log('✅ User created:', newUser);

    // Fetch the created user
    const user = await api.getUser("123");
    console.log('✅ User fetched:', user);

    // Try to fetch non-existent user
    try {
      await api.getUser("456");
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('✅ 404 handling works:', error.message);
      }
    }

  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Test failed:', error.statusCode, error.message);
    }
  }
}
