# 🎨 KLING AI - РУКОВОДСТВО ДЛЯ АГЕНТОВ

## 📌 ОБЗОР

**Kling AI** — это AI-платформа от Kuaishou (Китай) для генерации:
- 🖼️ **Изображений** (Text-to-Image, Image Reference, Restyle)
- 🎬 **Видео** (Image-to-Video, Text-to-Video)
- 👤 **Аватаров** (AI Human)
- ✨ **Эффектов** (Special Effects)

**Почему Kling AI для AI Pod:**
- ✅ **166 бесплатных кредитов** при регистрации
- ✅ **Высокое качество** — на уровне Midjourney
- ✅ **Бесплатная анимация** — Image-to-Video
- ✅ **Консистентность персонажа** — Image Reference
- ✅ **Современный 3D стиль** — идеально для подростков

---

## 🔐 АВТОРИЗАЦИЯ

### URL для входа:
```
https://app.klingai.com/global/text-to-image/new
```

### Способы входа:
1. **Google** (может блокировать автоматизированный браузер)
2. **Apple**
3. **Email** ✅ (рекомендуется для агентов)

### Важно:
- Google OAuth может определить автоматизированный браузер как "небезопасный"
- Рекомендуется использовать **Email авторизацию**
- После входа сессия сохраняется

---

## 🖼️ ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ

### URL:
```
https://app.klingai.com/global/text-to-image/new
```

### Настройки по умолчанию:
| Параметр | Значение | Описание |
|----------|----------|----------|
| Model | IMAGE 2.1 | Последняя модель |
| Aspect Ratio | 9:16 | Вертикальный (для мобильных) |
| Outputs | 4 | Количество вариантов |
| Quality | High-Res | Высокое разрешение |

### Режимы генерации:
1. **Text to Image** — генерация по текстовому описанию
2. **Image Reference** — генерация на основе референса (для консистентности)
3. **Restyle** — изменение стиля существующего изображения

---

## 🎬 ГЕНЕРАЦИЯ ВИДЕО

### URL:
```
https://app.klingai.com/global/image-to-video/frame-mode/new
```

### Типы:
1. **Image-to-Video** — анимация статичного изображения
2. **Text-to-Video** — генерация видео по тексту
3. **Frame Mode** — контроль начального и конечного кадра

### Настройки:
- Duration: 5-10 секунд
- Quality: Standard / Professional
- Motion: Low / Medium / High

---

## 👤 AI ЧЕЛОВЕК (АВАТАР)

### URL:
```
https://app.klingai.com/global/ai-human/image/new
```

### Возможности:
- Создание реалистичных аватаров
- Говорящие головы
- Lip-sync с аудио

---

## 📝 ПРОМПТЫ ДЛЯ ПЕРСОНАЖА КАТИ (AI Pod)

### 1. Основной портрет:
```
Cute teenage girl named Katya, age 13-14, Slavic appearance, light brown wavy shoulder-length hair, bright blue expressive eyes, friendly warm smile with dimples, modern casual outfit - purple hoodie with small star logo, blue jeans, white sneakers, standing confidently with crossed arms, soft pastel gradient background (purple to blue), high quality 3D render, modern Pixar Disney animation style, vibrant colors, perfect for mobile app character mascot, full body portrait, soft studio lighting, ultra detailed, cinematic quality, cheerful motivational vibe
```

### 2. Радостная Катя (достижение):
```
Same character Katya, teenage girl 13-14, Slavic, light brown wavy hair, blue eyes, purple hoodie, jumping with joy, arms raised in celebration, huge genuine smile, confetti around her, achievement celebration pose, 3D Pixar style, vibrant colors, motivational app character, soft gradient background
```

### 3. Думающая Катя (идея):
```
Same character Katya, teenage girl 13-14, Slavic, light brown wavy hair, blue eyes, purple hoodie, thoughtful pose, hand on chin, looking up with curious expression, lightbulb idea moment, 3D Pixar style, soft lighting, educational app character, pastel background
```

### 4. Катя с телефоном:
```
Same character Katya, teenage girl 13-14, Slavic, light brown wavy hair, blue eyes, purple hoodie, holding smartphone, looking at screen with excited expression, showing app to viewer, 3D Pixar style, modern tech vibe, soft studio lighting
```

### 5. Катя медитирует:
```
Same character Katya, teenage girl 13-14, Slavic, light brown wavy hair, blue eyes, comfortable clothes, sitting in lotus position, peaceful meditation pose, eyes closed, serene smile, soft purple aura around her, calming atmosphere, 3D Pixar style, zen background
```

### 6. Катя учится:
```
Same character Katya, teenage girl 13-14, Slavic, light brown wavy hair, blue eyes, purple hoodie, sitting at desk with notebook, writing with determination, focused expression, cozy room background, 3D Pixar style, warm lighting, study motivation vibe
```

---

## 🔄 КОНСИСТЕНТНОСТЬ ПЕРСОНАЖА

