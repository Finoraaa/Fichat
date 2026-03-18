import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreVertical, MessageSquare, ArrowLeft, Send, UserPlus, Check, CheckCheck, LogOut, User, X, Camera, Paperclip, Loader2, Instagram, Github, Globe, Settings, Volume2, Trash2, Pencil, Mic, Square, Play, Pause, Bell, UserCheck, UserX, Users, UserMinus, ShieldAlert, Eye, VolumeX, Eraser, MoreHorizontal, Info, AlertCircle, Image as ImageIcon, FileText as FileIcon, ExternalLink, ChevronRight, Download, Link as LinkIcon, ChevronDown, CornerUpLeft } from 'lucide-react';
import { supabase } from './lib/supabase';
import { BetaBanner } from './components/BetaBanner';
import { ReportModal } from './components/ReportModal';

const SOUND_OPTIONS = [
  { id: 'default', name: 'Varsayılan (Modern)', url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
  { id: 'pop', name: 'Pop', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
  { id: 'bell', name: 'Zil', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'chime', name: 'Çan', url: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3' },
  { id: 'digital', name: 'Dijital', url: 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3' },
];

// --- VOICE MESSAGE COMPONENT ---
function VoiceMessage({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Pseudo-random but deterministic waveform data
  const waveformData = useRef(Array.from({ length: 25 }, () => Math.random() * 100));

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [url]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 bg-zinc-900/40 p-2.5 rounded-2xl min-w-[240px] border border-white/5 backdrop-blur-sm shadow-inner group/voice">
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0070F3] to-blue-600 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0 shadow-lg shadow-blue-500/20"
      >
        {isPlaying ? <Pause size={18} fill="white" className="text-white" /> : <Play size={18} fill="white" className="ml-0.5 text-white" />}
      </button>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-[2px] h-8 relative cursor-pointer group/wave" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const pct = x / rect.width;
          if (audioRef.current && duration) {
            audioRef.current.currentTime = pct * duration;
            setProgress(pct * 100);
          }
        }}>
          {waveformData.current.map((height, i) => {
            const barProgress = (i / waveformData.current.length) * 100;
            const isActive = progress > barProgress;
            return (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[#0070F3] shadow-[0_0_8px_rgba(0,112,243,0.5)]' : 'bg-zinc-700'}`}
                style={{ 
                  height: `${20 + height * 0.6}%`,
                  opacity: isActive ? 1 : 0.4
                }}
              />
            );
          })}
        </div>
        
        <div className="flex justify-between mt-1 text-[10px] font-medium tracking-tight">
          <span className="text-blue-400/80">{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span className="text-zinc-500">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// --- LANDING COMPONENT ---
function Landing({ onStart, session }: { onStart: () => void, session: any }) {
  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-[calc(2.5rem+env(safe-area-inset-top))] md:top-10 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#0070F3] to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <MessageSquare size={20} className="text-white md:hidden" />
              <MessageSquare size={22} className="text-white hidden md:block" />
            </div>
            <span className="text-lg md:text-xl font-bold tracking-tight">Finora</span>
          </div>
          <button 
            onClick={onStart}
            className="px-5 md:px-6 py-2 md:py-2.5 bg-white text-black text-xs md:text-sm font-bold rounded-full hover:bg-zinc-200 transition-all active:scale-95"
          >
            {session ? 'Mesajlara Git' : 'Giriş Yap'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-24 sm:pt-32 pb-12 sm:pb-20 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full" />
        
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Yeni Nesil Mesajlaşma</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-6 md:mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-[1.2] md:leading-[1.1]">
            Mesajlaşmanın <br className="hidden sm:block" /> En Saf Hali.
          </h1>
          
          <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto mb-10 md:mb-12 leading-relaxed">
            Finora, hız ve güvenliği minimalist bir tasarımla buluşturuyor. 
            Karmaşadan uzak, sadece iletişime odaklanan premium bir deneyim.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto px-10 py-5 bg-[#0070F3] text-white font-bold rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 group"
            >
              Mesajlaşmaya Başla
              <Send size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all border border-white/10 active:scale-95"
            >
              Özellikleri Keşfet
            </a>
          </div>
        </div>

        {/* App Preview Mockup */}
        <div className="max-w-5xl mx-auto mt-24 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[32px] blur opacity-20" />
          <div className="relative bg-zinc-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl aspect-[16/10] md:aspect-[16/9]">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent" />
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/20" />
              </div>
            </div>
            <div className="flex h-full">
              <div className="w-1/3 border-r border-white/5 p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3 items-center opacity-40">
                    <div className="w-10 h-10 rounded-full bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-20 bg-zinc-800 rounded" />
                      <div className="h-2 w-12 bg-zinc-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-8 flex flex-col justify-end gap-4">
                <div className="w-2/3 h-12 bg-blue-500/10 rounded-2xl self-start" />
                <div className="w-1/2 h-12 bg-white/5 rounded-2xl self-end" />
                <div className="w-3/4 h-12 bg-blue-500/20 rounded-2xl self-start" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <CheckCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Uçtan Uca Şifreleme</h3>
              <p className="text-zinc-400 leading-relaxed">Mesajlarınız sadece sizin ve alıcının arasındadır. Güvenlik bizim için bir seçenek değil, standarttır.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Zengin Medya</h3>
              <p className="text-zinc-400 leading-relaxed">Fotoğraflarınızı ve videolarınızı en yüksek kalitede paylaşın. Anılarınızı bozmadan iletin.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                <UserPlus size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Kolay Bağlantı</h3>
              <p className="text-zinc-400 leading-relaxed">Arkadaşlarınızı e-posta adresleriyle saniyeler içinde bulun ve hemen sohbete başlayın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 flex flex-col items-center gap-6">
        <div className="flex items-center gap-6">
          <a href="https://www.instagram.com/__finora__/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#E1306C] transition-colors" title="Instagram">
            <Instagram size={24} />
          </a>
          <a href="https://github.com/Finoraaa" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="GitHub">
            <Github size={24} />
          </a>
          <a href="https://finora-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#0070F3] transition-colors" title="Portfolio">
            <Globe size={24} />
          </a>
        </div>
        <p className="text-zinc-500 text-sm">© 2026 Finora. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

// --- AUTH COMPONENT ---
function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            }
          }
        });
        if (error) throw error;
        else alert('Kayıt başarılı! Lütfen giriş yapın.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#050505] font-sans tracking-tight text-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0070F3] to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <MessageSquare size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Finora</h1>
          <p className="text-zinc-400 text-sm mt-2">Premium mesajlaşma deneyimi</p>
          
          <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-2 justify-center">
            <AlertCircle size={14} className="text-blue-400 shrink-0" />
            <p className="text-[11px] text-zinc-400 leading-tight">
              <span className="text-blue-400 font-bold">Fichat Alpha:</span> Bu proje henüz tamamlanmamıştır. Gördüğünüz her şey geliştirme aşamasındadır.
            </p>
          </div>
        </div>
        
        <div className="flex mb-6 md:mb-8 bg-zinc-900/50 p-1 rounded-full border border-zinc-800/50">
          <button 
            className={`flex-1 py-2.5 md:py-2 text-sm font-medium rounded-full transition-all active:scale-95 ${isLogin ? 'bg-[#0070F3] text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Giriş Yap
          </button>
          <button 
            className={`flex-1 py-2.5 md:py-2 text-sm font-medium rounded-full transition-all active:scale-95 ${!isLogin ? 'bg-[#0070F3] text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Kayıt Ol
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Ad Soyad</label>
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all"
                placeholder="Adınız Soyadınız"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">E-posta</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all"
              placeholder="ornek@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Şifre</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3 bg-zinc-900/50 border border-zinc-800 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0070F3] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3.5 rounded-full shadow-xl shadow-blue-500/20 transition-all disabled:opacity-70 mt-4 active:scale-[0.98]"
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- DASHBOARD COMPONENT ---
function Dashboard({ session }: { session: any }) {
  const currentUser = session.user;
  const [profile, setProfile] = useState<any>(null);
  
  // State
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeContact, setActiveContact] = useState<any>(() => {
    const saved = localStorage.getItem(`activeContact_${session.user.id}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [activeEmojiPicker, setActiveEmojiPicker] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Persist active contact
  useEffect(() => {
    if (activeContact) {
      localStorage.setItem(`activeContact_${session.user.id}`, JSON.stringify(activeContact));
    } else {
      localStorage.removeItem(`activeContact_${session.user.id}`);
    }
  }, [activeContact, session.user.id]);
  
  // Presence & Typing State
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});
  const [isTyping, setIsTyping] = useState(false);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Add Contact State
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [notificationSound, setNotificationSound] = useState(() => {
    return localStorage.getItem('finora_notification_sound') || 'default';
  });
  
  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatMediaInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<any | null>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // UI States
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showMediaVault, setShowMediaVault] = useState(false);
  const [vaultTab, setVaultTab] = useState<'media' | 'files' | 'links'>('media');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showSidebarMore, setShowSidebarMore] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null);
  const [activeMessageActionsId, setActiveMessageActionsId] = useState<string | null>(null);

  // Friendship State
  const [friendships, setFriendships] = useState<any[]>([]);

  // Clear reply/actions on contact change
  useEffect(() => {
    setReplyToMessage(null);
    setActiveMessageActionsId(null);
  }, [activeContact?.id]);
  const [showRequests, setShowRequests] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'friends'>('chat');
  const [friendsTab, setFriendsTab] = useState<'myFriends' | 'requests' | 'find'>('myFriends');
  const [requestProfiles, setRequestProfiles] = useState<Record<string, any>>({});

  // Friendship Helpers
  const getFriendshipStatus = (userId: string) => {
    const friendship = friendships.find(f => 
      (f.sender_id === currentUser.id && f.receiver_id === userId) ||
      (f.sender_id === userId && f.receiver_id === currentUser.id)
    );
    if (!friendship) return null;
    return friendship;
  };

  const sendFriendRequest = async (receiverId: string) => {
    const { error } = await supabase
      .from('friendships')
      .insert({ sender_id: currentUser.id, receiver_id: receiverId, status: 'pending' });
    if (error) alert('İstek gönderilemedi: ' + error.message);
  };

  const handleFriendRequest = async (friendshipId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);
    if (error) alert('İşlem başarısız: ' + error.message);
  };

  const isFriend = (userId: string) => {
    const f = getFriendshipStatus(userId);
    return f?.status === 'accepted';
  };

  const removeFriendship = async (userId: string) => {
    const friendship = getFriendshipStatus(userId);
    if (!friendship) return;

    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendship.id);

    if (error) {
      alert('Arkadaş silinemedi: ' + error.message);
    } else {
      // If we were chatting with them, close the chat
      if (activeContact?.id === userId) {
        setActiveContact(null);
      }
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<any>(null);

  // Sound Effect for incoming messages
  const playNotificationSound = (soundId = notificationSound) => {
    try {
      const sound = SOUND_OPTIONS.find(s => s.id === soundId) || SOUND_OPTIONS[0];
      const audio = new Audio(sound.url);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (err) {
      console.error('Audio error:', err);
    }
  };

  // 1. Load Current User Profile
  useEffect(() => {
    const fetchProfile = async () => {
      let { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      
      // Profil yoksa oluştur (Supabase trigger yoksa diye fallback)
      if (!data) {
        const newProfile = {
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Kullanıcı',
          avatar_url: currentUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
          is_online: true,
          last_seen: new Date().toISOString()
        };
        
        const { data: insertedData } = await supabase.from('profiles').insert(newProfile).select().single();
        data = insertedData;
      }

      if (data) {
        setProfile(data);
        setEditFullName(data.full_name || '');
        setEditAvatarUrl(data.avatar_url || '');
        setEditBio(data.bio || '');
        setEditWebsiteUrl(data.website_url || '');
      }
      
      // Set user as online
      await supabase.from('profiles').update({ is_online: true }).eq('id', currentUser.id);
    };
    fetchProfile();

    // Global Presence for Online Status
    const globalChannel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: currentUser.id,
        },
      },
    });

    globalChannel
      .on('presence', { event: 'sync' }, () => {
        setOnlineUsers(globalChannel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await globalChannel.track({ online_at: new Date().toISOString() });
        }
      });

    // Friendship Fetch & Subscription
    const fetchFriendships = async () => {
      const { data } = await supabase
        .from('friendships')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
      if (data) {
        setFriendships(data);
        
        // Fetch profiles for pending requests where I am the receiver
        const pendingRequests = data.filter(f => f.receiver_id === currentUser.id && f.status === 'pending');
        const senderIds = pendingRequests.map(f => f.sender_id);
        
        if (senderIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .in('id', senderIds);
          
          if (profiles) {
            const profileMap: Record<string, any> = {};
            profiles.forEach(p => profileMap[p.id] = p);
            setRequestProfiles(prev => ({ ...prev, ...profileMap }));
          }
        }
      }
    };
    fetchFriendships();

    const friendshipChannel = supabase.channel('friendship-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
        fetchFriendships();
      })
      .subscribe();

    // Set user as online in DB (fallback)
    supabase.from('profiles').update({ is_online: true }).eq('id', currentUser.id).then();

    return () => {
      supabase.removeChannel(globalChannel);
      supabase.removeChannel(friendshipChannel);
      supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', currentUser.id).then();
    };
  }, [currentUser.id]);

  // 2. Load Contacts and Last Messages
  const fetchContacts = async () => {
    try {
      // 1. Get explicit contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('*, contact:profiles!contact_id(*)')
        .eq('user_id', currentUser.id);
      
      // 2. Get people I've messaged or who messaged me (to show conversations even if not in contacts)
      const { data: messageParticipants } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);

      const participantIds = new Set<string>();
      messageParticipants?.forEach(m => {
        if (m.sender_id !== currentUser.id) participantIds.add(m.sender_id);
        if (m.receiver_id !== currentUser.id) participantIds.add(m.receiver_id);
      });

      // 3. Get people I'm friends with (accepted)
      const acceptedFriendships = friendships.filter(f => f.status === 'accepted');
      const friendIds = acceptedFriendships.map(f => f.sender_id === currentUser.id ? f.receiver_id : f.sender_id);

      // 4. Get profiles for those participants and friends
      const allParticipantIds = new Set([...participantIds, ...friendIds]);
      let participantProfiles: any[] = [];
      if (allParticipantIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('id', Array.from(allParticipantIds));
        participantProfiles = profiles || [];
      }

      // Merge unique contacts
      const allContactsMap = new Map();
      
      // Add explicit contacts first
      contactsData?.forEach(d => {
        if (d.contact) allContactsMap.set(d.contact.id, d.contact);
      });
      
      // Add message participants (will overwrite or add new)
      participantProfiles.forEach(p => {
        allContactsMap.set(p.id, p);
      });

      const uniqueContacts = Array.from(allContactsMap.values());
      
      // Fetch last message for each contact
      const contactsWithMessages = await Promise.all(uniqueContacts.map(async (c: any) => {
        const { data: msgData } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${c.id}),and(sender_id.eq.${c.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        let lastMsgText = msgData?.content || '';
        if (!lastMsgText && msgData?.file_url) {
          lastMsgText = msgData.file_type === 'video' ? '🎥 Video' : '📷 Fotoğraf';
        }
          
        return { 
          ...c, 
          lastMessage: lastMsgText, 
          lastMessageTime: msgData?.created_at || c.created_at || new Date(0).toISOString()
        };
      }));

      // Sort by latest message
      contactsWithMessages.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
      setContacts(contactsWithMessages);

      // Update active contact info if it's in the list
      if (activeContactRef.current) {
        const updatedActive = contactsWithMessages.find(c => c.id === activeContactRef.current.id);
        if (updatedActive) {
          setActiveContact(updatedActive);
        }
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentUser.id]);

  const activeContactRef = useRef(activeContact);
  useEffect(() => {
    activeContactRef.current = activeContact;
  }, [activeContact]);

  // Global Real-time Listener for Notifications
  useEffect(() => {
    const channel = supabase.channel('global-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new;
        
        // If the message involves the current user
        if (newMsg.receiver_id === currentUser.id || newMsg.sender_id === currentUser.id) {
          // Update contacts list to show new message
          fetchContacts();

          const currentActive = activeContactRef.current;

          // Play sound for messages from other contacts
          if (newMsg.receiver_id === currentUser.id && (!currentActive || currentActive.id !== newMsg.sender_id)) {
            playNotificationSound();
          }
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const updatedMsg = payload.new;
        setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
        
        if (updatedMsg.receiver_id === currentUser.id || updatedMsg.sender_id === currentUser.id) {
          fetchContacts(); // Update read status in contacts list if needed
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  // 3. Load Messages for Active Contact & Subscribe to Real-time
  useEffect(() => {
    if (!activeContact) return;

    // 1. Veriden Okuma (Persistence)
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setMessages(data);
          
          // Fetch reactions for these messages
          const messageIds = data.map(m => m.id);
          if (messageIds.length > 0) {
            const { data: reactionsData } = await supabase
              .from('message_reactions')
              .select('*')
              .in('message_id', messageIds);
            setReactions(reactionsData || []);
          } else {
            setReactions([]);
          }
        }
      } catch (err) {
        console.error("Mesajlar veya tepkiler yüklenirken hata oluştu:", err);
      }
    };
    fetchMessages();

    // 3. Real-time Bağlantısı
    const roomId = [currentUser.id, activeContact.id].sort().join('-');
    const channel = supabase.channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new;
        if (
          (newMsg.sender_id === activeContact.id && newMsg.receiver_id === currentUser.id) ||
          (newMsg.sender_id === currentUser.id && newMsg.receiver_id === activeContact.id)
        ) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.receiver_id === currentUser.id) {
            playNotificationSound();
          }
        }
        fetchContacts();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const updatedMsg = payload.new;
        setMessages(prev => prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const deletedId = payload.old.id;
        setMessages(prev => prev.filter(msg => msg.id !== deletedId));
        fetchContacts();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'message_reactions',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReactions(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'DELETE') {
          setReactions(prev => prev.filter(r => r.id !== payload.old.id));
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId === activeContact.id) {
          setIsTyping(payload.payload.isTyping);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => { 
      supabase.removeChannel(channel); 
      channelRef.current = null;
      setIsTyping(false);
    };
  }, [activeContact, currentUser.id]);

  // Typing Broadcast Logic
  useEffect(() => {
    if (!activeContact || !channelRef.current) return;

    const sendTypingStatus = (typing: boolean) => {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, isTyping: typing }
      });
    };

    if (newMessage.length > 0) {
      sendTypingStatus(true);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 2000);
    } else {
      sendTypingStatus(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMessage, activeContact, currentUser.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Lütfen sadece resim veya video yükleyin.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Dosya boyutu 50MB\'dan küçük olmalıdır.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      const fileType = file.type.startsWith('image/') ? 'image' : 'video';

      const { error: uploadError } = await supabase.storage
        .from('chat_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_media')
        .getPublicUrl(filePath);

      const msgData: any = {
        sender_id: currentUser.id,
        receiver_id: activeContact.id,
        content: '',
        file_url: publicUrl,
        file_type: fileType
      };

      if (replyToMessage) {
        msgData.content = JSON.stringify({
          reply_to: replyToMessage.id,
          content: ''
        });
      }

      const { error: dbError } = await supabase.from('messages').insert([msgData]);
      if (dbError) throw dbError;
      setReplyToMessage(null);

    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Dosya yüklenirken bir hata oluştu: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (chatMediaInputRef.current) {
        chatMediaInputRef.current.value = '';
      }
    }
  };

  const toggleReaction = async (messageId: string, emoji: string) => {
    try {
      const existingReaction = reactions.find(
        r => r.message_id === messageId && r.user_id === currentUser.id && r.emoji === emoji
      );

      if (existingReaction) {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('message_reactions')
          .insert([{ message_id: messageId, user_id: currentUser.id, emoji }]);
        if (error) throw error;
      }
    } catch (err) {
      console.error('Reaction toggle error:', err);
    } finally {
      setActiveEmojiPicker(null);
    }
  };

  const POPULAR_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

  // 4. Send or Update Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const content = newMessage.trim();
    
    // Input'u temizle
    setNewMessage('');

    try {
      if (editingMessage) {
        // UPDATE MODE
        const { error } = await supabase
          .from('messages')
          .update({ 
            content: content,
            updated_at: new Date().toISOString() 
          })
          .eq('id', editingMessage.id);
        
        if (error) throw error;
        setEditingMessage(null);
      } else {
        // INSERT MODE
        let finalContent = content;
        if (replyToMessage) {
          finalContent = JSON.stringify({
            reply_to: replyToMessage.id,
            content: content
          });
        }

        const msgData = {
          sender_id: currentUser.id,
          receiver_id: activeContact.id,
          content: finalContent
        };

        const { error } = await supabase.from('messages').insert([msgData]);
        if (error) throw error;
        setReplyToMessage(null);
      }
    } catch (err) {
      console.error("Mesaj gönderilirken/güncellenirken hata oluştu:", err);
      alert('İşlem başarısız oldu.');
    }
  };

  const startEditing = (msg: any) => {
    setEditingMessage(msg);
    setNewMessage(msg.content);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser does not support audio recording');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Mikrofon erişimi sağlanamadı. Lütfen tarayıcı ayarlarından mikrofon iznini kontrol edin ve sayfayı yenileyin.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    }
  };

  const handleAudioUpload = async (blob: Blob) => {
    if (!activeContact) return;
    setIsUploading(true);
    try {
      const fileName = `audio_${Date.now()}.webm`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_media')
        .upload(filePath, blob, {
          contentType: 'audio/webm',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_media')
        .getPublicUrl(filePath);

      const msgData: any = {
        sender_id: currentUser.id,
        receiver_id: activeContact.id,
        content: '',
        file_url: publicUrl,
        file_type: 'audio'
      };

      if (replyToMessage) {
        msgData.content = JSON.stringify({
          reply_to: replyToMessage.id,
          content: ''
        });
      }

      const { error: dbError } = await supabase.from('messages').insert([msgData]);
      if (dbError) throw dbError;
      setReplyToMessage(null);
    } catch (err: any) {
      console.error('Audio upload error:', err);
      alert(`Ses dosyası yüklenirken bir hata oluştu: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // Optimistic update: remove from UI immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setMessageToDelete(null);

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        // If error, we might want to refresh messages to bring it back
        console.error('Delete error:', error);
        // fetchMessages(); // Optional: reload if delete fails
        throw error;
      }
      
      // Update sidebar last message
      fetchContacts();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Mesaj silinirken bir hata oluştu. Yetkiniz olmayabilir veya bağlantı sorunu yaşanıyor.');
      // Refresh messages to restore the one that failed to delete
      if (activeContact) {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeContact.id}),and(sender_id.eq.${activeContact.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });
        if (data) setMessages(data);
      }
    }
  };

  // 5. Select Search Result
  const handleSelectSearchResult = async (userToAdd: any) => {
    try {
      // Check if already in contacts
      const isExisting = contacts.some(c => c.id === userToAdd.id);
      if (!isExisting) {
        // Add to contacts
        await supabase.from('contacts').insert([{ user_id: currentUser.id, contact_id: userToAdd.id }]);
        
        // Update local state
        const newContact = { ...userToAdd, lastMessage: '', lastMessageTime: new Date().toISOString() };
        setContacts(prev => [newContact, ...prev]);
        setActiveContact(newContact);
      } else {
        const existingContact = contacts.find(c => c.id === userToAdd.id);
        setActiveContact(existingContact);
      }
      
      setShowAddContact(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error(err);
      alert('Kişi eklenirken bir hata oluştu.');
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', searchQuery)
          .neq('id', currentUser.id)
          .limit(5);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, currentUser.id]);

  // 6. Update Profile
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen sadece resim dosyası yükleyin.');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Resim boyutu 2MB\'dan küçük olmalıdır.');
      return;
    }

    setProfileLoading(true);
    try {
      const filePath = `${currentUser.id}/avatar.png`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '0',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add a timestamp to bypass browser cache since the filename is static
      setEditAvatarUrl(`${publicUrl}?t=${Date.now()}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Resim yüklenirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      // Tarayıcı önbelleğini kırmak için resim URL'sinin sonuna zaman damgası ekliyoruz
      let finalAvatarUrl = editAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`;
      if (finalAvatarUrl && !finalAvatarUrl.includes('dicebear')) {
        const baseUrl = finalAvatarUrl.split('?')[0]; // Varsa eski zaman damgasını temizle
        finalAvatarUrl = `${baseUrl}?t=${new Date().getTime()}`;
      }

      // Sadece veritabanında var olan kolonları gönderiyoruz (bio ve website_url kaldırıldı)
      const updates = {
        full_name: editFullName,
        avatar_url: finalAvatarUrl,
      };
      
      const { error } = await supabase.from('profiles').update(updates).eq('id', currentUser.id);
      if (error) throw error;
      
      // UI'ın anında güncellenmesi için state'i yeni verilerle güncelliyoruz
      setProfile((prev: any) => ({ ...prev, ...updates }));
      setShowProfileModal(false);
    } catch (err: any) {
      alert(err.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="flex flex-1 bg-[#050505] text-white font-sans tracking-tight overflow-hidden">
      
      {/* PROFILE EDIT MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90dvh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 md:p-6 flex justify-between items-center border-b border-zinc-800/50 shrink-0">
              <h2 className="text-xl font-semibold text-white">Profili Düzenle</h2>
              <button type="button" onClick={() => setShowProfileModal(false)} className="text-zinc-400 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors active:scale-95">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto custom-scrollbar">
              <div className="flex justify-center mb-6">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img 
                    src={editAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} 
                    alt="Preview" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-zinc-800 shadow-xl transition-all group-hover:border-[#0070F3]" 
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={28} />
                  </div>
                  {profileLoading && (
                    <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Ad Soyad</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-800/50 border border-zinc-700 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all shadow-inner"
                  placeholder="Adınız Soyadınız"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Biyografi</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-800/50 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all shadow-inner resize-none h-24 custom-scrollbar"
                  placeholder="Kendinizden bahsedin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Web Sitesi</label>
                <input
                  type="url"
                  value={editWebsiteUrl}
                  onChange={(e) => setEditWebsiteUrl(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-800/50 border border-zinc-700 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all shadow-inner"
                  placeholder="https://ornek.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 ml-1">Profil Fotoğrafı URL</label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  className="w-full px-5 py-3 bg-zinc-800/50 border border-zinc-700 rounded-full focus:ring-2 focus:ring-[#0070F3] focus:border-transparent outline-none text-white transition-all shadow-inner"
                  placeholder="https://ornek.com/foto.jpg"
                />
                <p className="text-xs text-zinc-500 mt-2 ml-2">Resim URL'si girin veya boş bırakarak varsayılanı kullanın.</p>
              </div>
              <div className="pt-4 md:pt-6 flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-3 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="w-full md:w-auto px-6 py-3 md:py-2.5 text-zinc-300 hover:text-white hover:bg-white/5 rounded-full font-medium transition-all active:scale-95"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-gradient-to-r from-[#0070F3] to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-full font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70 active:scale-95"
                >
                  {profileLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MESSAGE DELETE CONFIRMATION MODAL */}
      {messageToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMessageToDelete(null)}></div>
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-[32px] p-8 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mesajı Sil</h3>
              <p className="text-zinc-400 mb-8 leading-relaxed">Bu mesajı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setMessageToDelete(null)}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-all active:scale-95"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDeleteMessage(messageToDelete)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <div className={`w-full md:w-[380px] lg:w-[420px] flex-col bg-white/5 backdrop-blur-md border-r border-zinc-800/50 z-10 transition-all duration-300 ${activeContact || viewMode === 'friends' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header */}
        <div className="h-14 md:h-20 flex items-center justify-between px-4 md:px-6 border-b border-zinc-800/50 shrink-0 pt-[env(safe-area-inset-top)] md:pt-0 pb-[0.5rem] md:pb-0">
          <div 
            className="flex items-center gap-3 md:gap-4 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-2xl transition-all active:scale-95"
            onClick={() => setShowProfileModal(true)}
            title="Profili Düzenle"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-11 h-11 rounded-full cursor-pointer object-cover shadow-md" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shadow-md">
                <User size={22} />
              </div>
            )}
            <span className="font-semibold text-zinc-100 truncate max-w-[140px]">{profile?.full_name || currentUser.email}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-300">
            <button 
              onClick={() => setShowAddContact(!showAddContact)} 
              className={`p-2 md:p-2.5 rounded-full transition-all active:scale-95 ${showAddContact ? 'bg-[#0070F3] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`} 
              title="Kişi Ara"
            >
              <Search size={20} />
            </button>

            <button 
              onClick={() => {
                setViewMode(viewMode === 'friends' ? 'chat' : 'friends');
                if (viewMode !== 'friends') setActiveContact(null);
              }} 
              className={`p-2 md:p-2.5 rounded-full transition-all active:scale-95 relative ${viewMode === 'friends' ? 'bg-[#0070F3] text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`} 
              title="Arkadaşlar"
            >
              <Users size={20} />
            </button>
            
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 md:p-2.5 hover:bg-white/10 hover:text-white text-zinc-400 hover:text-white rounded-full transition-all active:scale-95" 
              title="Ayarlar"
            >
              <Settings size={20} />
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowSidebarMore(!showSidebarMore)} 
                className={`p-2 md:p-2.5 rounded-full transition-all active:scale-95 ${showSidebarMore ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`} 
                title="Daha Fazla"
              >
                <MoreHorizontal size={20} />
                {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-[#050505] rounded-full" />
                )}
              </button>

              {showSidebarMore && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowSidebarMore(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                      onClick={() => { setShowRequests(true); setShowSidebarMore(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Bell size={18} className="text-zinc-500" />
                      <span>Arkadaşlık İstekleri</span>
                      {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => { setShowAddContact(true); setShowSidebarMore(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <UserPlus size={18} className="text-zinc-500" />
                      <span>Yeni Kişi Bul</span>
                    </button>
                    <div className="h-px bg-zinc-800 my-1 mx-2" />
                    <button 
                      onClick={() => { supabase.auth.signOut(); setShowSidebarMore(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Add Contact Panel */}
        {showAddContact && (
          <div className="p-4 md:p-5 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 shrink-0 animate-in slide-in-from-top-2 shadow-xl z-20">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-sm font-semibold text-[#0070F3] tracking-wide uppercase">Yeni Kişi Bul</h3>
              <button onClick={() => { setShowAddContact(false); setSearchQuery(''); }} className="text-zinc-500 hover:text-zinc-300 p-2 -mr-2 rounded-full hover:bg-white/5 transition-colors active:scale-95"><X size={18} /></button>
            </div>
            <div className="relative bg-zinc-800/50 border border-zinc-700 rounded-full flex items-center px-4 py-2.5 mb-2 md:mb-3 shadow-inner">
              <Search size={18} className="text-zinc-400" />
              <input
                type="text"
                placeholder="İsim veya e-posta ara..."
                className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm text-zinc-200 placeholder-zinc-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto -mx-2 px-2 custom-scrollbar">
              {isSearching ? (
                <div className="text-center text-sm text-zinc-500 py-6">Aranıyor...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => {
                  const friendship = getFriendshipStatus(user.id);
                  return (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between px-3 py-3 hover:bg-white/5 rounded-2xl transition-all mb-1 group"
                    >
                      <div className="flex items-center flex-1 min-w-0 mr-3 cursor-pointer" onClick={() => handleSelectSearchResult(user)}>
                        <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Avatar" className="w-11 h-11 rounded-full object-cover shadow-sm" />
                        <div className="ml-4 overflow-hidden">
                          <p className="text-sm font-medium text-zinc-200 truncate">{user.full_name || user.email}</p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      
                      {!friendship ? (
                        <button 
                          onClick={() => sendFriendRequest(user.id)}
                          className="p-2.5 bg-[#0070F3]/10 hover:bg-[#0070F3] text-[#0070F3] hover:text-white rounded-full transition-all active:scale-90"
                          title="Arkadaş Ekle"
                        >
                          <UserPlus size={18} />
                        </button>
                      ) : friendship.status === 'pending' ? (
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800 px-3 py-1.5 rounded-full">
                          {friendship.sender_id === currentUser.id ? 'İstek Gönderildi' : 'İstek Geldi'}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                          <UserCheck size={18} />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : searchQuery.trim() ? (
                <div className="text-center text-sm text-zinc-500 py-6">Kullanıcı bulunamadı.</div>
              ) : (
                <div className="text-center text-sm text-zinc-600 py-6">Aramak için yazmaya başlayın.</div>
              )}
            </div>
          </div>
        )}

        {/* Friend Requests Panel */}
        {showRequests && (
          <div className="p-4 md:p-5 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 shrink-0 animate-in slide-in-from-top-2 shadow-xl z-20">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-sm font-semibold text-[#0070F3] tracking-wide uppercase">Arkadaşlık İstekleri</h3>
              <button onClick={() => setShowRequests(false)} className="text-zinc-500 hover:text-zinc-300 p-2 -mr-2 rounded-full hover:bg-white/5 transition-colors active:scale-95"><X size={18} /></button>
            </div>
            
            <div className="max-h-64 overflow-y-auto -mx-2 px-2 custom-scrollbar">
              {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length > 0 ? (
                friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').map(request => {
                  // We need the sender profile. This is a bit tricky because searchResults might not have it.
                  // For now, let's assume we can fetch it or it's already in contacts.
                  // In a real app, we'd fetch the profiles for these IDs.
                  return (
                    <div key={request.id} className="flex items-center justify-between px-3 py-3 bg-white/5 rounded-2xl mb-2">
                      <div className="flex items-center flex-1 min-w-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                          <User size={20} />
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <p className="text-xs font-medium text-zinc-200 truncate">Yeni İstek</p>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5">Sizinle arkadaş olmak istiyor</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleFriendRequest(request.id, 'accepted')}
                          className="p-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-full transition-all active:scale-90"
                          title="Onayla"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleFriendRequest(request.id, 'rejected')}
                          className="p-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-all active:scale-90"
                          title="Reddet"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-zinc-600 py-6">Gelen istek bulunmuyor.</div>
              )}
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-[#111] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings size={24} className="text-[#0070F3]" />
                  Ayarlar
                </h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                    <Volume2 size={16} />
                    Bildirim Sesi
                  </label>
                  <div className="space-y-2">
                    {SOUND_OPTIONS.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => {
                          setNotificationSound(sound.id);
                          localStorage.setItem('finora_notification_sound', sound.id);
                          playNotificationSound(sound.id);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                          notificationSound === sound.id 
                            ? 'bg-blue-500/10 border-blue-500/50 text-white' 
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <span className="font-medium">{sound.name}</span>
                        {notificationSound === sound.id && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {contacts.length > 0 ? contacts.map((contact) => {
            const timeStr = contact.lastMessageTime ? new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <div
                key={contact.id}
                onClick={() => { setActiveContact(contact); setViewMode('chat'); }}
                className={`flex items-center px-4 py-3.5 cursor-pointer rounded-2xl transition-all mb-1 active:scale-[0.98] ${activeContact?.id === contact.id ? 'bg-white/10 shadow-md' : 'hover:bg-white/5'}`}
              >
                <div className="relative shrink-0">
                  <img 
                    src={contact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.email}`} 
                    alt={contact.full_name} 
                    className={`w-12 h-12 rounded-full object-cover transition-all ${onlineUsers[contact.id] ? 'border-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border border-zinc-700'}`} 
                  />
                  {onlineUsers[contact.id] && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#050505] rounded-full shadow-lg" />
                  )}
                </div>
                <div className="ml-4 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-[15px] font-medium text-zinc-100 truncate">{contact.full_name || contact.email}</h3>
                    <span className="text-xs text-zinc-500 shrink-0 ml-2 font-medium">{timeStr}</span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate pr-2">
                    {contact.lastMessage || <span className="italic text-zinc-600">Sohbete başlamak için tıklayın</span>}
                  </p>
                </div>
              </div>
            );
          }) : (
            <div className="text-center text-sm text-zinc-500 py-16 px-6 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
              <button 
                onClick={() => setShowAddContact(true)}
                className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-inner hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer group"
              >
                <UserPlus size={32} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </button>
              <p className="text-zinc-300 font-medium mb-2">Henüz kimseyle sohbet etmiyorsunuz.</p>
              <p className="text-xs text-zinc-500 leading-relaxed">Yeni bir sohbet başlatmak için butona tıklayın.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT CHAT AREA */}
      <div className={`flex-1 flex-col relative ${activeContact || viewMode === 'friends' ? 'flex' : 'hidden md:flex'}`}>
        
        {viewMode === 'friends' ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900/30 backdrop-blur-xl">
            {/* Friends Manager Header */}
            <div className="h-14 md:h-20 bg-white/5 backdrop-blur-md flex items-center px-4 md:px-6 border-b border-zinc-800/50 shrink-0 z-40 pt-[env(safe-area-inset-top)] md:pt-0 relative">
              <button onClick={() => setViewMode('chat')} className="md:hidden mr-2 p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
                <ArrowLeft size={22} />
              </button>
              <div className="w-11 h-11 rounded-full bg-[#0070F3]/20 flex items-center justify-center text-[#0070F3] shadow-lg shadow-blue-500/10 border border-blue-500/20">
                <Users size={22} />
              </div>
              <div className="ml-4">
                <h2 className="text-[16px] font-semibold text-zinc-100">Arkadaşlar</h2>
                <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase">Bağlantılarını Yönet</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 md:px-6 py-4 gap-2 border-b border-zinc-800/30 bg-white/5">
              {[
                { id: 'myFriends', label: 'Arkadaşlarım', icon: Users },
                { id: 'requests', label: 'İstekler', icon: Bell },
                { id: 'find', label: 'İnsanları Bul', icon: Search }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFriendsTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${friendsTab === tab.id ? 'bg-[#0070F3] text-white shadow-lg shadow-blue-500/20' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'requests' && friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length > 0 && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center font-bold">
                      {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
              {friendsTab === 'myFriends' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {contacts.length > 0 ? contacts.map((friend) => (
                    <div key={friend.id} className="bg-white/5 border border-zinc-800/50 rounded-3xl p-4 flex items-center justify-between group hover:bg-white/[0.07] transition-all hover:border-zinc-700/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.email}`} alt={friend.full_name} className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800" />
                          {onlineUsers[friend.id] && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111] rounded-full" />}
                        </div>
                        <div>
                          <h3 className="text-zinc-100 font-semibold">{friend.full_name || friend.email}</h3>
                          <p className="text-xs text-zinc-500">{onlineUsers[friend.id] ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setActiveContact(friend); setViewMode('chat'); }}
                          className="p-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full transition-all active:scale-90"
                          title="Sohbet Et"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button 
                          onClick={() => removeFriendship(friend.id)}
                          className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all active:scale-90"
                          title="Arkadaşlıktan Çıkar"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
                        <Users size={32} />
                      </div>
                      <h3 className="text-zinc-300 font-semibold mb-2">Henüz arkadaşınız yok</h3>
                      <p className="text-zinc-500 text-sm">"İnsanları Bul" sekmesinden yeni arkadaşlar edinebilirsiniz.</p>
                    </div>
                  )}
                </div>
              )}

              {friendsTab === 'requests' && (
                <div className="max-w-2xl mx-auto space-y-3">
                  {friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').length > 0 ? (
                    friendships.filter(f => f.receiver_id === currentUser.id && f.status === 'pending').map((request) => {
                      const senderProfile = requestProfiles[request.sender_id];
                      return (
                        <div key={request.id} className="bg-white/5 border border-zinc-800/50 rounded-3xl p-5 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="flex items-center gap-4">
                            {senderProfile?.avatar_url ? (
                              <img src={senderProfile.avatar_url} alt={senderProfile.full_name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                <User size={24} />
                              </div>
                            )}
                            <div>
                              <h3 className="text-zinc-100 font-semibold">{senderProfile?.full_name || 'Yeni Arkadaşlık İsteği'}</h3>
                              <p className="text-xs text-zinc-500">{senderProfile?.email || 'Sizinle bağlantı kurmak istiyor'}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleFriendRequest(request.id, 'accepted')}
                              className="px-6 py-2 bg-emerald-500 text-white rounded-full text-sm font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                              Onayla
                            </button>
                            <button 
                              onClick={() => handleFriendRequest(request.id, 'rejected')}
                              className="px-6 py-2 bg-zinc-800 text-zinc-300 rounded-full text-sm font-bold hover:bg-zinc-700 transition-all active:scale-95"
                            >
                              Reddet
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center">
                      <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
                        <Bell size={32} />
                      </div>
                      <h3 className="text-zinc-300 font-semibold mb-2">Bekleyen istek yok</h3>
                      <p className="text-zinc-500 text-sm">Tüm arkadaşlık isteklerini yanıtladınız.</p>
                    </div>
                  )}
                </div>
              )}

              {friendsTab === 'find' && (
                <div className="max-w-3xl mx-auto">
                  <div className="relative bg-zinc-800/30 border border-zinc-700/50 rounded-3xl flex items-center px-6 py-4 mb-8 shadow-inner focus-within:border-[#0070F3]/50 transition-all text-zinc-100">
                    <Search size={22} className="text-zinc-500" />
                    <input
                      type="text"
                      placeholder="E-posta ile insanları ara..."
                      className="w-full bg-transparent border-none focus:outline-none ml-4 text-zinc-100 placeholder-zinc-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isSearching ? (
                      <div className="col-span-full py-12 flex flex-col items-center gap-4">
                        <Loader2 size={32} className="text-[#0070F3] animate-spin" />
                        <p className="text-zinc-500 text-sm">Kullanıcılar aranıyor...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(user => {
                        const friendship = getFriendshipStatus(user.id);
                        return (
                          <div key={user.id} className="bg-white/5 border border-zinc-800/50 rounded-3xl p-4 flex items-center justify-between hover:bg-white/[0.07] transition-all">
                            <div className="flex items-center gap-4">
                              <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.full_name} className="w-12 h-12 rounded-full object-cover border border-zinc-700" />
                              <div className="min-w-0">
                                <h3 className="text-zinc-100 font-semibold truncate">{user.full_name || user.email}</h3>
                                <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                              </div>
                            </div>
                            
                            {friendship ? (
                              friendship.status === 'accepted' ? (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  <UserCheck size={12} />
                                  Arkadaş
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  <Loader2 size={12} className="animate-spin" />
                                  Bekliyor
                                </div>
                              )
                            ) : (
                              <button 
                                onClick={() => sendFriendRequest(user.id)}
                                className="p-2.5 bg-[#0070F3] text-white rounded-full hover:bg-blue-600 transition-all active:scale-90 shadow-lg shadow-blue-500/20"
                              >
                                <UserPlus size={18} />
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : searchQuery ? (
                      <div className="col-span-full py-12 text-center">
                        <p className="text-zinc-500 italic">"{searchQuery}" için sonuç bulunamadı.</p>
                      </div>
                    ) : (
                      <div className="col-span-full py-12 text-center text-zinc-600">
                        <p className="text-sm">Arama yaparak yeni insanlar keşfedin.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeContact ? (
          <>
            {/* Chat Header */}
            <div className="h-14 md:h-20 bg-white/5 backdrop-blur-md flex items-center px-4 md:px-6 border-b border-zinc-800/50 shrink-0 z-40 pt-[env(safe-area-inset-top)] md:pt-0 relative">
              <button onClick={() => setActiveContact(null)} className="md:hidden mr-2 p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95">
                <ArrowLeft size={22} />
              </button>
              <div className="relative cursor-pointer" onClick={() => setShowContactInfo(true)}>
                <img 
                  src={activeContact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.email}`} 
                  alt={activeContact.full_name} 
                  className={`w-11 h-11 rounded-full object-cover ${onlineUsers[activeContact.id] ? 'border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'border border-zinc-700'}`} 
                />
                {onlineUsers[activeContact.id] && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#050505] rounded-full" />
                )}
              </div>
              <div className="ml-4 flex-1 cursor-pointer" onClick={() => setShowContactInfo(true)}>
                <h2 className="text-[16px] font-semibold text-zinc-100">{activeContact.full_name || activeContact.email}</h2>
                <div className="flex items-center gap-2">
                  {isTyping ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-emerald-400 font-medium italic">yazıyor</span>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  ) : (
                    <p className={`text-xs ${onlineUsers[activeContact.id] ? 'text-emerald-500' : 'text-zinc-500'}`}>
                      {onlineUsers[activeContact.id] ? 'çevrimiçi' : 'çevrimdışı'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-zinc-400">
                <button 
                  onClick={() => {
                    setShowChatSearch(!showChatSearch);
                    if (showChatSearch) setChatSearchQuery('');
                  }}
                  className={`p-2 md:p-2.5 rounded-full transition-all active:scale-95 ${showChatSearch ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}
                >
                  <Search size={20} />
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className={`p-2 md:p-2.5 rounded-full transition-all active:scale-95 ${showChatMenu ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'}`}
                  >
                    <MoreVertical size={20} />
                  </button>

                  {showChatMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowChatMenu(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                          <Eraser size={18} className="text-zinc-500" />
                          <span>Sohbeti Temizle</span>
                        </button>
                        <button 
                          onClick={() => { setShowMediaVault(true); setShowChatMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Eye size={18} className="text-zinc-500" />
                          <span>Medyaları Görüntüle</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors">
                          <VolumeX size={18} className="text-zinc-500" />
                          <span>Bildirimleri Sustur</span>
                        </button>
                        <div className="h-px bg-zinc-800 my-1 mx-2" />
                        <button 
                          onClick={() => { setShowContactInfo(true); setShowChatMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Info size={18} className="text-zinc-500" />
                          <span>Kişi Bilgisi</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Search Bar */}
            {showChatSearch && (
              <div className="bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/50 px-4 py-3 z-30 animate-in slide-in-from-top-2 duration-200 relative">
                <div className="relative bg-zinc-800/50 border border-zinc-700 rounded-full flex items-center px-4 py-2 shadow-inner">
                  <Search size={16} className="text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Sohbet içinde ara..."
                    className="w-full bg-transparent border-none focus:outline-none ml-3 text-sm text-zinc-200 placeholder-zinc-500"
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {chatSearchQuery && (
                    <button onClick={() => setChatSearchQuery('')} className="text-zinc-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            )}




            {/* Side Drawer (Contact Info) */}
            {showContactInfo && (
              <>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] md:absolute" onClick={() => setShowContactInfo(false)} />
                <div className="fixed top-0 right-0 bottom-0 w-full md:max-w-sm bg-[#050505] border-l border-zinc-800 shadow-2xl z-[70] md:absolute animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="h-14 md:h-20 flex items-center justify-between px-6 border-b border-zinc-800/50 shrink-0 pt-[calc(2.5rem+env(safe-area-inset-top))] md:pt-0 relative">
                    <h3 className="text-lg font-semibold text-zinc-100">Kişi Bilgisi</h3>
                    <button onClick={() => setShowContactInfo(false)} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-95">
                      <X size={22} />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="flex flex-col items-center text-center mb-10">
                      <div className="relative mb-6">
                        <img 
                          src={activeContact.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.email}`} 
                          alt={activeContact.full_name} 
                          className="w-32 h-32 rounded-full object-cover border-4 border-zinc-800 shadow-2xl" 
                        />
                        {onlineUsers[activeContact.id] && (
                          <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-[#050505] rounded-full" />
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">{activeContact.full_name || activeContact.email}</h2>
                      <p className={`text-sm font-medium ${onlineUsers[activeContact.id] ? 'text-emerald-500' : 'text-zinc-500'}`}>
                        {onlineUsers[activeContact.id] ? 'çevrimiçi' : 'çevrimdışı'}
                      </p>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Hakkında</h4>
                        <p className="text-zinc-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-zinc-800/50 italic">
                          {activeContact.bio || 'Bu kullanıcı henüz bir biyografi eklememiş.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">E-posta</h4>
                        <p className="text-zinc-300 bg-white/5 px-4 py-3 rounded-2xl border border-zinc-800/50 truncate">
                          {activeContact.email}
                        </p>
                      </div>

                      <div className="pt-4 space-y-3">
                        <button 
                          onClick={() => { removeFriendship(activeContact.id); setShowContactInfo(false); }}
                          className="w-full flex items-center justify-center gap-3 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-semibold transition-all active:scale-[0.98] border border-red-500/20"
                        >
                          <UserMinus size={20} />
                          <span>Arkadaşlıktan Çıkar</span>
                        </button>
                        <button 
                          className="w-full flex items-center justify-center gap-3 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl font-semibold transition-all active:scale-[0.98] border border-zinc-700/50"
                        >
                          <ShieldAlert size={20} />
                          <span>Kişiyi Engelle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Media Vault Side Drawer */}
            {showMediaVault && (
              <>
                <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] md:absolute" onClick={() => setShowMediaVault(false)} />
                <div className="fixed top-0 right-0 bottom-0 w-full md:max-w-md bg-[#050505] border-l border-zinc-800 shadow-2xl z-[70] md:absolute animate-in slide-in-from-right duration-300 flex flex-col">
                  <div className="h-14 md:h-20 flex items-center px-4 md:px-6 border-b border-zinc-800/50 shrink-0 pt-[calc(2.5rem+env(safe-area-inset-top))] md:pt-0 gap-3">
                    <button onClick={() => setShowMediaVault(false)} className="md:hidden p-3 -ml-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 z-10">
                      <ArrowLeft size={22} />
                    </button>
                    <div className="flex items-center gap-3 flex-1 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Paperclip size={18} />
                      </div>
                      <h3 className="text-[16px] font-semibold text-zinc-100 truncate">Medya & Bağlantılar</h3>
                    </div>
                    <button onClick={() => setShowMediaVault(false)} className="hidden md:block p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all active:scale-95">
                      <X size={22} />
                    </button>
                  </div>

                  <div className="flex border-b border-zinc-800/50 bg-white/2 px-2 shrink-0">
                    {(['media', 'files', 'links'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setVaultTab(tab)}
                        className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all relative ${vaultTab === tab ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        {tab === 'media' ? 'Medya' : tab === 'files' ? 'Dosyalar' : 'Bağlantılar'}
                        {vaultTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {vaultTab === 'media' && (
                      <div className="grid grid-cols-3 gap-1">
                        {messages.filter(m => m.file_url && (m.file_type === 'image' || m.file_type === 'video')).length === 0 ? (
                          <div className="col-span-3 py-20 text-center text-zinc-600">
                            <ImageIcon size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Henüz medya paylaşılmamış.</p>
                          </div>
                        ) : (
                          messages.filter(m => m.file_url && (m.file_type === 'image' || m.file_type === 'video')).map((msg) => (
                            <div 
                              key={msg.id} 
                              onClick={() => setSelectedMedia(msg)}
                              className="aspect-square relative group cursor-pointer overflow-hidden bg-zinc-900 rounded-sm"
                            >
                              {msg.file_type === 'video' ? (
                                <>
                                  <video src={msg.file_url} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent translate-x-0.5" />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <img src={msg.file_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                              )}
                              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-white/30 transition-all" />
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {vaultTab === 'files' && (
                      <div className="p-3 space-y-2">
                        {messages.filter(m => m.file_url && (m.file_type === 'audio' || m.file_type === 'other')).length === 0 ? (
                          <div className="py-20 text-center text-zinc-600">
                            <FileIcon size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Henüz dosya paylaşılmamış.</p>
                          </div>
                        ) : (
                          messages.filter(m => m.file_url && (m.file_type === 'audio' || m.file_type === 'other')).map((msg) => (
                            <div key={msg.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-zinc-800/50 hover:bg-white/10 transition-colors group">
                              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                                {msg.file_type === 'audio' ? <Mic size={20} /> : <FileIcon size={20} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-200 truncate">
                                  {msg.file_type === 'audio' ? 'Sesli Mesaj' : 'Dosya Ekini'}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                                  {new Date(msg.created_at).toLocaleDateString()} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <a href={msg.file_url} target="_blank" rel="noreferrer" className="p-2 text-zinc-500 hover:text-blue-400 transition-colors">
                                <ExternalLink size={18} />
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {vaultTab === 'links' && (
                      <div className="p-3 space-y-2">
                        {messages.filter(m => m.content && m.content.match(/https?:\/\/[^\s]+/g)).length === 0 ? (
                          <div className="py-20 text-center text-zinc-600">
                            <Globe size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm">Henüz bağlantı paylaşılmamış.</p>
                          </div>
                        ) : (
                          messages.filter(m => m.content && m.content.match(/https?:\/\/[^\s]+/g)).map((msg) => {
                            const links = msg.content.match(/https?:\/\/[^\s]+/g);
                            return links?.map((link, idx) => (
                              <a key={`${msg.id}-${idx}`} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-white/2 hover:bg-white/5 rounded-2xl border border-zinc-800/50 transition-all group">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                  <LinkIcon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-zinc-300 truncate font-medium group-hover:text-blue-400 transition-colors">{link}</p>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">Paylaşan: {msg.sender_id === currentUser.id ? 'Siz' : (activeContact.full_name || activeContact.email)}</p>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-400 transform group-hover:translate-x-1 transition-all" />
                              </a>
                            ));
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Media Lightbox */}
            {selectedMedia && (
              <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 animate-in fade-in duration-300">
                <div className="flex items-center justify-between p-4 md:p-6 z-10 shrink-0">
                  <div className="flex flex-col">
                    <p className="text-white font-semibold">{activeContact.full_name || activeContact.email}</p>
                    <p className="text-zinc-500 text-xs">
                      {new Date(selectedMedia.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a 
                      href={selectedMedia.file_url} 
                      download 
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
                      title="İndir"
                    >
                      <Download size={20} />
                    </a>
                    <button 
                      onClick={() => setSelectedMedia(null)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-4 min-h-0 overflow-hidden">
                  {selectedMedia.file_type === 'video' ? (
                    <video 
                      src={selectedMedia.file_url} 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                    />
                  ) : (
                    <img 
                      src={selectedMedia.file_url} 
                      className="max-w-full max-h-full object-contain shadow-2xl" 
                      alt="" 
                    />
                  )}
                </div>
              </div>
            )}

            {/* Chat Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
                 style={{ backgroundImage: `radial-gradient(circle at center, #ffffff 1px, transparent 1px)`, backgroundSize: '24px 24px' }}>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 flex flex-col gap-3 custom-scrollbar">
              {messages.filter(m => 
                !chatSearchQuery || 
                (m.content && m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 text-zinc-600">
                    <Search size={32} />
                  </div>
                  <h3 className="text-zinc-400 font-medium mb-1">
                    {chatSearchQuery ? 'Sonuç bulunamadı' : 'Henüz mesaj yok'}
                  </h3>
                  <p className="text-zinc-500 text-sm max-w-[240px]">
                    {chatSearchQuery ? `"${chatSearchQuery}" ile eşleşen mesaj bulunamadı.` : 'Sohbeti başlatmak için bir mesaj gönderin.'}
                  </p>
                </div>
              ) : (
                messages
                  .filter(m => 
                    !chatSearchQuery || 
                    (m.content && m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
                  )
                  .map((msg) => {
                  const isMe = msg.sender_id === currentUser.id;
                  const timeStr = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} id={`msg-${msg.id}`} className={`flex w-full group animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[82%] md:max-w-[70%] relative`}>
                        <div className={`relative px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xl transition-all duration-200 ${isMe ? 'bg-gradient-to-br from-[#0070F3] to-blue-600 text-white rounded-2xl rounded-tr-sm' : 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-700/50'}`}>
                          {/* Message Actions Dropdown Trigger */}
                          <div className={`absolute top-0 flex items-center transition-all z-30 ${isMe ? '-left-8' : '-right-8'}`}>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMessageActionsId(activeMessageActionsId === msg.id ? null : msg.id);
                              }}
                              className="p-1 text-zinc-500 hover:text-white transition-colors"
                            >
                              <ChevronDown size={18} className={`transition-transform duration-200 ${activeMessageActionsId === msg.id ? 'rotate-180' : ''}`} />
                            </button>

                            {activeMessageActionsId === msg.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMessageActionsId(null)} />
                                <div className={`absolute top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ${isMe ? 'right-0' : 'left-0'}`}>
                                  {/* Emoji Quick reactions */}
                                  <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800 bg-white/5">
                                    {POPULAR_EMOJIS.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => { toggleReaction(msg.id, emoji); setActiveMessageActionsId(null); }}
                                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-all active:scale-125 text-base"
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                  
                                  <div className="py-1">
                                    <button 
                                      onClick={() => { setReplyToMessage(msg); setActiveMessageActionsId(null); }}
                                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <CornerUpLeft size={16} className="text-blue-400" />
                                      <span>Yanıtla</span>
                                    </button>
                                    {isMe && (
                                      <>
                                        <button 
                                          onClick={() => { startEditing(msg); setActiveMessageActionsId(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                                        >
                                          <Pencil size={16} className="text-zinc-500" />
                                          <span>Düzenle</span>
                                        </button>
                                        <button 
                                          onClick={() => { setMessageToDelete(msg.id); setActiveMessageActionsId(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                          <Trash2 size={16} />
                                          <span>Sil</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {msg.file_url && (
                            <div className="mb-2">
                              {msg.file_type === 'video' ? (
                                <video src={msg.file_url} controls className="rounded-xl max-w-full h-auto max-h-64 object-cover" />
                              ) : msg.file_type === 'audio' ? (
                                <VoiceMessage url={msg.file_url} />
                              ) : (
                                <img src={msg.file_url} alt="Attachment" className="rounded-xl max-w-full h-auto max-h-64 object-cover" />
                              )}
                            </div>
                          )}
                          {msg.content && (
                            <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                              {(() => {
                                try {
                                  if (msg.content.startsWith('{"reply_to":')) {
                                    const parsed = JSON.parse(msg.content);
                                    const quoted = messages.find(m => m.id === parsed.reply_to);
                                    return (
                                      <div className="flex flex-col gap-1.5 mb-2">
                                        <div 
                                          className={`border-l-2 py-1 px-3 bg-black/10 rounded-r-lg max-w-full cursor-pointer hover:bg-black/20 transition-colors ${isMe ? 'border-white/40' : 'border-zinc-500/40'}`}
                                          onClick={() => {
                                            const el = document.getElementById(`msg-${parsed.reply_to}`);
                                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            el?.classList.add('animate-pulse-blue');
                                            setTimeout(() => el?.classList.remove('animate-pulse-blue'), 2000);
                                          }}
                                        >
                                          <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">
                                            {quoted?.sender_id === currentUser.id ? 'Siz' : 'Yanıtlanan'}
                                          </p>
                                          <p className="text-[11px] opacity-60 truncate italic">
                                            {quoted ? (quoted.file_url ? (quoted.file_type === 'video' ? '🎥 Video' : quoted.file_type === 'audio' ? '🎵 Sesli' : '📷 Foto') : quoted.content) : 'Mesaj silinmiş'}
                                          </p>
                                        </div>
                                        <span>{parsed.content}</span>
                                      </div>
                                    );
                                  }
                                } catch (e) {}
                                return msg.content;
                              })()}
                              {msg.updated_at && msg.updated_at !== msg.created_at && (
                                <span className="text-[10px] opacity-60 ml-1.5 italic">(düzenlendi)</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Reactions Display */}
                        {reactions.filter(r => r.message_id === msg.id).length > 0 && (
                          <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {Object.entries(
                              reactions
                                .filter(r => r.message_id === msg.id)
                                .reduce((acc: any, curr) => {
                                  acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                                  return acc;
                                }, {})
                            ).map(([emoji, count]: [string, any]) => {
                              const hasReacted = reactions.some(
                                r => r.message_id === msg.id && r.user_id === currentUser.id && r.emoji === emoji
                              );
                              return (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all active:scale-95 border ${
                                    hasReacted 
                                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
                                  }`}
                                >
                                  <span>{emoji}</span>
                                  <span>{count}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[11px] font-medium text-zinc-500">{timeStr}</span>
                          {isMe && (
                            <span className={`transition-all duration-500 ${msg.status === 'read' ? 'text-[#0070F3] scale-110' : 'text-zinc-500 scale-100'} animate-in fade-in zoom-in duration-300`}>
                              {msg.status === 'sent' ? <Check size={14} /> : <CheckCheck size={14} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* Typing Indicator Bubble */}
              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-left-2 duration-300 mb-2">
                  <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-lg">
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="relative bg-white/5 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-4 flex flex-col gap-2 shrink-0 z-10 border-t border-zinc-800/50">
              {!isFriend(activeContact.id) ? (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-500 shadow-inner">
                    <UserX size={24} />
                  </div>
                  <p className="text-zinc-300 text-sm font-semibold mb-1">Mesaj Gönderilemiyor</p>
                  <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto">Sadece arkadaş olduğunuz kişilere mesaj gönderebilirsiniz.</p>
                  
                  {getFriendshipStatus(activeContact.id)?.status === 'pending' ? (
                    <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-zinc-800 text-zinc-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-zinc-700">
                      <Loader2 size={14} className="animate-spin" />
                      İstek Onay Bekliyor
                    </div>
                  ) : (
                    <button 
                      onClick={() => sendFriendRequest(activeContact.id)}
                      className="mt-5 px-8 py-2.5 bg-gradient-to-r from-[#0070F3] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                      Arkadaşlık İsteği Gönder
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Quoted Message Preview */}
                  {replyToMessage && (
                    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-3 flex items-start gap-4 mb-2 animate-in slide-in-from-bottom-2 duration-200 relative overflow-hidden group shadow-xl mx-0 md:mx-0">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0070F3]" />
                      <div className="flex-1 min-w-0 ml-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-bold text-[#0070F3] uppercase tracking-wider">
                            {replyToMessage.sender_id === currentUser.id ? "Siz" : (contacts.find(c => c.id === replyToMessage.sender_id)?.full_name || "Yanıtlanan")}
                          </span>
                          <button 
                            onClick={() => setReplyToMessage(null)}
                            className="p-1 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 truncate leading-relaxed">
                          {replyToMessage.file_url ? (
                            replyToMessage.file_type === 'video' ? '🎥 Video' : 
                            replyToMessage.file_type === 'audio' ? '🎵 Sesli Mesaj' : '📷 Fotoğraf'
                          ) : replyToMessage.content}
                        </p>
                      </div>
                    </div>
                  )}

                  {editingMessage && (
                    <div className="flex items-center justify-between bg-blue-500/10 border-l-4 border-blue-500 px-4 py-2 rounded-r-xl mb-1 animate-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2">
                        <Pencil size={14} className="text-blue-400" />
                        <span className="text-xs text-blue-400 font-medium">Mesajı düzenliyorsunuz...</span>
                      </div>
                      <button onClick={cancelEditing} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="flex items-center justify-between bg-red-500/10 border-l-4 border-red-500 px-4 py-3 rounded-r-xl mb-1 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-sm text-red-400 font-bold tracking-wider">{formatDuration(recordingDuration)}</span>
                        <span className="text-xs text-red-400/80">Ses kaydediliyor...</span>
                      </div>
                      <button onClick={stopRecording} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all">
                        <Square size={16} fill="white" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2 md:gap-3">
                    <input 
                      type="file" 
                      ref={chatMediaInputRef} 
                      onChange={handleMediaUpload} 
                      accept="image/*,video/*" 
                      className="hidden" 
                    />
                    <button 
                      onClick={() => chatMediaInputRef.current?.click()}
                      disabled={isUploading || !!editingMessage || isRecording}
                      className="p-3 md:p-3.5 rounded-full flex items-center justify-center transition-all bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 active:scale-95 disabled:opacity-50"
                      title="Medya Ekle"
                    >
                      {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                    </button>
                    
                    <div className="flex-1 bg-zinc-900/50 rounded-3xl flex items-end shadow-inner border border-zinc-800 focus-within:border-[#0070F3]/50 focus-within:bg-zinc-800/80 transition-all">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        disabled={isRecording}
                        placeholder={editingMessage ? "Mesajı düzenleyin..." : isRecording ? "Kayıt yapılıyor..." : "Bir mesaj yazın..."}
                        className="w-full max-h-32 bg-transparent text-zinc-100 placeholder-zinc-500 px-4 md:px-5 py-3 md:py-3.5 resize-none focus:outline-none text-[15px] disabled:opacity-50"
                        rows={1}
                        style={{ minHeight: '48px' }}
                      />
                    </div>

                    {!newMessage.trim() && !editingMessage ? (
                      <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isUploading}
                        className={`p-3 md:p-3.5 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-bounce' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                        title={isRecording ? "Kaydı Durdur" : "Sesli Mesaj"}
                      >
                        {isRecording ? <Square size={20} fill="white" /> : <Mic size={20} />}
                      </button>
                    ) : (
                      <button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className={`p-3 md:p-3.5 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${newMessage.trim() ? 'bg-gradient-to-r from-[#0070F3] to-blue-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5' : 'bg-zinc-800 text-zinc-600'}`}
                      >
                        {editingMessage ? (
                          <Check size={20} />
                        ) : (
                          <Send size={20} className={newMessage.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''} />
                        )}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-transparent p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center animate-fade-in">
              <div className="w-28 h-28 bg-gradient-to-br from-[#0070F3]/20 to-blue-600/20 rounded-full mb-8 flex items-center justify-center shadow-[0_0_40px_rgba(0,112,243,0.2)] border border-blue-500/30 relative">
                <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                <MessageSquare size={48} className="text-[#0070F3]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight text-center">Finora'ya Hoş Geldiniz</h1>
              <p className="text-zinc-400 text-center max-w-md text-[16px] leading-relaxed px-6 mb-8">
                Premium mesajlaşma deneyimine başlamak için sol taraftan bir kişi seçin veya yeni bir kişi ekleyin.
              </p>
              
              <div className="hidden md:flex items-center gap-3 text-blue-400/80 bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20 animate-bounce shadow-[0_0_20px_rgba(0,112,243,0.15)]">
                <ArrowLeft size={20} />
                <span className="font-medium">Sohbete başlamak için bir kişi seçin</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN APP (Session Manager) ---
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-[#050505] text-zinc-400 font-sans tracking-tight">Yükleniyor...</div>;
  }

  return (
    <div className="h-[100dvh] bg-[#050505] overflow-hidden">
      <BetaBanner onReportClick={() => setIsReportModalOpen(true)} />
      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userId={session?.user?.id}
      />
      
      <div className="pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-[calc(2.5rem+env(safe-area-inset-top))] h-full flex flex-col overflow-hidden">
        {showLanding ? (
          <Landing session={session} onStart={() => setShowLanding(false)} />
        ) : (
          session ? <Dashboard session={session} /> : <Auth />
        )}
      </div>
    </div>
  );
}
