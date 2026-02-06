import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, ToastType, ToastMessage, TimelineEvent, QuizQuestion, Topic } from './types';
import { getGeminiResponseStream } from './services/gemini';
import { 
  Shield, Scroll, Map, MessageSquare, LogOut, ChevronRight, ChevronLeft,
  Send, User as UserIcon, Lock, Sparkles, BookOpen, Crown,
  Brain, Settings, RefreshCcw, Check, X as XIcon, Award, Zap, Loader2,
  Sword, Building2, Globe, Feather, Users, History, Microscope, Ghost, Heart, Trash2, Save
} from 'lucide-react';
import Toast from './components/Toast';
import CustomCursor from './components/CustomCursor';
import { GenerateContentResponse } from '@google/genai';

// --- Static Data: Timeline ---
const TIMELINE: TimelineEvent[] = [
  { year: '1336', title: 'Tavallud', description: "Amir Temur Kesh (Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ildi." },
  { year: '1360', title: 'Siyosiy Faoliyat', description: "Movarounnahrda o'zaro urushlar kuchaygan davrda siyosat maydoniga kirib keldi." },
  { year: '1370', title: 'Buyuk Amir', description: "Balx qurultoyida Movarounnahrning ulug' amiri deb e'lon qilindi va Samarqandni poytaxt qildi." },
  { year: '1382-1405', title: 'Buyuk Yurishlar', description: "Eron, Kavkaz, Hindiston, Oltin O'rda va Usmonli imperiyasiga qarshi zafarli yurishlar." },
  { year: '1395', title: "Oltin O'rda mag'lubiyati", description: "To'xtamishxon ustidan g'alaba qozonib, Oltin O'rda qudratiga chek qo'ydi." },
  { year: '1402', title: 'Anqara jangi', description: "Usmonli sultoni Boyazid I Yildirim ustidan buyuk g'alaba qozondi." },
  { year: '1404', title: 'Samarqandga qaytish', description: "Yetti yillik yurishdan so'ng poytaxtga qaytib, katta qurilish va to'ylar o'tkazdi." },
  { year: '1405', title: 'Vafot', description: "Xitoyga yurish paytida O'trorda vafot etdi. Go'ri Amir maqbarasiga dafn etildi." },
];