### Метод 1: Image Reference
1. Сгенерируйте базовое изображение персонажа
2. Сохраните лучший вариант
3. Используйте режим **"Image Reference"**
4. Загрузите базовое изображение
5. В промпте опишите новую позу/эмоцию

### Метод 2: Детальное описание
- Всегда начинайте промпт с "Same character Katya"
- Повторяйте ключевые характеристики:
  - "teenage girl 13-14"
  - "Slavic"
  - "light brown wavy hair"
  - "blue eyes"
  - "purple hoodie"

---

## 🎥 АНИМАЦИЯ ПЕРСОНАЖА

### Процесс:
1. Создайте статичное изображение в Text-to-Image
2. Скачайте лучший вариант
3. Перейдите в Image-to-Video
4. Загрузите изображение
5. Добавьте motion prompt:
   ```
   Gentle breathing motion, slight head movement, blinking eyes, subtle smile animation, natural idle animation
   ```
6. Выберите длительность (5-10 сек)
7. Генерируйте

### Рекомендуемые motion prompts:
- **Idle**: "Gentle breathing, subtle movement, natural idle pose"
- **Wave**: "Waving hand animation, friendly gesture"
- **Nod**: "Nodding head in agreement, positive gesture"
- **Think**: "Tilting head, thinking gesture, looking up"

---

## 💰 КРЕДИТЫ И ЛИМИТЫ

### Бесплатный план:
- **166 кредитов** при регистрации
- Ежедневное пополнение (проверить точное количество)

### Расход кредитов:
| Действие | Кредиты |
|----------|---------|
| Image (Standard) | ~2-4 |
| Image (High-Res) | ~4-8 |
| Video (5 sec) | ~10-20 |
| Video (10 sec) | ~20-40 |

---

## 🤖 АВТОМАТИЗАЦИЯ ДЛЯ АГЕНТОВ

### Шаги для генерации:
1. Перейти на `https://app.klingai.com/global/text-to-image/new`
2. Нажать на поле промпта (textbox)
3. Ввести промпт
4. Проверить настройки (9:16, 4 outputs, High-Res)
5. Нажать кнопку "Generate"
6. Подождать 30-60 секунд
7. Скачать результаты

### Селекторы элементов (примерные):
```javascript
// Prompt textbox
textbox[ref*="e93"]

// Generate button
button "Generate"

// Aspect ratio selector
combobox "9:16"

// Output count selector  
combobox "4 Outputs"

// Quality selector
combobox "High-Res"
```

---

## 📁 СОХРАНЕНИЕ РЕЗУЛЬТАТОВ

### Рекомендуемая структура папок:
```
agents/
  images/
    katya/
      portrait_main.png
      portrait_happy.png
      portrait_thinking.png
      portrait_phone.png
      portrait_meditate.png
      portrait_study.png
    backgrounds/
      lesson_bg_1.png
      lesson_bg_2.png
    icons/
      achievement_1.png
      reward_1.png
  videos/
    katya/
      idle_animation.mp4
      wave_animation.mp4
```

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ

- **Главная**: https://klingai.com
- **Image Generator**: https://app.klingai.com/global/text-to-image/new
- **Video Generator**: https://app.klingai.com/global/image-to-video/frame-mode/new
- **AI Human**: https://app.klingai.com/global/ai-human/image/new
- **Best Practices**: https://docs.qingque.cn/d/home/eZQDT9y_PeLL-HOb7fWz1POgu

---

## ⚠️ ВАЖНЫЕ ЗАМЕЧАНИЯ

1. **Автоматизированный браузер**: Google OAuth может блокировать — используйте Email
2. **Сессия**: После входа сессия сохраняется в cookies
3. **Лимиты**: Следите за кредитами, они ограничены
4. **Качество**: Всегда выбирайте High-Res для финальных изображений
5. **Консистентность**: Используйте Image Reference для одинакового персонажа

---

## 📊 СРАВНЕНИЕ С АЛЬТЕРНАТИВАМИ

| Платформа | Качество | Цена | Анимация | Консистентность |
|-----------|----------|------|----------|-----------------|
| **Kling AI** | ⭐⭐⭐⭐ | Бесплатно | ✅ | ✅ |
| Midjourney | ⭐⭐⭐⭐⭐ | $10/мес | ❌ | ✅ (--cref) |
| Leonardo AI | ⭐⭐⭐⭐ | Бесплатно | ❌ | ✅ |
| DALL-E 3 | ⭐⭐⭐⭐ | $20/мес | ❌ | ❌ |
| Ideogram | ⭐⭐⭐ | Бесплатно | ❌ | ❌ |

**Вывод**: Kling AI — лучший бесплатный вариант для AI Pod благодаря комбинации качества, бесплатной анимации и консистентности персонажа.

---

**Версия**: 1.0  
**Дата создания**: 2024-11-30  
**Автор**: AI Agent (CEO-партнёр)



