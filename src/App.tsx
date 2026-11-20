import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Settings,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  User,
  Sparkles,
  Check,
  X,
  HelpCircle,
  Flame,
  Award,
  Layers,
} from 'lucide-react';

// ============================================================================
// 1. TYPES & DATA ARCHITECTURE (Extensible for Kanji, Vocab, Custom Decks)
// ============================================================================

export type CardStatus = 'new' | 'practice' | 'memorized';

export interface Flashcard {
  id: string;
  character: string;
  romaji: string;
  pronunciation: string;
  group: string;
  exampleWord?: string;
  exampleMeaning?: string;
}

export interface Deck {
  deckId: string;
  name: string;
  japaneseTitle: string;
  category: string;
  description: string;
  cards: Flashcard[];
}

export interface CardProgress {
  cardId: string;
  status: CardStatus;
  reviewCount: number;
  lastReviewedAt: string;
}

export const DECKS_DATA: Record<string, Deck> = {
  hiragana: {
    deckId: 'hiragana',
    name: 'Hiragana',
    japaneseTitle: 'ひらがな',
    category: 'Japanese Characters',
    description: 'The foundational phonetic syllabary used for native Japanese words and grammar.',
    cards: [
      { id: 'hiragana-a', character: 'あ', romaji: 'a', pronunciation: 'ah (as in father)', group: 'vowels', exampleWord: 'あめ (ame)', exampleMeaning: 'Rain' },
      { id: 'hiragana-i', character: 'い', romaji: 'i', pronunciation: 'ee (as in feet)', group: 'vowels', exampleWord: 'いぬ (inu)', exampleMeaning: 'Dog' },
      { id: 'hiragana-u', character: 'う', romaji: 'u', pronunciation: 'oo (as in food)', group: 'vowels', exampleWord: 'うみ (umi)', exampleMeaning: 'Sea' },
      { id: 'hiragana-e', character: 'え', romaji: 'e', pronunciation: 'eh (as in pet)', group: 'vowels', exampleWord: 'えき (eki)', exampleMeaning: 'Train station' },
      { id: 'hiragana-o', character: 'お', romaji: 'o', pronunciation: 'oh (as in go)', group: 'vowels', exampleWord: 'おちゃ (ocha)', exampleMeaning: 'Green tea' },
      { id: 'hiragana-ka', character: 'か', romaji: 'ka', pronunciation: 'kah', group: 'k-row', exampleWord: 'かさ (kasa)', exampleMeaning: 'Umbrella' },
      { id: 'hiragana-ki', character: 'き', romaji: 'ki', pronunciation: 'kee', group: 'k-row', exampleWord: 'き (ki)', exampleMeaning: 'Tree' },
      { id: 'hiragana-ku', character: 'く', romaji: 'ku', pronunciation: 'koo', group: 'k-row', exampleWord: 'くも (kumo)', exampleMeaning: 'Cloud' },
      { id: 'hiragana-ke', character: 'け', romaji: 'ke', pronunciation: 'keh', group: 'k-row', exampleWord: 'けさ (kesa)', exampleMeaning: 'This morning' },
      { id: 'hiragana-ko', character: 'こ', romaji: 'ko', pronunciation: 'koh', group: 'k-row', exampleWord: 'こえ (koe)', exampleMeaning: 'Voice' },
      { id: 'hiragana-sa', character: 'さ', romaji: 'sa', pronunciation: 'sah', group: 's-row', exampleWord: 'さくら (sakura)', exampleMeaning: 'Cherry blossom' },
      { id: 'hiragana-shi', character: 'し', romaji: 'shi', pronunciation: 'shee', group: 's-row', exampleWord: 'しろ (shiro)', exampleMeaning: 'White / Castle' },
      { id: 'hiragana-su', character: 'す', romaji: 'su', pronunciation: 'soo', group: 's-row', exampleWord: 'すし (sushi)', exampleMeaning: 'Sushi' },
      { id: 'hiragana-se', character: 'せ', romaji: 'se', pronunciation: 'seh', group: 's-row', exampleWord: 'せかい (sekai)', exampleMeaning: 'World' },
      { id: 'hiragana-so', character: 'そ', romaji: 'so', pronunciation: 'soh', group: 's-row', exampleWord: 'そら (sora)', exampleMeaning: 'Sky' },
      { id: 'hiragana-ta', character: 'た', romaji: 'ta', pronunciation: 'tah', group: 't-row', exampleWord: 'たべる (taberu)', exampleMeaning: 'To eat' },
      { id: 'hiragana-chi', character: 'ち', romaji: 'chi', pronunciation: 'chee', group: 't-row', exampleWord: 'ちず (chizu)', exampleMeaning: 'Map' },
      { id: 'hiragana-tsu', character: 'つ', romaji: 'tsu', pronunciation: 'tsoo', group: 't-row', exampleWord: 'つき (tsuki)', exampleMeaning: 'Moon' },
      { id: 'hiragana-te', character: 'て', romaji: 'te', pronunciation: 'teh', group: 't-row', exampleWord: 'てがみ (tegami)', exampleMeaning: 'Letter' },
      { id: 'hiragana-to', character: 'と', romaji: 'to', pronunciation: 'toh', group: 't-row', exampleWord: 'とり (tori)', exampleMeaning: 'Bird' },
      { id: 'hiragana-na', character: 'な', romaji: 'na', pronunciation: 'nah', group: 'n-row', exampleWord: 'なつ (natsu)', exampleMeaning: 'Summer' },
      { id: 'hiragana-ni', character: 'に', romaji: 'ni', pronunciation: 'nee', group: 'n-row', exampleWord: 'にほん (nihon)', exampleMeaning: 'Japan' },
      { id: 'hiragana-nu', character: 'ぬ', romaji: 'nu', pronunciation: 'noo', group: 'n-row', exampleWord: 'ぬの (nuno)', exampleMeaning: 'Cloth' },
      { id: 'hiragana-ne', character: 'ね', romaji: 'ne', pronunciation: 'neh', group: 'n-row', exampleWord: 'ねこ (neko)', exampleMeaning: 'Cat' },
      { id: 'hiragana-no', character: 'の', romaji: 'no', pronunciation: 'noh', group: 'n-row', exampleWord: 'のみもの (nomimono)', exampleMeaning: 'Drink' },
      { id: 'hiragana-ha', character: 'は', romaji: 'ha', pronunciation: 'hah', group: 'h-row', exampleWord: 'はな (hana)', exampleMeaning: 'Flower' },
      { id: 'hiragana-hi', character: 'ひ', romaji: 'hi', pronunciation: 'hee', group: 'h-row', exampleWord: 'ひと (hito)', exampleMeaning: 'Person' },
      { id: 'hiragana-fu', character: 'ふ', romaji: 'fu', pronunciation: 'foo (soft breath)', group: 'h-row', exampleWord: 'ふゆ (fuyu)', exampleMeaning: 'Winter' },
      { id: 'hiragana-he', character: 'へ', romaji: 'he', pronunciation: 'heh', group: 'h-row', exampleWord: 'へや (heya)', exampleMeaning: 'Room' },
      { id: 'hiragana-ho', character: 'ほ', romaji: 'ho', pronunciation: 'hoh', group: 'h-row', exampleWord: 'ほし (hoshi)', exampleMeaning: 'Star' },
      { id: 'hiragana-ma', character: 'ま', romaji: 'ma', pronunciation: 'mah', group: 'm-row', exampleWord: 'まど (mado)', exampleMeaning: 'Window' },
      { id: 'hiragana-mi', character: 'み', romaji: 'mi', pronunciation: 'mee', group: 'm-row', exampleWord: 'みず (mizu)', exampleMeaning: 'Water' },
      { id: 'hiragana-mu', character: 'む', romaji: 'mu', pronunciation: 'moo', group: 'm-row', exampleWord: 'むし (mushi)', exampleMeaning: 'Insect' },
      { id: 'hiragana-me', character: 'め', romaji: 'me', pronunciation: 'meh', group: 'm-row', exampleWord: 'め (me)', exampleMeaning: 'Eye' },
      { id: 'hiragana-mo', character: 'も', romaji: 'mo', pronunciation: 'moh', group: 'm-row', exampleWord: 'もり (mori)', exampleMeaning: 'Forest' },
      { id: 'hiragana-ya', character: 'や', romaji: 'ya', pronunciation: 'yah', group: 'y-row', exampleWord: 'やま (yama)', exampleMeaning: 'Mountain' },
      { id: 'hiragana-yu', character: 'ゆ', romaji: 'yu', pronunciation: 'yoo', group: 'y-row', exampleWord: 'ゆき (yuki)', exampleMeaning: 'Snow' },
      { id: 'hiragana-yo', character: 'よ', romaji: 'yo', pronunciation: 'yoh', group: 'y-row', exampleWord: 'よる (yoru)', exampleMeaning: 'Night' },
      { id: 'hiragana-ra', character: 'ら', romaji: 'ra', pronunciation: 'rah (light flap)', group: 'r-row', exampleWord: 'らいねん (rainen)', exampleMeaning: 'Next year' },
      { id: 'hiragana-ri', character: 'り', romaji: 'ri', pronunciation: 'ree', group: 'r-row', exampleWord: 'りんご (ringo)', exampleMeaning: 'Apple' },
      { id: 'hiragana-ru', character: 'る', romaji: 'ru', pronunciation: 'roo', group: 'r-row', exampleWord: 'るす (rusu)', exampleMeaning: 'Absence' },
      { id: 'hiragana-re', character: 'れ', romaji: 're', pronunciation: 'reh', group: 'r-row', exampleWord: 'れきし (rekishi)', exampleMeaning: 'History' },
      { id: 'hiragana-ro', character: 'ろ', romaji: 'ro', pronunciation: 'roh', group: 'r-row', exampleWord: 'ろく (roku)', exampleMeaning: 'Six' },
      { id: 'hiragana-wa', character: 'わ', romaji: 'wa', pronunciation: 'wah', group: 'w-row', exampleWord: 'わたし (watashi)', exampleMeaning: 'I / Me' },
      { id: 'hiragana-wo', character: 'を', romaji: 'wo (o)', pronunciation: 'oh (object particle)', group: 'w-row', exampleWord: 'みずをのむ', exampleMeaning: 'Drink water' },
      { id: 'hiragana-n', character: 'ん', romaji: 'n', pronunciation: 'n / m (nasal)', group: 'n-singular', exampleWord: 'ほん (hon)', exampleMeaning: 'Book' },
    ],
  },
  katakana: {
    deckId: 'katakana',
    name: 'Katakana',
    japaneseTitle: 'カタカナ',
    category: 'Japanese Characters',
    description: 'Angular phonetic syllabary used for foreign loanwords, scientific terms, and emphasis.',
    cards: [
      { id: 'katakana-a', character: 'ア', romaji: 'a', pronunciation: 'ah (as in father)', group: 'vowels', exampleWord: 'アイス (aisu)', exampleMeaning: 'Ice cream' },
      { id: 'katakana-i', character: 'イ', romaji: 'i', pronunciation: 'ee (as in feet)', group: 'vowels', exampleWord: 'インド (indo)', exampleMeaning: 'India' },
      { id: 'katakana-u', character: 'ウ', romaji: 'u', pronunciation: 'oo (as in food)', group: 'vowels', exampleWord: 'ウール (ūru)', exampleMeaning: 'Wool' },
      { id: 'katakana-e', character: 'エ', romaji: 'e', pronunciation: 'eh (as in pet)', group: 'vowels', exampleWord: 'エアコン (eakon)', exampleMeaning: 'Air conditioner' },
      { id: 'katakana-o', character: 'オ', romaji: 'o', pronunciation: 'oh (as in go)', group: 'vowels', exampleWord: 'オレンジ (orenji)', exampleMeaning: 'Orange' },
      { id: 'katakana-ka', character: 'カ', romaji: 'ka', pronunciation: 'kah', group: 'k-row', exampleWord: 'カメラ (kamera)', exampleMeaning: 'Camera' },
      { id: 'katakana-ki', character: 'キ', romaji: 'ki', pronunciation: 'kee', group: 'k-row', exampleWord: 'キロ (kiro)', exampleMeaning: 'Kilogram' },
      { id: 'katakana-ku', character: 'ク', romaji: 'ku', pronunciation: 'koo', group: 'k-row', exampleWord: 'クラス (kurasu)', exampleMeaning: 'Class' },
      { id: 'katakana-ke', character: 'ケ', romaji: 'ke', pronunciation: 'keh', group: 'k-row', exampleWord: 'ケーキ (kēki)', exampleMeaning: 'Cake' },
      { id: 'katakana-ko', character: 'コ', romaji: 'ko', pronunciation: 'koh', group: 'k-row', exampleWord: 'コーヒー (kōhī)', exampleMeaning: 'Coffee' },
      { id: 'katakana-sa', character: 'サ', romaji: 'sa', pronunciation: 'sah', group: 's-row', exampleWord: 'サラダ (sarada)', exampleMeaning: 'Salad' },
      { id: 'katakana-shi', character: 'シ', romaji: 'shi', pronunciation: 'shee', group: 's-row', exampleWord: 'シャツ (shatsu)', exampleMeaning: 'Shirt' },
      { id: 'katakana-su', character: 'ス', romaji: 'su', pronunciation: 'soo', group: 's-row', exampleWord: 'スポーツ (supōtsu)', exampleMeaning: 'Sports' },
      { id: 'katakana-se', character: 'セ', romaji: 'se', pronunciation: 'seh', group: 's-row', exampleWord: 'セーター (sētā)', exampleMeaning: 'Sweater' },
      { id: 'katakana-so', character: 'ソ', romaji: 'so', pronunciation: 'soh', group: 's-row', exampleWord: 'ソファ (sofa)', exampleMeaning: 'Sofa' },
      { id: 'katakana-ta', character: 'タ', romaji: 'ta', pronunciation: 'tah', group: 't-row', exampleWord: 'タクシー (takushī)', exampleMeaning: 'Taxi' },
      { id: 'katakana-chi', character: 'チ', romaji: 'chi', pronunciation: 'chee', group: 't-row', exampleWord: 'チーズ (chīzu)', exampleMeaning: 'Cheese' },
      { id: 'katakana-tsu', character: 'ツ', romaji: 'tsu', pronunciation: 'tsoo', group: 't-row', exampleWord: 'ツアー (tsuā)', exampleMeaning: 'Tour' },
      { id: 'katakana-te', character: 'テ', romaji: 'te', pronunciation: 'teh', group: 't-row', exampleWord: 'テレビ (terebi)', exampleMeaning: 'Television' },
      { id: 'katakana-to', character: 'ト', romaji: 'to', pronunciation: 'toh', group: 't-row', exampleWord: 'トマト (tomato)', exampleMeaning: 'Tomato' },
      { id: 'katakana-na', character: 'ナ', romaji: 'na', pronunciation: 'nah', group: 'n-row', exampleWord: 'ナイフ (naifu)', exampleMeaning: 'Knife' },
      { id: 'katakana-ni', character: 'ニ', romaji: 'ni', pronunciation: 'nee', group: 'n-row', exampleWord: 'ニュース (nyūsu)', exampleMeaning: 'News' },
      { id: 'katakana-nu', character: 'ヌ', romaji: 'nu', pronunciation: 'noo', group: 'n-row', exampleWord: 'ヌードル (nūdoru)', exampleMeaning: 'Noodle' },
      { id: 'katakana-ne', character: 'ネ', romaji: 'ne', pronunciation: 'neh', group: 'n-row', exampleWord: 'ネクタイ (nekutai)', exampleMeaning: 'Necktie' },
      { id: 'katakana-no', character: 'ノ', romaji: 'no', pronunciation: 'noh', group: 'n-row', exampleWord: 'ノート (nōto)', exampleMeaning: 'Notebook' },
      { id: 'katakana-ha', character: 'ハ', romaji: 'ha', pronunciation: 'hah', group: 'h-row', exampleWord: 'ハンバーガー', exampleMeaning: 'Hamburger' },
      { id: 'katakana-hi', character: 'ヒ', romaji: 'hi', pronunciation: 'hee', group: 'h-row', exampleWord: 'ヒーター (hītā)', exampleMeaning: 'Heater' },
      { id: 'katakana-fu', character: 'フ', romaji: 'fu', pronunciation: 'foo', group: 'h-row', exampleWord: 'フォーク (fōku)', exampleMeaning: 'Fork' },
      { id: 'katakana-he', character: 'ヘ', romaji: 'he', pronunciation: 'heh', group: 'h-row', exampleWord: 'ヘルメット', exampleMeaning: 'Helmet' },
      { id: 'katakana-ho', character: 'ホ', romaji: 'ho', pronunciation: 'hoh', group: 'h-row', exampleWord: 'ホテル (hoteru)', exampleMeaning: 'Hotel' },
      { id: 'katakana-ma', character: 'マ', romaji: 'ma', pronunciation: 'mah', group: 'm-row', exampleWord: 'マップ (mappu)', exampleMeaning: 'Map' },
      { id: 'katakana-mi', character: 'ミ', romaji: 'mi', pronunciation: 'mee', group: 'm-row', exampleWord: 'ミルク (miruku)', exampleMeaning: 'Milk' },
      { id: 'katakana-mu', character: 'ム', romaji: 'mu', pronunciation: 'moo', group: 'm-row', exampleWord: 'ムード (mūdo)', exampleMeaning: 'Mood' },
      { id: 'katakana-me', character: 'メ', romaji: 'me', pronunciation: 'meh', group: 'm-row', exampleWord: 'メニュー (menyū)', exampleMeaning: 'Menu' },
      { id: 'katakana-mo', character: 'モ', romaji: 'mo', pronunciation: 'moh', group: 'm-row', exampleWord: 'モデル (moderu)', exampleMeaning: 'Model' },
      { id: 'katakana-ya', character: 'ヤ', romaji: 'ya', pronunciation: 'yah', group: 'y-row', exampleWord: 'ヤード (yādo)', exampleMeaning: 'Yard' },
      { id: 'katakana-yu', character: 'ユ', romaji: 'yu', pronunciation: 'yoo', group: 'y-row', exampleWord: 'ユニーク (yunīku)', exampleMeaning: 'Unique' },
      { id: 'katakana-yo', character: 'ヨ', romaji: 'yo', pronunciation: 'yoh', group: 'y-row', exampleWord: 'ヨーロッパ', exampleMeaning: 'Europe' },
      { id: 'katakana-ra', character: 'ラ', romaji: 'ra', pronunciation: 'rah', group: 'r-row', exampleWord: 'ラジオ (rajio)', exampleMeaning: 'Radio' },
      { id: 'katakana-ri', character: 'リ', romaji: 'ri', pronunciation: 'ree', group: 'r-row', exampleWord: 'リズム (rizumu)', exampleMeaning: 'Rhythm' },
      { id: 'katakana-ru', character: 'ル', romaji: 'ru', pronunciation: 'roo', group: 'r-row', exampleWord: 'ルール (rūru)', exampleMeaning: 'Rule' },
      { id: 'katakana-re', character: 'レ', romaji: 're', pronunciation: 'reh', group: 'r-row', exampleWord: 'レモン (remon)', exampleMeaning: 'Lemon' },
      { id: 'katakana-ro', character: 'ロ', romaji: 'ro', pronunciation: 'roh', group: 'r-row', exampleWord: 'ロボット (robotto)', exampleMeaning: 'Robot' },
      { id: 'katakana-wa', character: 'ワ', romaji: 'wa', pronunciation: 'wah', group: 'w-row', exampleWord: 'ワイン (wain)', exampleMeaning: 'Wine' },
      { id: 'katakana-wo', character: 'ヲ', romaji: 'wo (o)', pronunciation: 'oh (rare)', group: 'w-row', exampleWord: 'ヲタク (wotaku)', exampleMeaning: 'Otaku (stylized)' },
      { id: 'katakana-n', character: 'ン', romaji: 'n', pronunciation: 'n / m (nasal)', group: 'n-singular', exampleWord: 'パン (pan)', exampleMeaning: 'Bread' },
    ],
  },
};

