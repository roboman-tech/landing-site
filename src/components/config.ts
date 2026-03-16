// src/config.ts
/**
 * Application configuration
 * Environment variables are loaded from .env file
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const API_CHAT_ENDPOINT = '/chat';

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiChatUrl: `${API_BASE_URL}${API_CHAT_ENDPOINT}`,
};

export default config;