// --- Static Data: Topics (Encyclopedia) ---
const TOPICS_DATA: Topic[] = [
  {
    id: 'biography',
    title: 'Hayoti va Yoshligi',
    icon: UserIcon,
    shortDesc: "Sohibqironning tug'ilishi, bolaligi va kamolotga yetish davri.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Timur_reconstruction01.jpg/800px-Timur_reconstruction01.jpg",
    fullContent: `Amir Temur 1336-yil 9-aprelda Kesh (hozirgi Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida dunyoga keldi. Uning otasi Muhammad Tarag'ay barlos urug'ining nufuzli beklaridan biri bo'lgan. Onasi Takina xotun buxorolik bo'lgan.
    
Temur yoshligidan chavandozlik, ovchilik va kamondan o'q uzish sirlarini mukammal egallagan. U o'ta zehni o'tkir, dovyurak va tadbirkor bo'lib o'sgan. 12 yoshidayoq tengqurlari orasida yetakchilik qobiliyatini namoyon etgan.
    
1360-yillarda Movarounnahr mo'g'ullar istilosi va ichki nizolar tufayli og'ir ahvolda edi. Amir Temur dastlab amakisi Hoji Barlos, keyinchalik esa Amir Husayn bilan ittifoq tuzib, mo'g'ul bosqinchilariga qarshi kurash boshladi. Uning strategik aqli va harbiy salohiyati tez orada uni mintaqaning eng kuchli lideriga aylantirdi.

1370-yilda Balxda o'tkazilgan qurultoyda u Movarounnahrning "Buyuk Amiri" deb e'lon qilindi va tarqoq davlatni yagona bayroq ostida birlashtirishga kirishdi.`
  },
  {
    id: 'military',
    title: 'Harbiy Yurishlar',
    icon: Sword,
    shortDesc: "Jahon tarixini o'zgartirgan buyuk janglar va strategiyalar.",
    image: "https://i.pinimg.com/originals/94/a3/52/94a3521cc55106517565b9062369d724.jpg",
    fullContent: `Amir Temur tarixda mag'lubiyat nimaligini bilmagan kamdan-kam sarkardalardan biridir. Uning harbiy yurishlari ko'lami va tezligi bilan hayratlanarli edi.
    
1. Oltin O'rda (Rossiya va Dashti Qipchoq): To'xtamishxonning xiyonatidan so'ng, Temur shimolga uch marta yurish qildi. 1395-yildagi Terek daryosi bo'yidagi hal qiluvchi jangda Oltin O'rdani tor-mor etdi. Bu Rossiyaning mo'g'ullar zulmidan qutulishiga bilvosita sabab bo'ldi.

2. Eron va Yaqin Sharq: "Uch yillik", "Besh yillik" va "Yetti yillik" yurishlar davomida Xuroson, Eron, Iroq, Suriya va Kavkazni o'z davlatiga qo'shib oldi.

3. Hindiston yurishi (1398-1399): Dehli sultonligiga qarshi yurish qilib, qisqa muddatda Dehlini egalladi va katta o'ljalar bilan qaytdi.

4. Anqara Jangi (1402): Tarixning eng katta janglaridan biri. Usmonli sultoni Boyazid I Yildirim bilan to'qnashuvda Temur o'zining mashhur "To'lg'ama" usulini va fillarni qo'llab g'alaba qozondi. Bu g'alaba Yevropani Usmonlilar istilosidan vaqtincha saqlab qoldi.`
  },
  {
    id: 'architecture',
    title: 'Bunyodkorlik',
    icon: Building2,
    shortDesc: "Samarqand va Shahrisabzdagi me'moriy mo'jizalar.",
    image: "https://uzbekistan.travel/storage/app/media/nargiza/cropped-images/shaxrisabz-0-0-0-0-1582633036.jpg",
    fullContent: `Amir Temur nafaqat buzg'unchi, balki buyuk bunyodkor ham edi. Uning shiori: "Kimki mening qudratimga shubha qilsa, qurdirgan binolarimga boqsiz".
    
Samarqand: Poytaxtni "Yer yuzining sayqali"ga aylantirish uchun dunyoning to'rt tomonidan eng mohir usta va hunarmandlarni olib keldi.
- Bibixonim jome masjidi: O'z davrining eng ulkan inshooti.
- Go'ri Amir maqbarasi: Temuriylar xilxonasi, o'zining moviy gumbazi bilan mashhur.
- Shohi Zinda majmuasi: Muqaddas ziyoratgoh.
- Samarqand atrofida Bag'dod, Sheroz, Qohira, Damashq nomli qishloqlar va 12 ta ulkan bog'lar barpo ettirdi (Bog'i Dilkusho, Bog'i Chinor va h.k).

Shahrisabz: O'z ona shahrida mashhur Oqsaroyni qurdirdi. Uning peshtoqidagi yozuv mashhur: "Adolat — davlatning asosi va hukmdorlarning shioridir".`
  },
  {
    id: 'code',
    title: 'Temur Tuzuklari',
    icon: Scroll,
    shortDesc: "Davlat boshqaruvi va harbiy san'at haqidagi oltin qoidalar.",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Timur_Code.jpg",
    fullContent: `"Temur Tuzuklari" (Tuzuki Temuriy) — Amir Temurning davlatni boshqarish usullari, qo'shin tuzish tartiblari va o'z avlodlariga vasiyatlari jamlangan tarixiy asardir.
    
Asosiy g'oyalari:
- "Kuch — adolatdadir". Adolat Temur siyosatining o'zagi bo'lgan.
- Davlatni boshqarishda kengash va maslahatning o'rni. "Yuz ming otliq askar qila olmagan ishni bir to'g'ri tadbir bilan amalga oshirish mumkin".
- Jamiyatni 12 toifaga bo'lib boshqarish.
- Askarlarni rag'batlantirish va jazolash tizimi.
- Din arboblari, olimlar va san'atkorlarga homiylik qilish.

Bu asar asrlar davomida Sharq va G'arb hukmdorlari uchun qo'llanma bo'lib xizmat qilgan.`
  },
  {
    id: 'diplomacy',
    title: 'Diplomatiya',
    icon: Globe,
    shortDesc: "Yevropa va Osiyo qirollari bilan aloqalar.",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Clavijo_before_Tamerlane.jpg",
    fullContent: `Amir Temur o'z davrining global siyosatchisi edi. U Buyuk Ipak Yo'lini nazorat qilib, savdo-sotiqni rivojlantirishga intilgan.
    
Yevropa bilan aloqalar:
- Ispaniya qiroli Genrix III bilan yozishmalar olib borgan. Ispan elchisi Rui Gonsales de Klavixo Samarqandda bo'lib, Temur saroyi haqida mashhur kundalik yozib qoldirgan.
- Fransiya qiroli Karl VI va Angliya qiroli Genrix IV bilan xatlashgan. Temur ularga savdo aloqalarini taklif qilgan.
    
Xitoy va Osiyo:
- Xitoy (Min sulolasi) bilan dastlab elchilik aloqalari bo'lgan, ammo keyinchalik munosabatlar keskinlashib, Xitoyga yurish rejalashtirilgan.
- Usmonlilar va Misr Mamluklari bilan murakkab diplomatik o'yinlar olib borgan.`
  },
  {
    id: 'family',
    title: 'Oilasi va Avlodlari',
    icon: Users,
    shortDesc: "Temuriylar sulolasi va ularning merosi.",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/35/Ulugh_Beg.jpg",
    fullContent: `Amir Temur o'zidan so'ng ulkan sulola qoldirdi. U o'z o'g'il va nabiralarini turli viloyatlarga hokim etib tayinlagan.
    
O'g'illari:
1. Jahongir Mirzo (sevimli o'g'li, erta vafot etgan).
2. Umarshayx Mirzo.
3. Mironshoh Mirzo.
4. Shohruh Mirzo (Temurdan keyin davlatni eng uzoq va barqaror boshqargan hukmdor, Ulug'bekning otasi).
    
Mashhur Nabiralari:
- Mirzo Ulug'bek: Buyuk astronom va olim, Samarqandda rasadxona qurdirgan.
- Zahiriddin Muhammad Bobur (avara): Hindistonda Boburiylar imperiyasini tuzgan buyuk shoir va sarkarda.
- Husayn Boyqaro: Hirotda madaniyatni gullatgan hukmdor, Navoiyning do'sti.`
  },
  {
    id: 'science',
    title: 'Fan va Madaniyat',
    icon: Microscope,
    shortDesc: "Temuriylar Renessansi va ilm-fan rivoji.",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ulugh_Beg_Observatory.jpg",
    fullContent: `Amir Temur va uning avlodlari davrida Movarounnahrda ilm-fan va madaniyat misli ko'rilmagan darajada rivojlandi. Bu davr tarixda "Temuriylar Renessansi" deb ataladi.
    
1. Ilm-fan homiysi: Amir Temur qayerga borsa, u yerdagi olim, shoir va hunarmandlarni Samarqandga olib kelgan. U tarixchi Ibn Arabshoh, faylasuf Mirsaid Sharif Jurjoniy kabi allomalar bilan suhbatlar qurgan.

2. Tibbiyot va Astronomiya: Samarqandda ko'plab shifoxonalar va madrasalar qurilgan. Keyinchalik uning nabirasi Mirzo Ulug'bek dunyodagi eng aniq astronomik jadval — "Ziji Ko'ragoniy"ni yaratdi.

3. San'at va Miniatyura: Kamoliddin Behzod kabi musavvirlar yetishib chiqdi. Kitobat san'ati (kalligrafiya) yuksak cho'qqiga chiqdi.

4. Til va Adabiyot: Garchi saroyda fors tili keng qo'llanilsa-da, turkiy til (eski o'zbek tili) rivojiga katta e'tibor berildi. Alisher Navoiyning keyinchalik yetishib chiqishi uchun zamin aynan shu davrda yaratilgan edi.`
  },
  {
    id: 'legends',
    title: 'Afsonalar va Haqiqat',
    icon: Ghost,
    shortDesc: "Amir Temur haqidagi mashhur rivoyatlar.",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Guri_Amir_interior.jpg",
    fullContent: `Amir Temur shaxsi atrofida asrlar davomida ko'plab afsonalar to'qilgan.
    
1. Chumoli va Temur: Temur yoshligida mag'lubiyatga uchrab, bir vayronaga bekinadi. U yerda bir chumolining bug'doy donasini devorga olib chiqishga urinayotganini kuzatadi. Chumoli 70 marta yiqilib, 71-marta maqsadiga yetadi. Bundan ruhlangan Temur "Men ham aslo taslim bo'lmayman" deb ahd qiladi.

2. Go'ri Amir La'nati: 1941-yil iyun oyida sovet arxeologlari Temur qabrini ochishadi. Rivoyatlarga ko'ra, qabr toshida "Kim mening tinchimni buzsa, urush balosiga yo'liqadi" degan yozuv bo'lgan. Qabr ochilganidan 2 kun o'tib, Ikkinchi Jahon urushi (Germaniyaning SSSRga hujumi) boshlangan, degan afsona mavjud.

3. Oqsoqligi: Uning "Temurlang" (Cho'loq Temur) deb atalishiga sabab, Seyistondagi jangda o'ng qo'li va o'ng oyog'idan yaralanganidir. Bu uning jismoniy kamchiligi emas, balki jasorati belgisi edi.`
  },
  {
    id: 'women',
    title: 'Temuriylar Davrida Ayollar',
    icon: Heart,
    shortDesc: "Bibixonim, Saroymulkxonim va boshqa buyuk ayollar.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Bibi-Khanym_Mosque_2010.jpg/1200px-Bibi-Khanym_Mosque_2010.jpg",
    fullContent: `Temuriylar davrida ayollar jamiyatda yuksak mavqega ega bo'lganlar. Ular nafaqat oila bekasi, balki bunyodkor va maslahatchi ham edilar.
    
1. Saroymulkxonim (Bibixonim): Amir Temurning suyukli rafiqasi. U Chig'atoyxon avlodidan bo'lgani uchun Temur "Ko'ragon" (Xon kuyovi) unvonini olgan. Bibixonim donishmand ayol bo'lib, Temur safardaligida Samarqand boshqaruvida qatnashgan. Mashhur Bibixonim masjidi uning nomi bilan bog'liq.

2. Gavharshod Begim: Shohruh Mirzoning rafiqasi. U Hirot va Mashhadda ko'plab madrasa va masjidlar qurdirgan (masalan, Mashhaddagi Gavharshod masjidi). U davlat siyosatida juda faol bo'lgan.

3. To'ylar va Bayramlar: Temuriylar malikalari elchilarni qabul qilish marosimlarida ishtirok etishgan, o'zlarining shaxsiy mulklari va vaqflariga ega bo'lishgan.`
  }
];

