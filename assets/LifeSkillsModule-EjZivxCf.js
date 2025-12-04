import{r as c,j as e,A as w,m as l,C as I,X as O,U as P,B as T,v as A,a as R,d as F,L as X,f as B,Z as k,w as D}from"./index-C_OYZS1b.js";const b=[{id:"public_speaking",name:"Публичные выступления",description:"Говори уверенно перед любой аудиторией",emoji:"🎤",image:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop",category:"leadership",color:"#6366f1",lessons:[{id:"ps1",title:"Преодоление страха сцены",duration:"5 мин",xp:30,type:"video"},{id:"ps2",title:"Структура выступления",duration:"7 мин",xp:40,type:"exercise"},{id:"ps3",title:"Язык тела",duration:"5 мин",xp:35,type:"practice"}]},{id:"money_basics",name:"Финансовая грамотность",description:"Управляй деньгами как профи",emoji:"💰",image:"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",category:"financial",color:"#22c55e",lessons:[{id:"mb1",title:"Бюджет подростка",duration:"6 мин",xp:35,type:"video"},{id:"mb2",title:"Сбережения vs Траты",duration:"5 мин",xp:30,type:"quiz"},{id:"mb3",title:"Первые инвестиции",duration:"8 мин",xp:50,type:"exercise"}]},{id:"emotional_iq",name:"Эмоциональный интеллект",description:"Понимай себя и других",emoji:"💜",image:"https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",category:"emotional",color:"#ec4899",lessons:[{id:"eq1",title:"Распознавание эмоций",duration:"5 мин",xp:30,type:"video"},{id:"eq2",title:"Управление гневом",duration:"6 мин",xp:40,type:"practice"},{id:"eq3",title:"Эмпатия",duration:"5 мин",xp:35,type:"exercise"}]},{id:"goal_setting",name:"Постановка целей",description:"От мечты к плану действий",emoji:"🎯",image:"https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&h=300&fit=crop",category:"productivity",color:"#f59e0b",lessons:[{id:"gs1",title:"SMART цели",duration:"5 мин",xp:30,type:"video"},{id:"gs2",title:"Разбиение на шаги",duration:"6 мин",xp:35,type:"exercise"},{id:"gs3",title:"Отслеживание прогресса",duration:"5 мин",xp:30,type:"practice"}]},{id:"networking",name:"Нетворкинг",description:"Строй полезные связи",emoji:"🤝",image:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",category:"social",color:"#3b82f6",lessons:[{id:"nw1",title:"Первое впечатление",duration:"5 мин",xp:30,type:"video"},{id:"nw2",title:"Искусство small talk",duration:"6 мин",xp:35,type:"practice"},{id:"nw3",title:"Поддержание контактов",duration:"5 мин",xp:30,type:"exercise"}]},{id:"problem_solving",name:"Решение проблем",description:"Мысли как инженер",emoji:"🧩",image:"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",category:"productivity",color:"#8b5cf6",lessons:[{id:"pr1",title:"Определение проблемы",duration:"5 мин",xp:30,type:"video"},{id:"pr2",title:"Генерация решений",duration:"7 мин",xp:40,type:"exercise"},{id:"pr3",title:"Принятие решений",duration:"5 мин",xp:35,type:"quiz"}]}],J=[{id:"all",name:"Все",emoji:"📚"},{id:"leadership",name:"Лидерство",emoji:"👑"},{id:"financial",name:"Финансы",emoji:"💰"},{id:"emotional",name:"Эмоции",emoji:"💜"},{id:"social",name:"Общение",emoji:"🤝"},{id:"productivity",name:"Продуктивность",emoji:"⚡"}],U={video:R,exercise:A,quiz:T,practice:P},G=({isOpen:S,onClose:C,onComplete:L})=>{var v;const[x,$]=c.useState("all"),[t,f]=c.useState(null),[r,j]=c.useState([]);c.useEffect(()=>{const s=localStorage.getItem("life_skills_progress");s&&j(JSON.parse(s))},[]),c.useEffect(()=>{localStorage.setItem("life_skills_progress",JSON.stringify(r))},[r]);const z=x==="all"?b:b.filter(s=>s.category===x),u=s=>{const a=s.lessons.filter(n=>r.includes(n.id)).length;return Math.round(a/s.lessons.length*100)},[i,g]=c.useState(null),[y,p]=c.useState(0),[m,h]=c.useState(0),d={ps1:{steps:[`🎭 **Страх сцены — это нормально!**

Даже опытные ораторы нервничают. Разница в том, как они с этим справляются.`,`🧘 **Техника 4-7-8**

• Вдох на 4 счёта
• Задержка на 7 счётов
• Выдох на 8 счётов

Повтори 3 раза перед выступлением.`,`💪 **Поза силы**

За 2 минуты до выступления встань в "позу супергероя" — руки на поясе, плечи расправлены. Это реально снижает кортизол!`],quiz:{question:"Что снижает волнение перед выступлением?",options:["Кофе","Поза силы","Избегание"],correct:1}},ps2:{steps:[`📝 **Структура — твой друг**

Любое хорошее выступление имеет:
• Вступление (зацепи внимание)
• Основную часть (3 ключевых пункта)
• Заключение (призыв к действию)`,`🎣 **Крючок в начале**

Начни с:
• Вопроса к аудитории
• Шокирующего факта
• Короткой истории`,`🎯 **Правило трёх**

Люди запоминают максимум 3 идеи. Выбери 3 главных пункта и раскрой их.`]},ps3:{steps:[`👁️ **Зрительный контакт**

Смотри на людей 3-5 секунд, потом переводи взгляд. Не сканируй комнату — это выдаёт нервозность.`,`🤚 **Жесты**

• Открытые ладони = честность
• Руки выше пояса = энергия
• Избегай скрещивания рук`,`🚶 **Движение**

Не стой статуей! Двигайся по сцене. Подходи к аудитории в важные моменты.`]},mb1:{steps:[`💰 **Правило 50/30/20**

• 50% — необходимое (транспорт, еда)
• 30% — хотелки (развлечения)
• 20% — сбережения (копилка)`,`📱 **Отслеживай траты**

Первую неделю просто записывай всё, на что тратишь. Ты удивишься результату!`,`🎯 **Цель сбережений**

Накопить на что-то конкретное проще, чем просто "откладывать". Поставь цель!`]},mb2:{steps:[`⚖️ **Нужды vs Хотелки**

Нужды — то, без чего нельзя (еда, транспорт). Хотелки — то, что приятно, но не обязательно.`,`⏰ **Правило 24 часов**

Перед покупкой хотелки подожди 24 часа. Если завтра всё ещё хочется — покупай.`,`📊 **Цена за час**

Подели цену вещи на свой "доход в час". Стоит ли кроссовок 20 часов твоей работы?`]},mb3:{steps:[`📈 **Сложный процент — 8-е чудо света**

Если откладывать 1000₽/мес с 16 лет под 10% годовых, к 30 годам будет ~500,000₽!`,`🎓 **Инвестируй в себя**

Лучшая инвестиция в твоём возрасте — образование и навыки. Они дают доход всю жизнь.`,`⚠️ **Никаких "быстрых денег"**

Если обещают 100% в месяц — это мошенники. Реальная доходность: 8-15% в год.`]},eq1:{steps:[`🎭 **6 базовых эмоций**

• 😊 Радость
• 😢 Грусть
• 😠 Гнев
• 😨 Страх
• 😲 Удивление
• 🤢 Отвращение`,`🔍 **Где живут эмоции?**

Заметь ощущения в теле:
• Тревога — живот
• Гнев — челюсть, кулаки
• Грусть — грудь`,`📝 **Называй эмоции**

Вместо "мне плохо" скажи точнее: "я разочарован" или "я тревожусь". Это снижает интенсивность!`]},eq2:{steps:[`🌡️ **Гнев — это сигнал**

Он говорит: "Нарушены твои границы" или "Это несправедливо". Услышь сигнал!`,`⏸️ **СТОП-техника**

• С — стой (замри)
• Т — тихо (вдох-выдох)
• О — отступи (физически отойди)
• П — подумай (что происходит?)`,`💪 **Конструктивный выход**

• Физическая активность
• Письмо (не отправляй!)
• Разговор "Я чувствую... когда ты..."`]},eq3:{steps:[`👂 **Эмпатия ≠ согласие**

Понять чувства другого не значит одобрить его действия.`,`🪞 **Отзеркаливание**

"Похоже, тебе сейчас тяжело..."
"Ты расстроен, потому что..."

Покажи, что слышишь.`,`❓ **Открытые вопросы**

Вместо "Тебе плохо?" спроси "Как ты себя чувствуешь?". Дай человеку раскрыться.`]},gs1:{steps:[`🎯 **SMART — умные цели**

• S — конкретная
• M — измеримая
• A — достижимая
• R — релевантная
• T — ограниченная по времени`,`❌ **Плохо:** "Хочу выучить английский"

✅ **Хорошо:** "Выучить 500 слов за 2 месяца, занимаясь 15 мин/день"`,`📊 **Как измерить?**

У каждой цели должен быть показатель прогресса. Иначе не поймёшь, достиг ли ты её.`]},gs2:{steps:[`🧱 **Ешь слона по кусочкам**

Большая цель пугает. Разбей её на шаги, которые можно сделать за 1 день.`,`📅 **Обратное планирование**

1. Конечная цель
2. Что нужно за месяц до?
3. Что нужно за неделю до?
4. Что сделать сегодня?`,`✅ **Правило 2 минут**

Если шаг занимает меньше 2 минут — сделай прямо сейчас!`]},gs3:{steps:[`📈 **Визуализация прогресса**

График или чек-лист на видном месте. Мозг любит видеть рост!`,`🎮 **Геймификация**

Превращай цели в игру:
• Уровни (бронза → серебро → золото)
• Награды за этапы
• Челленджи с друзьями`,`📝 **Еженедельный обзор**

Каждое воскресенье 10 минут:
• Что сделано?
• Что мешало?
• План на неделю`]},nw1:{steps:[`⏱️ **7 секунд**

Столько формируется первое впечатление. Важно:
• Улыбка
• Зрительный контакт
• Уверенная поза`,`🤝 **Рукопожатие**

• Крепкое, но не давящее
• 2-3 качания
• Смотри в глаза`,`🎭 **Зеркало**

Люди симпатизируют похожим. Незаметно копируй позу и темп речи собеседника.`]},nw2:{steps:[`💬 **F.O.R.D. — темы для разговора**

• Family (семья)
• Occupation (занятия)
• Recreation (хобби)
• Dreams (мечты)`,`❓ **Вопросы > Утверждения**

"Чем ты увлекаешься?" лучше чем "Я люблю футбол".

Дай человеку говорить о себе!`,`👂 **Активное слушание**

• Кивай
• "Интересно!"
• Уточняющие вопросы
• Запоминай детали`]},nw3:{steps:[`📱 **Сохраняй контакты**

Сразу после знакомства добавь в телефон с пометкой: "Маша, волейбол, любит рок".`,`💌 **Поддерживай связь**

• Репост интересной статьи
• Поздравление с достижением
• "Вспомнил о тебе, когда..."

Хотя бы раз в 2-3 месяца.`,`🎁 **Давай ценность**

Не только проси, но и помогай. Познакомь полезных людей, поделись ресурсом.`]},pr1:{steps:[`🔍 **5 "Почему?"**

Копай до корня:
1. Почему опаздываю? — Поздно встаю
2. Почему? — Поздно ложусь
3. Почему? — Залипаю в телефон
4. Почему? — Нет границ экранного времени
5. Почему? — Не настроил...`,`📝 **Формулировка проблемы**

❌ "Всё плохо"
✅ "Я трачу 4 часа в день на соцсети и не успеваю делать уроки"`,`🎯 **Один фокус**

Решай одну проблему за раз. Многозадачность не работает!`]},pr2:{steps:[`🧠 **Брейншторм**

Запиши ВСЕ идеи за 10 минут. Даже глупые. Критика запрещена!`,`🔄 **Что если наоборот?**

Инверсия помогает: "Как сделать хуже?" → Делай наоборот.`,`👥 **Чужой взгляд**

"Что бы сделал [герой/ментор]?" — Илон Маск? Твой любимый персонаж?`]},pr3:{steps:[`⚖️ **Плюсы и минусы**

Для каждого варианта:
• Список плюсов
• Список минусов
• Вес каждого (1-10)`,`🎲 **Правило монетки**

Подбрось монетку. Не смотри на результат — следи за своей реакцией. Она покажет, чего ты хочешь!`,`⏰ **Дедлайн решения**

Не откладывай. "Я приму решение до пятницы" — и принимай.`]}},M=s=>{r.includes(s.id)||(g(s),p(0),h(0))},_=()=>{if(!i)return;const s=d[i.id];if(!s)return;const a=s.steps.length+(s.quiz?1:0),n=m+1;n>=a?p(100):(h(n),p(Math.round(n/a*100)))},q=()=>{i&&(j([...r,i.id]),L(i.xp,Math.floor(i.xp/3)),g(null),p(0),h(0))},N=Math.round(r.length/b.reduce((s,a)=>s+a.lessons.length,0)*100);return S?e.jsx(w,{children:e.jsxs(l.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-[100] overflow-hidden",children:[e.jsxs("div",{className:"absolute inset-0",children:[e.jsx("div",{className:"absolute inset-0",style:{background:"linear-gradient(180deg, #1a0a2e 0%, #0f0f2a 50%, #0a0a1a 100%)"}}),e.jsx(l.div,{className:"absolute top-0 left-0 w-full h-1/2",style:{background:"radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.25) 0%, transparent 60%)",filter:"blur(60px)"},animate:{opacity:[.3,.6,.3]},transition:{duration:4,repeat:1/0}}),e.jsx(l.div,{className:"absolute top-20 right-0 w-1/2 h-1/2",style:{background:"radial-gradient(ellipse at 100% 20%, rgba(139,92,246,0.2) 0%, transparent 60%)",filter:"blur(50px)"},animate:{opacity:[.4,.7,.4]},transition:{duration:5,repeat:1/0,delay:1}}),[...Array(20)].map((s,a)=>e.jsx(l.div,{className:"absolute w-1 h-1 bg-white rounded-full",style:{left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,opacity:.3+Math.random()*.4},animate:{opacity:[.2,.8,.2]},transition:{duration:2+Math.random()*3,repeat:1/0,delay:Math.random()*2}},a))]}),e.jsx("div",{className:"sticky top-0 z-30 px-4 pt-4 pb-4",children:e.jsxs(l.div,{initial:{y:-20,opacity:0},animate:{y:0,opacity:1},className:"p-4 rounded-3xl",style:{background:"linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",backdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.15)"},children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"w-14 h-14 rounded-xl overflow-hidden relative",style:{boxShadow:"0 4px 20px rgba(99,102,241,0.3)"},children:[e.jsx("img",{src:"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop",alt:"Life Skills",className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-t from-indigo-600/60 to-transparent"}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsx("span",{className:"text-2xl",children:"🚀"})})]}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-xl font-bold text-white",children:"Life Skills"}),e.jsx("p",{className:"text-white/50 text-xs",children:"Навыки для жизни"})]})]}),e.jsx("button",{onClick:t?()=>f(null):C,className:"w-10 h-10 rounded-xl flex items-center justify-center",style:{background:"rgba(255,255,255,0.1)"},children:t?e.jsx(I,{size:20,className:"text-white rotate-180"}):e.jsx(O,{size:20,className:"text-white"})})]}),!t&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-4",children:[e.jsxs("div",{className:"flex justify-between text-xs mb-1.5",children:[e.jsx("span",{className:"text-white/50",children:"Общий прогресс"}),e.jsxs("span",{className:"text-indigo-400 font-bold",children:[N,"%"]})]}),e.jsx("div",{className:"h-2 bg-white/10 rounded-full overflow-hidden",children:e.jsx(l.div,{initial:{width:0},animate:{width:`${N}%`},className:"h-full rounded-full",style:{background:"linear-gradient(90deg, #6366f1, #8b5cf6)"}})})]}),e.jsx("div",{className:"flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide",children:J.map(s=>e.jsxs("button",{onClick:()=>$(s.id),className:"px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",style:{background:x===s.id?"linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)":"rgba(255,255,255,0.05)",color:x===s.id?"white":"rgba(255,255,255,0.5)",boxShadow:x===s.id?"0 4px 15px rgba(99,102,241,0.4)":"none"},children:[e.jsx("span",{children:s.emoji}),s.name]},s.id))})]})]})}),e.jsx("div",{className:"relative z-10 px-4 pb-40 overflow-y-auto h-[calc(100vh-280px)]",children:t?e.jsxs(l.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},children:[e.jsxs("div",{className:"rounded-3xl overflow-hidden mb-4",style:{boxShadow:`0 8px 32px ${t.color}30`},children:[e.jsxs("div",{className:"h-40 relative",children:[e.jsx("img",{src:t.image,alt:t.name,className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute inset-0",style:{background:`linear-gradient(180deg, transparent 0%, ${t.color}95 100%)`}}),e.jsx("div",{className:"absolute bottom-0 left-0 right-0 p-5",children:e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx("span",{className:"text-5xl",children:t.emoji}),e.jsxs("div",{children:[e.jsx("h2",{className:"text-white font-bold text-xl",children:t.name}),e.jsx("p",{className:"text-white/70 text-sm",children:t.description})]})]})})]}),e.jsxs("div",{className:"p-4",style:{background:"linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"},children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsx("span",{className:"text-white/40 text-xs",children:"Прогресс"}),e.jsxs("span",{className:"font-bold",style:{color:t.color},children:[u(t),"%"]})]}),e.jsx("div",{className:"h-2 bg-black/20 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full rounded-full",style:{width:`${u(t)}%`,background:t.color}})})]})]}),e.jsx("div",{className:"space-y-3",children:t.lessons.map((s,a)=>{const n=r.includes(s.id),o=a>0&&!r.includes(t.lessons[a-1].id),E=U[s.type];return e.jsx(l.button,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:a*.1},onClick:()=>!o&&!n&&M(s),disabled:o,className:`w-full p-4 rounded-2xl text-left transition-all ${o?"opacity-50":"active:scale-[0.98]"}`,style:{background:n?"linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)":"linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",border:`1px solid ${n?"rgba(34,197,94,0.3)":"rgba(255,255,255,0.1)"}`},children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 rounded-xl flex items-center justify-center",style:{background:n?"#22c55e":o?"rgba(255,255,255,0.05)":`${t.color}20`},children:n?e.jsx(F,{size:20,className:"text-white"}):o?e.jsx(X,{size:18,className:"text-white/30"}):e.jsx(E,{size:20,style:{color:t.color}})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h4",{className:`font-medium ${n?"text-green-400":"text-white"}`,children:s.title}),e.jsxs("div",{className:"flex items-center gap-3 mt-1",children:[e.jsxs("span",{className:"text-white/30 text-xs flex items-center gap-1",children:[e.jsx(B,{size:10}),s.duration]}),e.jsxs("span",{className:"text-xs flex items-center gap-1",style:{color:"#fbbf24"},children:[e.jsx(k,{size:10}),"+",s.xp," XP"]})]})]}),!o&&!n&&e.jsx("div",{className:"px-3 py-1.5 rounded-lg text-xs font-medium",style:{background:`${t.color}20`,color:t.color},children:"Начать"})]})},s.id)})})]}):e.jsx("div",{className:"grid grid-cols-2 gap-3",children:z.map((s,a)=>{const n=u(s),o=n===100;return e.jsxs(l.button,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{delay:a*.05},onClick:()=>f(s),className:"rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98]",style:{boxShadow:`0 8px 32px ${s.color}20`},children:[e.jsxs("div",{className:"h-28 relative",children:[e.jsx("img",{src:s.image,alt:s.name,className:"w-full h-full object-cover"}),e.jsx("div",{className:"absolute inset-0",style:{background:`linear-gradient(180deg, transparent 0%, ${s.color}90 100%)`}}),n>0&&e.jsx("div",{className:"absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold",style:{background:o?"#22c55e":"rgba(0,0,0,0.5)",color:"white"},children:o?"✓":`${n}%`}),e.jsx("div",{className:"absolute bottom-2 left-3",children:e.jsx("span",{className:"text-3xl drop-shadow-lg",children:s.emoji})})]}),e.jsxs("div",{className:"p-3",style:{background:"linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"},children:[e.jsx("h4",{className:"text-white font-bold text-sm mb-0.5 truncate",children:s.name}),e.jsx("p",{className:"text-white/40 text-[10px] mb-2 line-clamp-1",children:s.description}),e.jsx("div",{className:"h-1 bg-white/10 rounded-full overflow-hidden",children:e.jsx("div",{className:"h-full rounded-full transition-all",style:{width:`${n}%`,background:s.color}})}),e.jsxs("div",{className:"flex justify-between mt-1",children:[e.jsxs("span",{className:"text-white/30 text-[9px]",children:[s.lessons.length," уроков"]}),e.jsxs("span",{className:"text-[9px] font-bold",style:{color:s.color},children:[n,"%"]})]})]})]},s.id)})})}),e.jsx(w,{children:i&&t&&e.jsx(l.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},className:"fixed inset-0 z-[110] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4",children:e.jsxs(l.div,{initial:{scale:.9,y:20},animate:{scale:1,y:0},exit:{scale:.9,y:20},className:"w-full max-w-sm rounded-3xl overflow-hidden",style:{background:"linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",backdropFilter:"blur(40px)",border:"1px solid rgba(255,255,255,0.15)"},children:[e.jsxs("div",{className:"p-6 text-center",children:[e.jsx("span",{className:"text-5xl mb-4 block",children:t.emoji}),e.jsx("h3",{className:"text-xl font-bold text-white mb-2",children:i.title}),e.jsx("p",{className:"text-white/50 text-sm",children:t.name})]}),e.jsxs("div",{className:"px-6 pb-6",children:[e.jsx("div",{className:"h-2 bg-white/10 rounded-full overflow-hidden mb-4",children:e.jsx(l.div,{className:"h-full rounded-full",style:{width:`${y}%`,background:t.color}})}),y<100?e.jsxs("div",{children:[d[i.id]?e.jsxs("div",{className:"mb-6",children:[e.jsx("div",{className:"p-4 rounded-2xl text-left max-h-64 overflow-y-auto",style:{background:"rgba(0,0,0,0.2)"},children:e.jsx("p",{className:"text-white/90 text-sm leading-relaxed whitespace-pre-line",children:(v=d[i.id].steps[m])==null?void 0:v.replace(/\*\*(.*?)\*\*/g,"$1")})}),e.jsxs("p",{className:"text-white/40 text-xs text-center mt-2",children:["Шаг ",m+1," из ",d[i.id].steps.length]})]}):e.jsx("p",{className:"text-white/70 text-sm mb-4 text-center",children:"Загрузка материала..."}),e.jsxs("div",{className:"flex gap-3",children:[e.jsx("button",{onClick:()=>{g(null),p(0),h(0)},className:"flex-1 py-3 rounded-xl text-white/50 text-sm font-medium",style:{background:"rgba(255,255,255,0.05)"},children:"Отмена"}),e.jsx("button",{onClick:_,className:"flex-1 py-3 rounded-xl text-white text-sm font-medium",style:{background:t.color},children:d[i.id]&&m<d[i.id].steps.length-1?"Далее →":"Завершить ✓"})]})]}):e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"flex items-center justify-center gap-4 mb-6",children:[e.jsxs("div",{className:"flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20",children:[e.jsx(k,{size:18,className:"text-yellow-400"}),e.jsxs("span",{className:"text-yellow-400 font-bold",children:["+",i.xp," XP"]})]}),e.jsxs("div",{className:"flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/20",children:[e.jsx(D,{size:18,className:"text-yellow-400"}),e.jsxs("span",{className:"text-yellow-400 font-bold",children:["+",Math.floor(i.xp/3)]})]})]}),e.jsx("button",{onClick:q,className:"w-full py-4 rounded-2xl font-bold text-white",style:{background:`linear-gradient(135deg, ${t.color} 0%, ${t.color}cc 100%)`,boxShadow:`0 8px 32px ${t.color}40`},children:"Готово! 🎉"})]})]})]})})})]})}):null};export{G as LifeSkillsModule,G as default};
