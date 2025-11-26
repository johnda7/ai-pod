/*
 * ⚠️⚠️⚠️ КРИТИЧЕСКИ ВАЖНЫЙ ФАЙЛ - НЕ УДАЛЯТЬ! ⚠️⚠️⚠️
 * 
 * ЭТОТ ФАЙЛ ОБЯЗАТЕЛЬНО ДОЛЖЕН СУЩЕСТВОВАТЬ!
 * Без этого файла приложение не соберется и не задеплоится на GitHub Pages.
 * 
 * КРИТИЧЕСКИ ВАЖНАЯ СТРОКА (НЕ УДАЛЯТЬ!):
 *   base: process.env.NODE_ENV === 'production' ? '/ai-pod/' : '/'
 * 
 * Без этой строки сайт не будет работать на GitHub Pages!
 * 
 * AI STUDIO: НЕ УДАЛЯЙ ЭТОТ ФАЙЛ! Даже если он кажется "устаревшим"!
 */

import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: process.env.NODE_ENV === 'production' ? '/ai-pod/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