export const ALL_CARDS: Flashcard[] = [
  ...DECKS_DATA.hiragana.cards,
  ...DECKS_DATA.katakana.cards,
];

// ============================================================================
// 2. FISHER-YATES SHUFFLE & AUDIO UTILITIES
// ============================================================================

function fisherYatesShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function speakJapanese(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// ============================================================================
// 3. SUPABASE CLIENT INITIALIZATION (.env + optional local override)
// ============================================================================

const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================

type NavRoute = 'dashboard' | 'hiragana' | 'katakana' | 'practice' | 'memorized' | 'settings';
type SyncState = 'guest' | 'syncing' | 'synced' | 'error';

export default function App() {
  // Navigation & Theme
  const [activeRoute, setActiveRoute] = useState<NavRoute>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('kanaflow_theme') === 'dark';
  });

  // Supabase Credentials & Auth State
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => localStorage.getItem('kanaflow_sb_url') || ENV_SUPABASE_URL);
  const [supabaseKey, setSupabaseKey] = useState<string>(() => localStorage.getItem('kanaflow_sb_key') || ENV_SUPABASE_ANON_KEY);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('guest');
  const [syncError, setSyncError] = useState<string | null>(null);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // User Learning Progress Map: cardId -> CardProgress
  const [progressMap, setProgressMap] = useState<Record<string, CardProgress>>(() => {
    try {
      const saved = localStorage.getItem('kanaflow_guest_progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Study Session State
  const [sessionDeckCards, setSessionDeckCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [collectionDeckFilter, setCollectionDeckFilter] = useState<'all' | 'hiragana' | 'katakana'>('all');

  // Create Supabase client when credentials exist
  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseKey) return null;
    try {
      return createClient(supabaseUrl, supabaseKey);
    } catch {
      return null;
    }
  }, [supabaseUrl, supabaseKey]);

  // Apply Dark Mode Class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('kanaflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('kanaflow_theme', 'light');
    }
  }, [darkMode]);

  // Persist Guest Progress locally when not signed in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('kanaflow_guest_progress', JSON.stringify(progressMap));
    }
  }, [progressMap, user]);

  // Load Cloud Progress from Supabase
  const fetchCloudProgress = useCallback(async (userId: string) => {
    if (!supabase) return;
    setSyncState('syncing');
    setSyncError(null);
    const { data, error } = await supabase
      .from('user_card_progress')
      .select('card_id, status, review_count, last_reviewed_at')
      .eq('user_id', userId);

    if (error) {
      setSyncState('error');
      setSyncError(error.message);
      return;
    }

    const cloudMap: Record<string, CardProgress> = {};
    (data || []).forEach((row: any) => {
      cloudMap[row.card_id] = {
        cardId: row.card_id,
        status: row.status as CardStatus,
        reviewCount: row.review_count || 1,
        lastReviewedAt: row.last_reviewed_at,
      };
    });
    setProgressMap(cloudMap);
    setSyncState('synced');
  }, [supabase]);

  // Listen to Supabase Auth Session Changes
  useEffect(() => {
    if (!supabase) {
      setUser(null);
      setSyncState('guest');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchCloudProgress(session.user.id);
      } else {
        setUser(null);
        setSyncState('guest');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchCloudProgress(session.user.id);
      } else {
        setUser(null);
        setSyncState('guest');
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchCloudProgress]);

  // Update a Card's Status (Know / Don't Know / Reset) & Sync to Cloud
  const updateCardStatus = useCallback(async (cardId: string, newStatus: CardStatus) => {
    const now = new Date().toISOString();
    const existing = progressMap[cardId];
    const nextCount = (existing?.reviewCount || 0) + 1;

    setProgressMap((prev) => {
      const updated = { ...prev };
      if (newStatus === 'new') {
        delete updated[cardId];
      } else {
        updated[cardId] = {
          cardId,
          status: newStatus,
          reviewCount: nextCount,
          lastReviewedAt: now,
        };
      }
      return updated;
    });

    if (user && supabase) {
      setSyncState('syncing');
      if (newStatus === 'new') {
        const { error } = await supabase
          .from('user_card_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('card_id', cardId);
        if (error) {
          setSyncState('error');
          setSyncError(error.message);
        } else {
          setSyncState('synced');
        }
      } else {
        const { error } = await supabase
          .from('user_card_progress')
          .upsert(
            {
              user_id: user.id,
              card_id: cardId,
              status: newStatus,
              review_count: nextCount,
              last_reviewed_at: now,
              updated_at: now,
            },
            { onConflict: 'user_id,card_id' }
          );
        if (error) {
          setSyncState('error');
          setSyncError(error.message);
        } else {
          setSyncState('synced');
        }
      }
    }
  }, [progressMap, user, supabase]);

  // Build Active Study Queue whenever Route / Group / Collection changes
  const buildStudyDeck = useCallback((route: NavRoute, group: string, deckFilter: 'all' | 'hiragana' | 'katakana', shuffle: boolean) => {
    let baseCards: Flashcard[] = [];

    if (route === 'hiragana') {
      baseCards = DECKS_DATA.hiragana.cards;
      if (group !== 'all') baseCards = baseCards.filter((c) => c.group === group);
    } else if (route === 'katakana') {
      baseCards = DECKS_DATA.katakana.cards;
      if (group !== 'all') baseCards = baseCards.filter((c) => c.group === group);
    } else if (route === 'practice') {
      const pool = deckFilter === 'all' ? ALL_CARDS : DECKS_DATA[deckFilter].cards;
      baseCards = pool.filter((c) => progressMap[c.id]?.status === 'practice');
    } else if (route === 'memorized') {
      const pool = deckFilter === 'all' ? ALL_CARDS : DECKS_DATA[deckFilter].cards;
      baseCards = pool.filter((c) => progressMap[c.id]?.status === 'memorized');
    }

    const ordered = shuffle ? fisherYatesShuffle(baseCards) : baseCards;
    setSessionDeckCards(ordered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [progressMap]);

  // Trigger session rebuild on route/filter switch
  useEffect(() => {
    if (['hiragana', 'katakana', 'practice', 'memorized'].includes(activeRoute)) {
      buildStudyDeck(activeRoute, selectedGroup, collectionDeckFilter, false);
      setIsShuffled(false);
    }
  }, [activeRoute, selectedGroup, collectionDeckFilter]);

  // Keep session cards synchronized if a card is removed from Practice/Memorized mid-session
  const activeCard = sessionDeckCards[currentIndex] || null;

  const handleShuffleSession = () => {
    const nextShuffled = !isShuffled;
    setIsShuffled(nextShuffled);
    buildStudyDeck(activeRoute, selectedGroup, collectionDeckFilter, nextShuffled);
  };

  const handleRestartSession = () => {
    buildStudyDeck(activeRoute, selectedGroup, collectionDeckFilter, isShuffled);
  };

  const handleMarkKnow = useCallback(() => {
    if (!activeCard) return;
    updateCardStatus(activeCard.id, 'memorized');
    setIsFlipped(false);

    if (activeRoute === 'practice') {
      // Remove card from current practice queue immediately
      const remaining = sessionDeckCards.filter((c) => c.id !== activeCard.id);
      setSessionDeckCards(remaining);
      setCurrentIndex((prev) => (prev >= remaining.length ? 0 : prev));
    } else if (currentIndex < sessionDeckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [activeCard, activeRoute, currentIndex, sessionDeckCards, updateCardStatus]);

  const handleMarkDontKnow = useCallback(() => {
    if (!activeCard) return;
    updateCardStatus(activeCard.id, 'practice');
    setIsFlipped(false);

    if (activeRoute === 'memorized') {
      const remaining = sessionDeckCards.filter((c) => c.id !== activeCard.id);
      setSessionDeckCards(remaining);
      setCurrentIndex((prev) => (prev >= remaining.length ? 0 : prev));
    } else if (currentIndex < sessionDeckCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [activeCard, activeRoute, currentIndex, sessionDeckCards, updateCardStatus]);

  const handlePrevCard = useCallback(() => {
    if (sessionDeckCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : sessionDeckCards.length - 1));
  }, [sessionDeckCards.length]);

  const handleNextCard = useCallback(() => {
    if (sessionDeckCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < sessionDeckCards.length - 1 ? prev + 1 : 0));
  }, [sessionDeckCards.length]);

  // Keyboard Shortcuts (Ignore when typing in inputs)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!['hiragana', 'katakana', 'practice', 'memorized'].includes(activeRoute)) return;
      if (!activeCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleMarkKnow();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleMarkDontKnow();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeRoute, activeCard, handleNextCard, handlePrevCard, handleMarkKnow, handleMarkDontKnow]);

  // Dashboard Metrics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    let memorized = 0;
    let practice = 0;
    let reviewedToday = 0;

    ALL_CARDS.forEach((c) => {
      const p = progressMap[c.id];
      if (p?.status === 'memorized') memorized++;
      if (p?.status === 'practice') practice++;
      if (p?.lastReviewedAt?.startsWith(todayStr)) reviewedToday++;
    });

    const total = ALL_CARDS.length;
    const unreviewed = total - memorized - practice;
    const percentage = total > 0 ? Math.round((memorized / total) * 100) : 0;

    const getDeckStats = (deckId: 'hiragana' | 'katakana') => {
      const cards = DECKS_DATA[deckId].cards;
      const m = cards.filter((c) => progressMap[c.id]?.status === 'memorized').length;
      const p = cards.filter((c) => progressMap[c.id]?.status === 'practice').length;
      return {
        total: cards.length,
        memorized: m,
        practice: p,
        unreviewed: cards.length - m - p,
        pct: Math.round((m / cards.length) * 100),
      };
    };

    return {
      total,
      memorized,
      practice,
      unreviewed,
      percentage,
      reviewedToday,
      hiragana: getDeckStats('hiragana'),
      katakana: getDeckStats('katakana'),
    };
  }, [progressMap]);

  // Authentication Form Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthMessage({ type: 'error', text: 'Configure your Supabase URL & Anon Key in Settings first.' });
      return;
    }
    setAuthLoading(true);
    setAuthMessage(null);

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
        setAuthModalOpen(false);
      } else if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        setAuthMessage({ type: 'success', text: 'Account created! You are now signed in and syncing to the cloud.' });
      } else if (authMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setAuthMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Authentication failed.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSyncState('guest');
  };

  const navItems: { id: NavRoute; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'hiragana', label: 'Hiragana', icon: <span className="font-bold text-base w-5 text-center">あ</span> },
    { id: 'katakana', label: 'Katakana', icon: <span className="font-bold text-base w-5 text-center">ア</span> },
    { id: 'practice', label: 'Practice', icon: <RotateCcw className="w-5 h-5" />, badge: stats.practice },
    { id: 'memorized', label: 'Memorized', icon: <CheckCircle2 className="w-5 h-5" />, badge: stats.memorized },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const rowGroups = [
    { id: 'all', label: 'All Rows' },
    { id: 'vowels', label: 'A-Row (Vowels)' },
    { id: 'k-row', label: 'K-Row' },
    { id: 's-row', label: 'S-Row' },
    { id: 't-row', label: 'T-Row' },
    { id: 'n-row', label: 'N-Row' },
    { id: 'h-row', label: 'H-Row' },
    { id: 'm-row', label: 'M-Row' },
    { id: 'y-row', label: 'Y-Row' },
    { id: 'r-row', label: 'R-Row' },
    { id: 'w-row', label: 'W-Row & N' },
  ];

  return (
    <div
      style={{ fontFamily: "'Inter', 'Noto Sans JP', sans-serif" }}
      className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col md:flex-row transition-colors"
    >
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
            仮
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">KanaFlow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Japanese Mastery</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedGroup('all');
                  setActiveRoute(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      item.id === 'practice'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Cloud Sync & Account Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs px-2">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              {syncState === 'synced' && <Cloud className="w-4 h-4 text-emerald-500" />}
              {syncState === 'syncing' && <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin" />}
              {syncState === 'error' && <CloudOff className="w-4 h-4 text-rose-500" />}
              {syncState === 'guest' && <CloudOff className="w-4 h-4 text-slate-400" />}
              {syncState === 'synced' && 'Cloud Synced'}
              {syncState === 'syncing' && 'Syncing...'}
              {syncState === 'error' && 'Sync Error'}
              {syncState === 'guest' && 'Guest Mode (Local)'}
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {user ? (
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 px-3 py-2 rounded-xl">
              <div className="truncate pr-2">
                <p className="text-xs font-medium truncate">{user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="text-slate-500 hover:text-rose-600 p-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setAuthMessage(null);
                setAuthModalOpen(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <User className="w-4 h-4" />
              Sign In / Cloud Sync
            </button>
          )}
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
            仮
          </div>
          <span className="font-bold text-base">KanaFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
            {syncState === 'synced' ? (
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <CloudOff className="w-3.5 h-3.5 text-slate-400" />
            )}
            {user ? 'Synced' : 'Guest'}
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {!user && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:pl-64 pb-24 md:pb-10">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
          {/* ============================================================== */}
          {/* VIEW 1: DASHBOARD                                              */}
          {/* ============================================================== */}
          {activeRoute === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Learning Dashboard</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Track your Hiragana and Katakana mastery across all devices.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-xs">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium">
                    Reviewed Today: <strong>{stats.reviewedToday}</strong> characters
                  </span>
                </div>
              </div>

              {/* Overall Progress Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Overall Character Mastery
                  </span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {stats.percentage}%
                  </span>
                </div>
                <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>

                {/* 4 Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Characters</p>
                    <p className="text-2xl font-bold mt-1">{stats.total}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Memorized</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                      {stats.memorized}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Needs Practice</p>
                    <p className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                      {stats.practice}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unreviewed</p>
                    <p className="text-2xl font-bold mt-1">{stats.unreviewed}</p>
                  </div>
                </div>
              </div>

              {/* Deck Quick Launch Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['hiragana', 'katakana'] as const).map((deckKey) => {
                  const deck = DECKS_DATA[deckKey];
                  const dStat = stats[deckKey];
                  return (
                    <div
                      key={deckKey}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            {deck.category}
                          </span>
                          <span className="text-2xl font-bold text-slate-300 dark:text-slate-700">
                            {deck.japaneseTitle}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mt-1">{deck.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{deck.description}</p>

                        <div className="mt-5">
                          <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span>
                              {dStat.memorized} / {dStat.total} Memorized
                            </span>
                            <span>{dStat.pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${dStat.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setActiveRoute(deckKey)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                        >
                          Study {deck.name}
                        </button>
                        {dStat.practice > 0 && (
                          <button
                            onClick={() => {
                              setCollectionDeckFilter(deckKey);
                              setActiveRoute('practice');
                            }}
                            className="py-2.5 px-4 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 text-sm font-semibold transition-colors"
                          >
                            Practice ({dStat.practice})
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Character Mastery Matrix */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h3 className="font-bold text-base">Character Mastery Overview</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" /> Memorized
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" /> Practice
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 inline-block" /> New
                    </span>
                  </div>
                </div>

                {(['hiragana', 'katakana'] as const).map((deckKey) => (
                  <div key={deckKey} className="mt-4 first:mt-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {DECKS_DATA[deckKey].name}
                    </p>
                    <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1.5">
                      {DECKS_DATA[deckKey].cards.map((card) => {
                        const status = progressMap[card.id]?.status || 'new';
                        const colorClass =
                          status === 'memorized'
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : status === 'practice'
                            ? 'bg-amber-400 text-slate-950 border-amber-500'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

                        return (
                          <button
                            key={card.id}
                            onClick={() => speakJapanese(card.character)}
                            title={`${card.character} (${card.romaji}) — ${status}`}
                            className={`aspect-square rounded-lg border text-sm sm:text-base font-bold flex flex-col items-center justify-center hover:scale-105 transition-transform ${colorClass}`}
                          >
                            <span>{card.character}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 2: FLASHCARD STUDY & COLLECTIONS                          */}
          {/* ============================================================== */}
          {['hiragana', 'katakana', 'practice', 'memorized'].includes(activeRoute) && (
            <div className="space-y-6">
              {/* Top Study Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold capitalize">
                    {activeRoute === 'hiragana' && 'Hiragana (ひらがな)'}
                    {activeRoute === 'katakana' && 'Katakana (カタカナ)'}
                    {activeRoute === 'practice' && 'Practice Collection'}
                    {activeRoute === 'memorized' && 'Memorized Collection'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {activeRoute === 'practice' && 'Review characters marked as Don’t Know until you master them.'}
                    {activeRoute === 'memorized' && 'Review characters you have already memorized.'}
                    {(activeRoute === 'hiragana' || activeRoute === 'katakana') &&
                      'Click card or press Space to flip. Use K for Know, D for Don’t Know.'}
                  </p>
                </div>

                {/* Shuffle & Reset Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* {(activeRoute === 'hiragana' || activeRoute === 'katakana') && (
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                    >
                      {rowGroups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  )} */}

                  {(activeRoute === 'practice' || activeRoute === 'memorized') && (
                    <select
                      value={collectionDeckFilter}
                      onChange={(e) => setCollectionDeckFilter(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium"
                    >
                      <option value="all">All Decks</option>
                      <option value="hiragana">Hiragana Only</option>
                      <option value="katakana">Katakana Only</option>
                    </select>
                  )}

                  <button
                    onClick={handleShuffleSession}
                    className={`px-3.5 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors ${
                      isShuffled
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                    {isShuffled ? 'Shuffled' : 'Shuffle All'}
                  </button>

                  <button
                    onClick={handleRestartSession}
                    title="Restart session from card 1"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* EMPTY STATE (e.g., Practice or Memorized is empty) */}
              {sessionDeckCards.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center max-w-lg mx-auto my-8 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold">
                    {activeRoute === 'practice'
                      ? 'Your Practice Deck is Empty!'
                      : 'No Memorized Characters Yet'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {activeRoute === 'practice'
                      ? 'Great job! Any character you mark as "Don’t Know" while studying Hiragana or Katakana will appear here for focused review.'
                      : 'Start studying Hiragana or Katakana and click "Know" on characters you recognize to build your memorized list.'}
                  </p>
                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      onClick={() => setActiveRoute('hiragana')}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                    >
                      Study Hiragana
                    </button>
                    <button
                      onClick={() => setActiveRoute('katakana')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-sm font-semibold"
                    >
                      Study Katakana
                    </button>
                  </div>
                </div>
              ) : (
                /* ACTIVE FLASHCARD STAGE */
                activeCard && (
                  <div className="max-w-xl mx-auto space-y-5">
                    {/* Session Progress Bar & Counter */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>
                          Card {currentIndex + 1} of {sessionDeckCards.length}
                        </span>
                        <span className="uppercase tracking-wider">
                          Status:{' '}
                          <strong
                            className={
                              progressMap[activeCard.id]?.status === 'memorized'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : progressMap[activeCard.id]?.status === 'practice'
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-500'
                            }
                          >
                            {progressMap[activeCard.id]?.status || 'New'}
                          </strong>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{
                            width: `${((currentIndex + 1) / sessionDeckCards.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* FLIPPABLE FLASHCARD */}
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      role="button"
                      tabIndex={0}
                      aria-label="Flashcard - click to flip"
                      className="cursor-pointer select-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md hover:shadow-lg transition-all min-h-[340px] sm:min-h-[380px] p-8 flex flex-col justify-between relative"
                    >
                      {/* Top Card Controls (Audio) */}
                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakJapanese(activeCard.character);
                          }}
                          aria-label="Listen to Japanese pronunciation"
                          className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Card Center Content */}
                      {!isFlipped ? (
                        <div className="my-auto text-center py-6">
                          <div className="text-8xl sm:text-9xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {activeCard.character}
                          </div>
                          <p className="text-xs text-slate-400 mt-8">
                            Tap card or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Space</kbd> to reveal
                          </p>
                        </div>
                      ) : (
                        <div className="my-auto text-center py-4 space-y-4">
                          <div className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                            {activeCard.character}
                          </div>
                          <div className="text-5xl sm:text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
                            {activeCard.romaji}
                          </div>
                          <p className="text-base font-medium text-slate-600 dark:text-slate-300">
                            Pronunciation: {activeCard.pronunciation}
                          </p>
                          {activeCard.exampleWord && (
                            <div className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-sm">
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {activeCard.exampleWord}
                              </span>{' '}
                              — <span className="text-slate-500 dark:text-slate-400">{activeCard.exampleMeaning}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Hint */}
                      <div className="text-center text-xs text-slate-400">
                        {isFlipped ? 'Mark below to record progress' : 'Front'}
                      </div>
                    </div>

                    {/* KNOW / DON'T KNOW LEARNING ACTIONS */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={handleMarkDontKnow}
                        className="py-3.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-[0.99] text-amber-900 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 font-bold text-base flex items-center justify-center gap-2 transition-all"
                      >
                        <X className="w-5 h-5" />
                        Don’t Know
                      </button>

                      <button
                        onClick={handleMarkKnow}
                        className="py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Check className="w-5 h-5" />
                        Know
                      </button>
                    </div>

                    {/* PREV / NEXT NAVIGATION */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={handlePrevCard}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>

                      {progressMap[activeCard.id] && (
                        <button
                          onClick={() => updateCardStatus(activeCard.id, 'new')}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                        >
                          Reset card status
                        </button>
                      )}

                      <button
                        onClick={handleNextCard}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* VIEW 3: SETTINGS & CLOUD CONFIGURATION                         */}
          {/* ============================================================== */}
          {activeRoute === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Settings & Cloud Sync</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage your Supabase cloud connection, appearance, and local data.
                </p>
              </div>

              {/* Appearance */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base">Appearance</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Switch between light and dark study themes.
                  </p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-medium text-sm flex items-center gap-2"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Supabase Credentials Override */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-base">Supabase Cloud Connection</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Automatically loaded from <code>.env</code> on Netlify, or paste your credentials below to test immediately.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://your-project-id.supabase.co"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                      Supabase Anon / Publishable Key
                    </label>
                    <input
                      type="password"
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      placeholder="sb_publishable_... or eyJ..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        localStorage.setItem('kanaflow_sb_url', supabaseUrl.trim());
                        localStorage.setItem('kanaflow_sb_key', supabaseKey.trim());
                        alert('Supabase credentials saved!');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                    >
                      Save Connection
                    </button>
                    {syncError && <span className="text-xs text-rose-500">{syncError}</span>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around py-2 z-20">
        {navItems.map((item) => {
          const active = activeRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedGroup('all');
                setActiveRoute(item.id);
              }}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
                active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* AUTHENTICATION MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {authMode === 'login' && 'Sign In to Cloud Sync'}
                {authMode === 'signup' && 'Create Free Account'}
                {authMode === 'reset' && 'Reset Password'}
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>

              {authMode !== 'reset' && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"
                  />
                </div>
              )}

              {authMessage && (
                <p
                  className={`text-xs p-3 rounded-xl ${
                    authMessage.type === 'error'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {authMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-50"
              >
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login'
                  ? 'Sign In'
                  : authMode === 'signup'
                  ? 'Create Account'
                  : 'Send Reset Link'}
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              {authMode === 'login' ? (
                <>
                  <button onClick={() => setAuthMode('signup')} className="hover:underline text-indigo-600">
                    Need an account? Sign up
                  </button>
                  <button onClick={() => setAuthMode('reset')} className="hover:underline">
                    Forgot password?
                  </button>
                </>
              ) : (
                <button onClick={() => setAuthMode('login')} className="hover:underline text-indigo-600">
                  Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}