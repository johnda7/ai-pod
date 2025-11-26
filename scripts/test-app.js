/**
 * Тест приложения
 */

async function testApp() {
  console.log('🔍 Тестирование приложения...\n');

  try {
    // 1. Проверка HTML
    const htmlResponse = await fetch('http://localhost:3000');
    const html = await htmlResponse.text();
    
    console.log('✅ HTML загружен:', html.length, 'символов');
    console.log('   Заголовок:', html.includes('AI Teenager') ? '✅ найден' : '❌ не найден');
    console.log('   React:', html.includes('react') ? '✅ есть' : '❌ нет');
    console.log('   Supabase:', html.includes('supabase') ? '✅ есть' : '❌ нет');
    console.log('   Root элемент:', html.includes('id="root"') ? '✅ есть' : '❌ нет');

    // 2. Проверка Vite клиента
    try {
      const viteResponse = await fetch('http://localhost:3000/@vite/client');
      console.log('✅ Vite client:', viteResponse.ok ? 'доступен' : 'недоступен');
    } catch (e) {
      console.log('⚠️  Vite client:', e.message);
    }

    // 3. Проверка главного модуля
    try {
      const appResponse = await fetch('http://localhost:3000/index.tsx');
      console.log('✅ index.tsx:', appResponse.ok ? 'компилируется' : 'ошибка компиляции');
    } catch (e) {
      console.log('⚠️  index.tsx:', e.message);
    }

    // 4. Проверка App.tsx
    try {
      const appTsxResponse = await fetch('http://localhost:3000/App.tsx');
      console.log('✅ App.tsx:', appTsxResponse.ok ? 'компилируется' : 'ошибка компиляции');
    } catch (e) {
      console.log('⚠️  App.tsx:', e.message);
    }

    console.log('\n📊 Итог:');
    console.log('   Приложение доступно на: http://localhost:3000');
    console.log('   Откройте в браузере и проверьте консоль (F12)');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

testApp();