// --- Static Data: Quiz Questions ---
const QUIZ_DB: QuizQuestion[] = [
  {
    id: 1,
    question: "Amir Temur qaysi yilda tug'ilgan?",
    options: ["1336-yil 9-aprel", "1340-yil 8-mart", "1330-yil 21-mart", "1350-yil 1-sentabr"],
    correctAnswer: 0
  },
  {
    id: 2,
    question: "Temuriylar davlatining poytaxti qaysi shahar bo'lgan?",
    options: ["Buxoro", "Samarqand", "Hirot", "Shahrisabz"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Amir Temurning uzugida qanday yozuv bo'lgan?",
    options: ["Kuch - adolatdadir", "Adolat - mulkning asosi", "Dunyo - o'tkinchi", "G'alaba - Allohdandir"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Amir Temur qaysi urug'ga mansub bo'lgan?",
    options: ["Mang'it", "Qo'ng'irot", "Barlos", "Kenagas"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "1402-yilda Anqara jangida Amir Temur kim ustidan g'alaba qozongan?",
    options: ["To'xtamishxon", "Boyazid I Yildirim", "Ilyos Xo'ja", "Mirzo Ulug'bek"],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "Bibixonim jome masjidi kimning sharafiga qurilgan?",
    options: ["Amir Temurning onasi", "Amir Temurning singlisi", "Amir Temurning rafiqasi", "Amir Temurning qizi"],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "Amir Temur qayerda vafot etgan?",
    options: ["Samarqandda", "O'trorda", "Xitoyda", "Keshda"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "\"Temur Tuzuklari\" asari nima haqida?",
    options: ["She'riyat qoidalari", "Davlat boshqaruvi va harbiy san'at", "Tibbiyot sirlari", "Yulduzlar ilmi"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Mirzo Ulug'bek Amir Temurning kim bo'ladi?",
    options: ["O'g'li", "Nabirasi", "Ukasi", "Jiyani"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Amir Temur tomonidan bunyod etilgan \"Oqsaroy\" qayerda joylashgan?",
    options: ["Samarqandda", "Buxoroda", "Shahrisabzda", "Termizda"],
    correctAnswer: 2
  }
];

// --- Mock Google Accounts ---
const INITIAL_GOOGLE_ACCOUNTS = [
  { id: 1, name: 'Sizning Hisobingiz', email: 'foydalanuvchi@gmail.com', avatar: 'U' },
];

// --- Main App Component ---
export default function App() {
  // 1. Lazy Load User from LocalStorage to prevent Login Flash
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('temur_app_user');
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        console.error("User parse error", e);
        return null;
      }
    }
    return null;
  });

  // 2. Lazy Load Chat History
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('temur_app_chat');
        return saved ? JSON.parse(saved) : [{ id: '1', role: 'model', text: 'Assalomu alaykum! Men Amir Temur tarixi bo\'yicha sun\'iy intellekt yordamchiman. Sohibqiron haqida nima bilishni istaysiz?' }];
      } catch (e) {
        return [{ id: '1', role: 'model', text: 'Assalomu alaykum! Men Amir Temur tarixi bo\'yicha sun\'iy intellekt yordamchiman. Sohibqiron haqida nima bilishni istaysiz?' }];
      }
    }
    return [{ id: '1', role: 'model', text: 'Assalomu alaykum! Men Amir Temur tarixi bo\'yicha sun\'iy intellekt yordamchiman. Sohibqiron haqida nima bilishni istaysiz?' }];
  });

  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'quiz' | 'chat' | 'profile'>('home');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Auth Form State
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  
  // Google Modal Internal State
  const [googleModalView, setGoogleModalView] = useState<'list' | 'add'>('list');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountName, setNewAccountName] = useState('');

  // History/Encyclopedia State
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Initialize App (Fallback for safety)
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Persist Chat History on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('temur_app_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // --- Helper Functions ---
  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Centralized Save Function
  const saveUserData = (userData: User) => {
    setUser(userData);
    localStorage.setItem('temur_app_user', JSON.stringify(userData));
  };

  const updateUserStats = (pointsToAdd: number) => {
    if (!user) return;
    const newQuizTaken = (user.stats?.quizTaken || 0) + 1;
    const currentScore = user.stats?.highestScore || 0;
    
    // Update logic: Keep the highest score ever achieved
    const newHighestScore = Math.max(currentScore, pointsToAdd);

    const updatedUser: User = { 
      ...user, 
      stats: {
        quizTaken: newQuizTaken,
        highestScore: newHighestScore
      }
    };
    saveUserData(updatedUser);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName.trim().length < 3) {
      addToast("Ism kamida 3 ta harfdan iborat bo'lishi kerak", ToastType.ERROR);
      return;
    }
    
    setIsLoggingIn(true);
    setTimeout(() => {
      const newUser: User = { 
        name: loginName, 
        isLoggedIn: true,
        stats: { quizTaken: 0, highestScore: 0 }
      };
      saveUserData(newUser);
      setIsLoggingIn(false);
      addToast(`Xush kelibsiz, ${loginName}!`, ToastType.SUCCESS);
    }, 1000);
  };

  const handleGoogleLoginClick = () => {
    setGoogleModalView('list');
    setNewAccountEmail('');
    setNewAccountName('');
    setShowGoogleModal(true);
  };

  const confirmGoogleLogin = (name: string, email: string) => {
    setShowGoogleModal(false);
    setIsLoggingIn(true);
    
    setTimeout(() => {
      const newUser: User = {
        name: name,
        email: email,
        isLoggedIn: true,
        stats: { quizTaken: 0, highestScore: 0 }
      };
      saveUserData(newUser);
      setIsLoggingIn(false);
      addToast("Google orqali muvaffaqiyatli kirildi!", ToastType.SUCCESS);
    }, 1000);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountEmail.includes('@') || !newAccountName.trim()) {
      addToast("Iltimos, to'g'ri email va ism kiriting", ToastType.ERROR);
      return;
    }
    confirmGoogleLogin(newAccountName, newAccountEmail);
  };

  const handleLogout = () => {
    // Clear Session
    localStorage.removeItem('temur_app_user');
    // Clear Chat History (Optional, usually desired for Logout)
    localStorage.removeItem('temur_app_chat');
    
    setUser(null);
    setMessages([{ id: Date.now().toString(), role: 'model', text: 'Assalomu alaykum! Men Amir Temur tarixi bo\'yicha sun\'iy intellekt yordamchiman. Sohibqiron haqida nima bilishni istaysiz?' }]);
    setActiveTab('home');
    setSelectedTopicId(null);
    addToast("Tizimdan chiqildi", ToastType.INFO);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    // AI message placeholder (Empty initially)
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'model', text: '', isTyping: true }]);

    try {
      const stream = await getGeminiResponseStream(userMsg.text, messages);
      
      let fullText = '';
      
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: fullText, isTyping: true } : msg
          ));
        }
      }
      
      // Finalize message
       setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, isTyping: false } : msg
       ));

    } catch (error) {
      addToast("AI javob bera olmadi. Internetni tekshiring.", ToastType.ERROR);
      setMessages(prev => prev.filter(msg => msg.id !== aiMsgId));
    } finally {
      setIsTyping(false);
    }
  };

  // --- Quiz Functions ---
  const startQuiz = () => {
    const shuffled = [...QUIZ_DB].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);
    
    setCurrentQuestions(selected);
    setCurrentQuestionIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setQuizActive(true);
  };

  const handleQuizAnswer = (index: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(index);
  };

  const checkAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    if (selectedAnswer === currentQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      updateUserStats(quizScore); 
    }
  };

  // --- Views ---

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 font-sans selection:bg-temur-gold selection:text-black">
        <CustomCursor />
        <Toast toasts={toasts} removeToast={removeToast} />
        
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1575407283624-9dfc52251347?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 filter blur-sm scale-105 animate-pulse-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950"></div>
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md p-8 glass-panel rounded-2xl shadow-2xl border-t border-temur-gold/20 animate-slide-up">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-temur-gold/10 border border-temur-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <Crown className="w-12 h-12 text-temur-gold" />
            </div>
          </div>
          
          <h1 className="text-3xl font-serif text-center text-temur-gold mb-2 text-glow">Buyuk Saltanat</h1>
          <p className="text-center text-slate-400 mb-8 text-sm">Amir Temur dunyosiga kirish</p>

          <div className="space-y-6">
             {/* Google Login Button */}
            <button 
              onClick={handleGoogleLoginClick}
              disabled={isLoggingIn}
              className="w-full bg-white hover:bg-slate-100 text-slate-800 font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg group relative overflow-hidden"
            >
              {isLoggingIn ? (
                <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Google bilan kirish</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4">
              <div className="h-px bg-slate-700 flex-1"></div>
              <span className="text-slate-500 text-xs uppercase">Yoki</span>
              <div className="h-px bg-slate-700 flex-1"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="group">
                <label className="block text-xs uppercase tracking-wider text-temur-gold/70 mb-2">Ismingiz</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-temur-gold transition-colors" />
                  <input 
                    type="text" 
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-temur-gold focus:ring-1 focus:ring-temur-gold transition-all"
                    placeholder="Ismingizni kiriting..."
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs uppercase tracking-wider text-temur-gold/70 mb-2">Parol (ixtiyoriy)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500 group-focus-within:text-temur-gold transition-colors" />
                  <input 
                    type="password" 
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    disabled={isLoggingIn}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-temur-gold focus:ring-1 focus:ring-temur-gold transition-all"
                    placeholder="******"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-temur-gold to-yellow-600 text-black font-bold py-3.5 rounded-lg shadow-lg shadow-yellow-600/20 hover:shadow-yellow-600/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Kirish <ChevronRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Google Account Picker Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in p-4">
             <div className="bg-white text-gray-800 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-up relative">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                   <div className="flex justify-center mb-4">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                   </div>
                   <h3 className="text-xl font-medium text-center text-gray-900">
                      {googleModalView === 'list' ? 'Hisobni tanlang' : 'Hisob qo\'shish'}
                   </h3>
                   <p className="text-sm text-center text-gray-500 mt-1">Buyuk Saltanat ilovasiga kirish uchun</p>
                </div>
                
                {/* View: Account List */}
                {googleModalView === 'list' && (
                  <div className="py-2">
                     {INITIAL_GOOGLE_ACCOUNTS.map(account => (
                        <button 
                          key={account.id}
                          onClick={() => confirmGoogleLogin(account.name, account.email)}
                          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                        >
                           <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg">
                              {account.avatar}
                           </div>
                           <div className="text-left">
                              <p className="font-medium text-gray-900">{account.name}</p>
                              <p className="text-sm text-gray-500">{account.email}</p>
                           </div>
                        </button>
                     ))}
                     <button 
                        onClick={() => setGoogleModalView('add')}
                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-gray-700"
                     >
                        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
                           <UserIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <span className="font-medium">Boshqa hisob qo'shish</span>
                     </button>
                  </div>
                )}

                {/* View: Add Account Form */}
                {googleModalView === 'add' && (
                  <div className="p-6">
                    <form onSubmit={handleAddAccountSubmit} className="space-y-4">
                       <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Email yoki telefon</label>
                          <input 
                            type="email" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Emailingizni kiriting"
                            value={newAccountEmail}
                            onChange={(e) => setNewAccountEmail(e.target.value)}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Ismingiz (Simulyatsiya uchun)</label>
                          <input 
                            type="text" 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            placeholder="Ismingiz"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                          />
                       </div>
                       <div className="flex gap-3 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setGoogleModalView('list')}
                            className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                             Orqaga
                          </button>
                          <button 
                            type="submit" 
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
                          >
                             Keyingisi
                          </button>
                       </div>
                    </form>
                  </div>
                )}

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center">
                   <button onClick={() => setShowGoogleModal(false)} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Yopish
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-temur-gold selection:text-black flex">
      <CustomCursor />
      <Toast toasts={toasts} removeToast={removeToast} />
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-20 md:w-64 glass-panel border-r border-white/5 z-50 hidden md:flex flex-col justify-between py-8">
        <div>
          <div className="px-6 mb-10 flex items-center gap-3">
             <div className="p-2 bg-temur-gold/20 rounded-lg border border-temur-gold/10">
                <Crown className="w-6 h-6 text-temur-gold" />
             </div>
             <span className="font-serif text-xl font-bold text-temur-gold tracking-widest hidden md:block">TEMUR</span>
          </div>

          <nav className="space-y-2 px-3">
            {[
              { id: 'home', icon: Shield, label: 'Asosiy' },
              { id: 'history', icon: BookOpen, label: 'Ensiklopediya' },
              { id: 'quiz', icon: Brain, label: 'Viktorina' },
              { id: 'chat', icon: MessageSquare, label: 'Temur AI' },
              { id: 'profile', icon: Settings, label: 'Profil' },
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => {
                   setActiveTab(item.id as any);
                   if (item.id === 'history') setSelectedTopicId(null);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group ${activeTab === item.id ? 'bg-temur-gold text-slate-900 font-semibold shadow-lg shadow-temur-gold/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-slate-900' : 'text-slate-400 group-hover:text-temur-gold'}`} />
                <span className="hidden md:block">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="px-3">
           <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all duration-300"
           >
             <LogOut className="w-5 h-5" />
             <span className="hidden md:block">Chiqish</span>
           </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-16 glass-panel border-t border-white/5 z-50 flex justify-around items-center px-4 backdrop-blur-xl">
        <button onClick={() => setActiveTab('home')} className={`p-2 rounded-full ${activeTab === 'home' ? 'text-temur-gold bg-white/10' : 'text-slate-500'}`}><Shield /></button>
        <button onClick={() => { setActiveTab('history'); setSelectedTopicId(null); }} className={`p-2 rounded-full ${activeTab === 'history' ? 'text-temur-gold bg-white/10' : 'text-slate-500'}`}><BookOpen /></button>
        <button onClick={() => setActiveTab('quiz')} className={`p-2 rounded-full ${activeTab === 'quiz' ? 'text-temur-gold bg-white/10' : 'text-slate-500'}`}><Brain /></button>
        <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-full ${activeTab === 'chat' ? 'text-temur-gold bg-white/10' : 'text-slate-500'}`}><MessageSquare /></button>
        <button onClick={() => setActiveTab('profile')} className={`p-2 rounded-full ${activeTab === 'profile' ? 'text-temur-gold bg-white/10' : 'text-slate-500'}`}><Settings /></button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>

        {/* HOME VIEW */}
        {activeTab === 'home' && (
          <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in">
             {/* Header */}
             <div className="flex justify-between items-center mb-12">
               <div>
                 <h2 className="text-sm text-temur-gold uppercase tracking-[0.2em] mb-2">Buyuk Amir</h2>
                 <h1 className="text-4xl md:text-6xl font-serif font-bold text-white text-glow">
                   Amir Temur
                 </h1>
               </div>
               <div className="hidden md:block text-right">
                 <p className="text-slate-500">Foydalanuvchi</p>
                 <p className="text-white font-semibold flex items-center justify-end gap-2">
                   <UserIcon className="w-4 h-4 text-temur-gold" /> {user.name}
                 </p>
               </div>
             </div>

             {/* Hero Section */}
             <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 mb-12 group">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Amir_Timur_Square_in_Tashkent.jpg/1200px-Amir_Timur_Square_in_Tashkent.jpg" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt="Amir Temur Statue"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-8 md:p-12">
                   <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <p className="text-3xl md:text-4xl font-serif text-temur-gold mb-2 italic drop-shadow-md">"Kuch — adolatdadir"</p>
                     <p className="text-slate-300 max-w-xl">Adolat va qudrat timsoli bo'lgan buyuk sarkarda merosi bilan tanishing.</p>
                     <button onClick={() => setActiveTab('history')} className="mt-6 px-6 py-3 bg-temur-gold/10 border border-temur-gold text-temur-gold rounded-lg hover:bg-temur-gold hover:text-black transition-all font-semibold">
                       Ensiklopediyani Ochish
                     </button>
                   </div>
                </div>
             </div>

             {/* Cards Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border-t border-white/5 hover:border-temur-gold/30 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Map className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Buyuk Davlat</h3>
                  <p className="text-slate-400 text-sm">Amir Temur tuzgan saltanat Hindistondan Turkiyagacha, Moskvadan Arabistongacha cho'zilgan.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-t border-white/5 hover:border-temur-gold/30 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-temur-gold/20 rounded-xl flex items-center justify-center text-temur-gold mb-4 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Temur Tuzuklari</h3>
                  <p className="text-slate-400 text-sm">Davlat boshqaruvining oltin qoidalari yozilgan tarixiy asar, bugungi kunda ham o'z ahamiyatini yo'qotmagan.</p>
                </div>

                <div className="glass-panel p-6 rounded-2xl border-t border-white/5 hover:border-temur-gold/30 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-400 mb-4 shadow-[0_0_10px_rgba(147,51,234,0.3)]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Madaniyat va San'at</h3>
                  <p className="text-slate-400 text-sm">Samarqandni dunyo markaziga aylantirdi, olimlar va hunarmandlarni qo'llab-quvvatladi.</p>
                </div>
             </div>
          </div>
        )}

        {/* HISTORY / ENCYCLOPEDIA VIEW */}
        {activeTab === 'history' && (
          <div className="p-6 md:p-12 max-w-7xl mx-auto animate-fade-in pb-24">
             {selectedTopicId ? (
                // DETAIL VIEW
                <div className="animate-slide-up">
                   <button 
                     onClick={() => setSelectedTopicId(null)}
                     className="flex items-center gap-2 text-temur-gold hover:text-white mb-6 transition-colors"
                   >
                      <ChevronLeft className="w-5 h-5" /> Barcha mavzular
                   </button>
                   
                   {(() => {
                      const topic = TOPICS_DATA.find(t => t.id === selectedTopicId);
                      if (!topic) return null;
                      return (
                        <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                           <div className="relative h-[300px] md:h-[400px]">
                              <img src={topic.image} alt={topic.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent flex items-end p-8">
                                 <h1 className="text-4xl md:text-6xl font-serif font-bold text-white text-glow">{topic.title}</h1>
                              </div>
                           </div>
                           <div className="p-8 md:p-12">
                              <div className="prose prose-invert prose-lg max-w-none">
                                 <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                                    {topic.fullContent}
                                 </p>
                              </div>
                           </div>
                        </div>
                      );
                   })()}
                </div>
             ) : (
                // LIST VIEW
                <>
                   <h1 className="text-4xl font-serif text-temur-gold mb-4 text-center text-glow">Amir Temur Ensiklopediyasi</h1>
                   <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">Sohibqironning hayoti, faoliyati va merosi haqida to'liq ma'lumotlar to'plami.</p>
                   
                   {/* Topics Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                      {TOPICS_DATA.map((topic) => (
                         <div 
                           key={topic.id}
                           onClick={() => setSelectedTopicId(topic.id)}
                           className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-temur-gold/50 cursor-pointer group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-temur-gold/10"
                         >
                            <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-temur-gold/20 transition-colors">
                               <topic.icon className="w-7 h-7 text-slate-400 group-hover:text-temur-gold transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-temur-gold transition-colors">{topic.title}</h3>
                            <p className="text-slate-400 line-clamp-3 leading-relaxed">{topic.shortDesc}</p>
                            <div className="mt-4 flex items-center gap-2 text-temur-gold text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                               O'qish <ChevronRight className="w-4 h-4" />
                            </div>
                         </div>
                      ))}
                   </div>

                   {/* Simplified Timeline */}
                   <div className="border-t border-white/10 pt-16">
                      <h2 className="text-3xl font-serif text-white mb-10 flex items-center gap-3">
                         <History className="w-8 h-8 text-temur-gold" /> Xronologiya
                      </h2>
                      <div className="space-y-4">
                         {TIMELINE.map((event, idx) => (
                            <div key={idx} className="flex gap-4 md:gap-8 group">
                               <div className="w-24 shrink-0 text-right pt-1">
                                  <span className="text-temur-gold font-bold font-serif">{event.year}</span>
                               </div>
                               <div className="relative border-l border-white/10 pl-8 pb-8 last:pb-0">
                                  <div className="absolute -left-[5px] top-[6px] w-2.5 h-2.5 rounded-full bg-slate-700 group-hover:bg-temur-gold transition-colors"></div>
                                  <h4 className="text-lg font-bold text-white mb-1">{event.title}</h4>
                                  <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </>
             )}
          </div>
        )}

        {/* QUIZ VIEW */}
        {activeTab === 'quiz' && (
          <div className="p-6 md:p-12 max-w-4xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
            {!quizActive ? (
              <div className="text-center glass-panel p-10 rounded-3xl border border-temur-gold/20 shadow-2xl max-w-lg w-full">
                 <div className="w-20 h-20 bg-temur-gold/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-temur-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                   <Brain className="w-10 h-10 text-temur-gold" />
                 </div>
                 <h2 className="text-3xl font-serif text-white mb-4">Temuriylar Bilimdoni</h2>
                 <p className="text-slate-400 mb-8">
                   Amir Temur va uning davri haqidagi bilimlaringizni sinab ko'ring. 
                   Har safar tasodifiy 5 ta yangi savol tushadi.
                 </p>
                 <button 
                   onClick={startQuiz}
                   className="px-8 py-4 bg-gradient-to-r from-temur-gold to-yellow-600 text-black font-bold text-lg rounded-xl shadow-lg hover:shadow-temur-gold/40 transform hover:-translate-y-1 transition-all w-full flex items-center justify-center gap-2"
                 >
                   Boshlash <ChevronRight className="w-5 h-5" />
                 </button>
              </div>
            ) : !quizFinished ? (
              <div className="w-full max-w-2xl">
                 {/* Progress Bar */}
                 <div className="mb-8">
                   <div className="flex justify-between text-sm text-slate-400 mb-2">
                     <span>Savol {currentQuestionIndex + 1} / {currentQuestions.length}</span>
                     <span>Ball: {quizScore}</span>
                   </div>
                   <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-temur-gold transition-all duration-500 ease-out"
                       style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                     ></div>
                   </div>
                 </div>

                 {/* Question Card */}
                 <div className="glass-panel p-8 rounded-3xl border border-white/10 mb-6">
                    <h3 className="text-xl md:text-2xl font-semibold text-white mb-8 leading-relaxed">
                      {currentQuestions[currentQuestionIndex].question}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {currentQuestions[currentQuestionIndex].options.map((option, idx) => {
                        let btnClass = "bg-slate-800/50 border-slate-700 hover:border-slate-500";
                        if (isAnswerChecked) {
                          if (idx === currentQuestions[currentQuestionIndex].correctAnswer) {
                            btnClass = "bg-green-900/50 border-green-500 text-green-200 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                          } else if (idx === selectedAnswer) {
                            btnClass = "bg-red-900/50 border-red-500 text-red-200";
                          } else {
                            btnClass = "opacity-50 border-slate-800";
                          }
                        } else if (selectedAnswer === idx) {
                           btnClass = "bg-temur-gold text-black border-temur-gold font-semibold shadow-lg shadow-temur-gold/30";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleQuizAnswer(idx)}
                            disabled={isAnswerChecked}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${btnClass}`}
                          >
                            <span className="mr-3 font-serif opacity-70">{['A','B','C','D'][idx]}.</span>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                 </div>

                 {/* Controls */}
                 <div className="flex justify-end">
                   {!isAnswerChecked ? (
                      <button 
                        onClick={checkAnswer}
                        disabled={selectedAnswer === null}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${selectedAnswer !== null ? 'bg-temur-gold text-black hover:shadow-lg hover:shadow-temur-gold/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                      >
                        Tekshirish
                      </button>
                   ) : (
                      <button 
                        onClick={nextQuestion}
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
                      >
                        {currentQuestionIndex === currentQuestions.length - 1 ? "Natijani Ko'rish" : "Keyingisi"} <ChevronRight className="w-4 h-4" />
                      </button>
                   )}
                 </div>
              </div>
            ) : (
              <div className="text-center glass-panel p-10 rounded-3xl border border-temur-gold/20 shadow-2xl max-w-lg w-full animate-slide-up">
                 <div className="mb-6 inline-block relative">
                   <div className="w-24 h-24 bg-gradient-to-tr from-temur-gold to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="w-12 h-12 text-black" />
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-temur-gold rounded-full px-3 py-1 text-temur-gold text-sm font-bold">
                     {Math.round((quizScore / currentQuestions.length) * 100)}%
                   </div>
                 </div>
                 
                 <h2 className="text-3xl font-serif text-white mb-2">Natija</h2>
                 <p className="text-xl text-temur-gold font-bold mb-6">
                   {quizScore} / {currentQuestions.length} ta to'g'ri javob
                 </p>
                 
                 <p className="text-slate-400 mb-8 leading-relaxed">
                   {quizScore === 5 ? "Ofarin! Siz haqiqiy tarixchi ekansiz!" :
                    quizScore >= 3 ? "Yaxshi natija! Lekin hali o'rganish kerak." :
                    "Ko'proq o'qishingiz kerak. Amir Temur tarixi boy."}
                 </p>
                 
                 <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-6 animate-pulse">
                    <Save className="w-4 h-4" /> Natija saqlandi
                 </div>
                 
                 <button 
                   onClick={startQuiz}
                   className="px-8 py-3 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl transition-all flex items-center justify-center gap-2 mx-auto w-full"
                 >
                   <RefreshCcw className="w-4 h-4" /> Qayta ishlash
                 </button>
              </div>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {activeTab === 'profile' && (
           <div className="p-6 md:p-12 max-w-3xl mx-auto animate-fade-in">
              <h1 className="text-3xl font-serif text-temur-gold mb-10 text-center">Profil Sozlamalari</h1>
              
              <div className="glass-panel p-8 rounded-3xl border border-white/5 mb-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900/50">
                   <Save className="w-3 h-3" /> Avtomatik saqlanmoqda
                </div>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-temur-gold text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-slate-500 text-sm">{user.email || 'Foydalanuvchi'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-slate-500 uppercase">Testlar Soni</p>
                     <p className="text-2xl font-bold text-temur-gold">{user.stats?.quizTaken || 0}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                     <p className="text-xs text-slate-500 uppercase">Eng Yuqori Ball</p>
                     <p className="text-2xl font-bold text-temur-gold">{user.stats?.highestScore || 0}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm text-slate-400 mb-2">Ismni o'zgartirish</label>
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         defaultValue={user.name}
                         className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-temur-gold focus:outline-none"
                         id="newNameInput"
                       />
                       <button 
                         onClick={() => {
                           const newName = (document.getElementById('newNameInput') as HTMLInputElement).value;
                           if(newName.trim()) {
                             const updated = {...user, name: newName};
                             saveUserData(updated);
                             addToast("Ism o'zgartirildi", ToastType.SUCCESS);
                           }
                         }}
                         className="bg-temur-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                       >
                         Saqlash
                       </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                 <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center justify-center gap-2 mx-auto px-6 py-3 border border-red-900/30 rounded-lg hover:bg-red-900/10">
                    <Trash2 className="w-4 h-4" /> Ma'lumotlarni tozalash va chiqish
                 </button>
              </div>
           </div>
        )}

        {/* CHAT VIEW */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-screen md:h-screen pt-4 pb-20 md:pb-4 px-4 md:px-8 animate-fade-in relative overflow-hidden">
             
             {/* Header */}
             <div className="text-center mb-4 z-10 shrink-0">
               <div className="inline-flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-full border border-temur-gold/30 backdrop-blur-sm">
                 <Sparkles className="w-4 h-4 text-temur-gold animate-pulse" />
                 <span className="text-temur-gold font-semibold text-sm">Temur AI — Tarixchi</span>
               </div>
             </div>

             {/* Messages Area */}
             <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 px-2 md:px-20 z-10 pb-4">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                   <div 
                     className={`
                       max-w-[85%] md:max-w-[70%] p-5 rounded-2xl text-sm md:text-base leading-relaxed shadow-lg transition-all
                       ${msg.role === 'user' 
                         ? 'bg-gradient-to-br from-temur-gold to-yellow-700 text-black font-medium rounded-tr-none' 
                         : 'bg-slate-800/90 border border-white/10 text-slate-200 rounded-tl-none backdrop-blur-md shadow-black/20'}
                     `}
                   >
                     {msg.role === 'model' && (
                       <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                         <Scroll className="w-4 h-4 text-temur-gold" />
                         <span className="text-xs font-bold text-temur-gold uppercase">Tarixchi</span>
                       </div>
                     )}
                     
                     {msg.isTyping && msg.text.length === 0 ? (
                        <div className="flex gap-1 h-6 items-center px-2">
                          <div className="w-2 h-2 bg-temur-gold rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                          <div className="w-2 h-2 bg-temur-gold rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-2 h-2 bg-temur-gold rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                     ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                     )}
                   </div>
                 </div>
               ))}
               <div ref={chatEndRef} />
             </div>

             {/* Quick Prompts & Input Area */}
             <div className="w-full max-w-4xl mx-auto z-20 mt-2 shrink-0">
               {/* Suggestion Chips */}
               {messages.length < 3 && !isTyping && (
                  <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
                    <button onClick={() => handleSendMessage("Amir Temur hikmatli so'zlaridan ayting")} className="whitespace-nowrap px-4 py-2 bg-slate-800/50 border border-slate-700 hover:border-temur-gold/50 rounded-full text-xs text-slate-300 hover:text-temur-gold transition-colors flex items-center gap-2">
                      <Zap className="w-3 h-3" /> Hikmatli so'z
                    </button>
                    <button onClick={() => handleSendMessage("Amir Temurning harbiy san'ati haqida")} className="whitespace-nowrap px-4 py-2 bg-slate-800/50 border border-slate-700 hover:border-temur-gold/50 rounded-full text-xs text-slate-300 hover:text-temur-gold transition-colors flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Jang san'ati
                    </button>
                    <button onClick={() => handleSendMessage("Menga biror maslahat bering")} className="whitespace-nowrap px-4 py-2 bg-slate-800/50 border border-slate-700 hover:border-temur-gold/50 rounded-full text-xs text-slate-300 hover:text-temur-gold transition-colors flex items-center gap-2">
                      <Brain className="w-3 h-3" /> Maslahat
                    </button>
                  </div>
               )}

               <div className="glass-panel p-2 rounded-2xl flex items-center gap-2 border border-temur-gold/30 focus-within:border-temur-gold/80 focus-within:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Amir Temur haqida so'rang..."
                    disabled={isTyping}
                    className="flex-1 bg-transparent border-none text-white px-4 py-3 focus:outline-none placeholder-slate-500"
                  />
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() || isTyping}
                    className={`p-3 rounded-xl transition-all ${chatInput.trim() && !isTyping ? 'bg-temur-gold text-black hover:bg-yellow-400 rotate-0' : 'bg-slate-800 text-slate-500 cursor-not-allowed rotate-90'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
               </div>
               <p className="text-center text-xs text-slate-600 mt-2">AI xato qilishi mumkin. Tarixiy manbalarni tekshiring.</p>
             </div>

          </div>
        )}
      </main>
    </div>
  );
}