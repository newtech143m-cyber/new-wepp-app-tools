import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Hash, 
  AlignLeft, 
  FileText, 
  Image as ImageIcon, 
  FileImage, 
  FileBox,
  ImagePlus,
  X,
  Menu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Star,
  ArrowRight,
  Upload,
  Download,
  Copy,
  Scissors,
  Wand2,
  Zap,
  Shield,
  Palette,
  Globe,
  Coins,
  Banknote,
  DollarSign,
  TrendingUp,
  ExternalLink,
  FileSpreadsheet,
  LogIn,
  LogOut,
  User as UserIcon,
  CreditCard,
  Lock,
  Github,
  Mail,
  RefreshCw,
  Clock,
  History
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';
import { useAuth } from './contexts/AuthContext';
import { auth, signInWithPopup, signOut, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from './lib/firebase';

// --- Audio & Animations ---
const playCompleteSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log('Audio play failed:', e));
};

const ProcessingAnimation = ({ toolName, icon: Icon }: { toolName: string, icon: any }) => {
  const [progress, setProgress] = useState(0);

  const steps = [
    { label: 'Analyzing request...', min: 0 },
    { label: 'AI Processing...', min: 30 },
    { label: 'Finalizing result...', min: 70 },
  ];

  useEffect(() => {
    const duration = 2500;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / duration, 1);
      setProgress(Math.round(p * 100));
      if (p >= 1) {
        clearInterval(interval);
        playCompleteSound();
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#0b0d11] rounded-[3rem] p-12 min-h-[520px] w-full flex flex-col items-center justify-center border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Main Icon Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-44 h-44 bg-white/5 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-10 relative border border-white/10 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent group-hover:opacity-100 transition-opacity" />
          <div className="relative p-7 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10">
            <Icon className="w-20 h-20 text-primary drop-shadow-[0_0_20px_rgba(0,255,120,0.4)]" />
          </div>
          
          {/* Animated Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -inset-10 bg-primary rounded-full blur-[80px] pointer-events-none"
          />
        </motion.div>

        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-8 text-center leading-tight">
          AI {toolName} <br />
          <span className="text-primary text-sm tracking-[0.4em]">In Progress</span>
        </h3>

        {/* Progress Bar Container */}
        <div className="w-full space-y-4 mb-12">
          <div className="flex justify-between items-end">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Load</span>
             <span className="text-[10px] font-black text-primary uppercase tracking-widest">{progress}% READY</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary rounded-full shadow-[0_0_20px_rgba(0,255,120,0.6)]"
            />
          </div>
        </div>

        {/* Status Steps */}
        <div className="w-full space-y-6">
          {steps.map((step, idx) => {
            const isCompleted = progress > step.min + 15;
            const isActive = progress >= step.min && progress < step.min + 15;

            return (
              <div key={idx} className={`flex items-center gap-6 transition-all duration-500 ${!isActive && !isCompleted ? 'opacity-20 grayscale' : 'opacity-100'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted ? 'bg-primary border-primary shadow-[0_0_15px_rgba(0,255,120,0.4)]' : 
                  isActive ? 'border-primary animate-pulse' : 
                  'border-white/10'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                </div>
                <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${
                  isCompleted ? 'text-primary' : 
                  isActive ? 'text-white' : 
                  'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {progress === 100 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0b0d11]/95 backdrop-blur-3xl z-20 flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-40 h-40 bg-primary/20 rounded-[3rem] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(0,255,120,0.2)] relative border border-primary/20"
            >
               <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-2xl pulse" />
               <CheckCircle2 className="w-24 h-24 text-primary relative z-10" />
            </motion.div>
            <h4 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">Done!</h4>
            <div className="h-1 w-12 bg-primary rounded-full mb-6 mx-auto" />
            <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-[240px]">The processing is complete. Your result is ready.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- UI Components ---

// --- Tool Components ---

const TextCaseConverter = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const applyAction = async (action: () => void) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    action();
    setLoading(false);
    playCompleteSound();
  };

  return (
    <div className="space-y-4">
      <textarea 
        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      {loading ? (
        <ProcessingAnimation toolName="Text Converter" icon={Type} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button onClick={() => applyAction(() => setText(text.toUpperCase()))} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">WAWAAIN (UPPERCASE)</button>
            <button onClick={() => applyAction(() => setText(text.toLowerCase()))} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">yaryar (lowercase)</button>
            <button onClick={() => applyAction(() => setText(text.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))))} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">Eray Kasta Weynee</button>
            <button onClick={() => applyAction(() => setText(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()))} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">Bilaawga Weynee</button>
          </div>
          <div className="flex justify-end">
            <button onClick={() => navigator.clipboard.writeText(text)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-md">
              <Copy className="w-4 h-4" /> Koobiyeey
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.trim() ? text.split(/\n+/).length : 0;

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setShowResults(true);
    playCompleteSound();
  };

  return (
    <div className="space-y-4">
      {loading ? (
        <ProcessingAnimation toolName="Word Counter" icon={Hash} />
      ) : (
        <>
          {showResults && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="bg-primary-light p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary-dark">{words}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Erayo</div>
              </div>
              <div className="bg-primary-light p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary-dark">{chars}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Xarfo</div>
              </div>
              <div className="bg-primary-light p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary-dark">{charsNoSpaces}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Xarfo bilaa Boos ah</div>
              </div>
              <div className="bg-primary-light p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-primary-dark">{paragraphs}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Baaragaraafyo</div>
              </div>
            </div>
          )}
          <textarea 
            className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
            placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (showResults) setShowResults(false);
            }}
          />
          <div className="flex justify-center">
            <button 
              onClick={handleAnalyze} 
              className="flex items-center gap-2 px-8 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Hash className="w-4 h-4" /> Tiri Erayada
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const RemoveExtraSpaces = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleRemove = async () => {
    if (!text.trim()) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setText(text.replace(/\s+/g, ' ').trim());
    setLoading(false);
    playCompleteSound();
  };

  return (
    <div className="space-y-4">
      <textarea 
        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      
      {loading ? (
        <ProcessingAnimation toolName="Space Cleaner" icon={AlignLeft} />
      ) : (
        <div className="flex justify-between items-center">
          <button 
            onClick={handleRemove} 
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors shadow-md"
          >
            <Scissors className="w-4 h-4" /> Ka saar Boosaska Dheeraadka ah
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(text)} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors text-slate-800"
          >
            <Copy className="w-4 h-4" /> Koobiyeey
          </button>
        </div>
      )}
    </div>
  );
};

const ImageToText = () => {
  const { consumeCredit, user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const extractText = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Extract all the text from this image exactly as it appears. Do not add any extra commentary.' }
          ]
        }
      });
      
      const extractedText = response.text || 'Qoraal lama helin.';
      
      await consumeCredit('image-to-text', extractedText.substring(0, 100));
      
      // Delay slightly for the animation to feel real
      await new Promise(resolve => setTimeout(resolve, 2500));
      playCompleteSound();
      setText(extractedText);
    } catch (error) {
      console.error(error);
      setText('Cillad ayaa dhacday markii la soo saarayay qoraalka. Fadlan mar kale isku day.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Guji si aad u soo geliso sawir</p>
          <p className="text-slate-400 text-sm mt-1">Waxaa la aqbalaa JPG, PNG, WEBP</p>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 h-48 flex items-center justify-center">
            <img src={image} alt="Uploaded" className="max-h-full object-contain" />
            <button 
              onClick={() => { setImage(null); setText(''); }}
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-slate-700 shadow-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
      <div className="flex justify-center">
        {loading ? (
          <ProcessingAnimation toolName="Image to Text" icon={ImageIcon} />
        ) : (
          <button 
            onClick={extractText} 
            className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg translate-y-0 active:translate-y-1"
          >
            <FileText className="w-4 h-4" /> Soo saar Qoraalka
          </button>
        )}
      </div>
        </div>
      )}
      
      {text && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-heading font-semibold text-slate-800">Qoraalka la soo saaray</h4>
            <button onClick={() => navigator.clipboard.writeText(text)} className="text-primary-dark hover:text-primary text-sm font-medium flex items-center gap-1">
              <Copy className="w-4 h-4" /> Koobiyeey
            </button>
          </div>
          <textarea 
            className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none bg-slate-50"
            value={text}
            readOnly
          />
        </div>
      )}
    </div>
  );
};

const JpgToWord = () => {
  const { consumeCredit, user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertToWord = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Extract all the text from this image exactly as it appears. Do not add any extra commentary.' }
          ]
        }
      });
      
      const text = response.text || 'No text found.';
      
      await consumeCredit('jpg-to-word', 'Converted image to Word doc');
      
      // Delay for animation
      await new Promise(resolve => setTimeout(resolve, 2500));
      playCompleteSound();

      // Create a simple blob that MS Word can open
      const blob = new Blob(['\ufeff', text], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-document.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(error);
      alert('Error converting image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {!image ? (
        <div 
          className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileImage className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Guji si aad u soo geliso JPG</p>
          <p className="text-slate-400 text-sm mt-1">U beddel sawirka qoraal ahaan dukumiinti Word ah</p>
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            accept="image/jpeg, image/jpg, image/png" 
            onChange={handleImageUpload} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-slate-100 h-48 flex items-center justify-center">
            <img src={image} alt="Uploaded" className="max-h-full object-contain" />
            <button 
              onClick={() => setImage(null)}
              className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-slate-700 shadow-sm transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
      <div className="flex justify-center">
        {loading ? (
          <ProcessingAnimation toolName="JPG to Word" icon={FileImage} />
        ) : (
          <button 
            onClick={convertToWord} 
            className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> Hadda Degso (Word)
          </button>
        )}
      </div>
        </div>
      )}
    </div>
  );
};

const TitleToImage = () => {
  const { consumeCredit, user } = useAuth();
  const [title, setTitle] = useState('');
  const [tagText, setTagText] = useState('AFFILIATE MARKETING');
  const [buttonText, setButtonText] = useState('Affiliate');
  const [bgStyle, setBgStyle] = useState('Modern 3D Niche');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backgroundOptions = [
    { value: 'Modern 3D Niche', label: 'Modern 3D Elements (Niche-Specific)' },
    { value: 'Modern Illustration', label: 'Modern Illustration (Flat/Clean)' },
    { value: 'Dark Wood Studio', label: 'Dark Wood Studio (Professional)' },
    { value: 'Modern Office', label: 'Modern Office Background' },
    { value: 'Solid Color Gradient', label: 'Solid Color Gradient' },
    { value: 'Abstract Tech', label: 'Abstract Tech/Cyber Background' }
  ];

  const generateImage = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const capitalizedTitle = title.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
      
      let bgDescription = '';
      if (bgStyle === 'Modern 3D Niche') {
        bgDescription = 'The background should be a clean, soft pastel or vibrant gradient color. The style should be modern, clean, and high-end 3D.';
      } else if (bgStyle === 'Modern Illustration') {
        bgDescription = 'A clean, modern 2D flat illustration style. Use a soft mint or pastel background. Minimalist and professional.';
      } else if (bgStyle === 'Dark Wood Studio') {
        bgDescription = 'The background should feature a dark wood-paneled wall, giving a premium studio vibe.';
      } else if (bgStyle === 'Modern Office') {
        bgDescription = 'The background should feature a high-quality, slightly blurred modern office setting.';
      } else if (bgStyle === 'Solid Color Gradient') {
        bgDescription = 'The background should be a clean, vibrant solid color gradient.';
      } else if (bgStyle === 'Abstract Tech') {
        bgDescription = 'The background should feature abstract, glowing tech elements in a dark setting.';
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Create a professional and cinematic blog post cover image with a specific layout.
        
        LAYOUT REQUIREMENTS:
        - LEFT SIDE: Place the main title "${capitalizedTitle}" prominently on the left side. Use a very bold, elegant, and highly stylized display font (similar to "Fau Fau" style - thick, modern, and high-contrast). 
        - SUBTITLE: Below the title, you may optionally add a very short, catchy one-line description that attracts readers to the topic.
        - BOTTOM LEFT: Include a small, rounded search-bar-like element with the text "hanwanag.com" and a small magnifying glass icon.
        - RIGHT SIDE: Place a large, high-quality 3D character or a thematic 3D icon (e.g., a glowing lightbulb, a 3D professional character, or niche-specific 3D elements) that represents the topic.
        - MARGINS: Ensure all elements (text, icons, search bar) are pulled away from the edges and corners of the image (safe margins).
        
        STYLE REQUIREMENTS:
        - ${bgDescription}
        - The overall composition should be clean, premium, and look exactly like a professional high-end blog cover.
        - Use a harmonious color palette (e.g., soft greens, purples, or yellows as seen in professional designs).
        - The text should have a subtle drop shadow to make it pop against the background.`,
        config: {
          imageConfig: {
            aspectRatio: "4:3",
          }
        }
      });

      await consumeCredit('blog-cover', `Generated blog cover: ${capitalizedTitle}`);
      
      // Animation delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      playCompleteSound();
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error generating image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResizedImage = () => {
    if (!imageUrl) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 570;
      canvas.height = 445;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw image stretched/cropped to fit 570x445
        ctx.drawImage(img, 0, 0, 570, 445);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `blog-cover-${Date.now()}.png`;
        link.click();
      }
    };
    img.src = imageUrl;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Category Tag (Overlay-ga bidixda sare)</label>
          <input 
            type="text"
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="tusaale, AFFILIATE MARKETING"
            value={tagText}
            onChange={(e) => setTagText(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Button Text (Overlay-ga midigta sare)</label>
          <input 
            type="text"
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="tusaale, Affiliate"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Cinwaanka Guud / Mawduuca</label>
        <input 
          type="text"
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          placeholder='tusaale, "Noloshu waa halgan"'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateImage()}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">Nuuca Background-ka</label>
        <select 
          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          value={bgStyle}
          onChange={(e) => setBgStyle(e.target.value)}
        >
          {backgroundOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      
      <div className="flex justify-center pt-2">
        {loading ? (
          <ProcessingAnimation toolName="Cover Generator" icon={Wand2} />
        ) : (
          <button 
            onClick={generateImage} 
            disabled={!title.trim()}
            className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
          >
            <Wand2 className="w-4 h-4" /> Diyaari Sawirka
          </button>
        )}
      </div>

      {imageUrl && (
        <div className="mt-8 space-y-4">
          <h4 className="font-heading font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            Sawirka Cover-ka (570x445)
          </h4>
          
          <div className="p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
            <div className="relative aspect-[570/445] rounded-[2rem] overflow-hidden border border-white shadow-2xl group max-w-[570px] mx-auto">
              <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40" />
              
              {tagText && (
                <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  {tagText}
                </div>
              )}
              {buttonText && (
                <div className="absolute top-6 right-6 bg-secondary/90 backdrop-blur-md text-primary text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg">
                  <ExternalLink className="w-3.5 h-3.5" /> {buttonText}
                </div>
              )}
              <div className="absolute bottom-6 left-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-white font-bold text-xl leading-tight drop-shadow-md">
                  {title}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={downloadResizedImage}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Degso Sawirka (570x445)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BackgroundGenerator = () => {
  const { consumeCredit, user } = useAuth();
  const [colorTheme, setColorTheme] = useState('Soft Pastel Blue');
  const [bgStyle, setBgStyle] = useState('Soft Gradient');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const colorOptions = [
    { name: 'Soft Pastel Blue', value: 'soft pastel blue and white' },
    { name: 'Elegant Purple', value: 'elegant deep purple and lavender' },
    { name: 'Vibrant Orange', value: 'vibrant orange and soft yellow' },
    { name: 'Mint Green', value: 'fresh mint green and light teal' },
    { name: 'Minimalist Gray', value: 'minimalist light gray and silver' },
    { name: 'Royal Gold', value: 'royal gold and deep cream' },
  ];

  const styleOptions = [
    { name: 'Soft Gradient', value: 'a smooth, soft linear gradient' },
    { name: 'Mesh Gradient', value: 'a modern, organic mesh gradient with fluid shapes' },
    { name: 'Abstract Waves', value: 'minimalist abstract waves and flowing lines' },
    { name: 'Geometric Shapes', value: 'subtle, large geometric shapes with soft shadows' },
    { name: 'Clean Minimalist', value: 'a very clean, minimalist solid-feeling background with subtle texture' },
  ];

  const generateBackground = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Create a professional, high-end minimalist background for a blog or website.
        
        STYLE: ${styleOptions.find(s => s.name === bgStyle)?.value}.
        COLORS: ${colorOptions.find(c => c.name === colorTheme)?.value}.
        
        REQUIREMENTS:
        - The background must be clean, professional, and minimalist.
        - NO text, NO people, NO recognizable objects.
        - It should be perfect as a backdrop for a blog post or a YouTube thumbnail.
        - High-quality, smooth transitions, and premium aesthetic.
        - Ensure it looks modern and sophisticated.`,
        config: {
          imageConfig: {
            aspectRatio: "4:3",
          }
        }
      });

      await consumeCredit('background-gen', `Generated ${bgStyle} background with ${colorTheme}`);
      
      // Animation delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      playCompleteSound();
      
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setImageUrl(`data:image/png;base64,${base64EncodeString}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error generating background. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResizedImage = () => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 570;
      canvas.height = 445;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, 570, 445);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `background-${Date.now()}.png`;
        link.click();
      }
    };
    img.src = imageUrl;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Midabka (Color Theme)</label>
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => setColorTheme(opt.name)}
                className={`p-2 text-[10px] font-bold rounded-lg border transition-all ${
                  colorTheme === opt.name 
                    ? 'bg-primary text-white border-primary shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Nuuca Background-ka</label>
          <select 
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
            value={bgStyle}
            onChange={(e) => setBgStyle(e.target.value)}
          >
            {styleOptions.map(opt => (
              <option key={opt.name} value={opt.name}>{opt.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex justify-center pt-2">
        {loading ? (
          <ProcessingAnimation toolName="Background Gen" icon={Palette} />
        ) : (
          <button 
            onClick={generateBackground} 
            className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md translate-y-0 active:translate-y-1"
          >
            <Wand2 className="w-4 h-4" /> Diyaari Background-ka
          </button>
        )}
      </div>

      {imageUrl && (
        <div className="mt-8 space-y-4">
          <h4 className="font-heading font-semibold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            Background-ka la diyaariyay (570x445)
          </h4>
          
          <div className="p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner">
            <div className="relative aspect-[570/445] rounded-[2rem] overflow-hidden border border-white shadow-2xl max-w-[570px] mx-auto">
              <img src={imageUrl} alt="Generated Background" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={downloadResizedImage}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" /> Degso Background-ka (570x445)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PdfToExcelNames = () => {
  const { consumeCredit, user } = useAuth();
  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');
    
    if (pdfFiles.length > 0) {
      const newFiles = pdfFiles.map(f => ({
        id: `${f.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: f
      }));
      setFiles(prev => [...prev, ...newFiles]);
    } else if (selectedFiles.length > 0) {
      alert('Please upload valid PDF files.');
    }
  };

  const processPdfs = async () => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const newData: Record<string, string[]> = { ...extractedData };
      
      for (const { id, file } of files) {
        if (newData[id]) continue;
        
        const reader = new FileReader();
        const loadPromise = new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        
        const base64Content = await loadPromise;
        const prompt = "Extract all individual names from the column explicitly labeled 'HHNAMES' in this PDF document. Return ONLY the names, one per line. Do not include headers, numbers, or any other text. If no names are found, return nothing.";

        try {
          const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
              parts: [
                { inlineData: { data: base64Content, mimeType: "application/pdf" } },
                { text: prompt }
              ]
            }
          });

          const responseText = result.text || '';
          const names = responseText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
          
          await consumeCredit('pdf-to-names', `Extracted ${names.length} names from ${file.name}`);
          
          playCompleteSound();

          newData[id] = names;
          setExtractedData(JSON.parse(JSON.stringify(newData))); 
        } catch (apiError: any) {
          if (apiError.message?.includes('RESOURCE_EXHAUSTED') || (apiError.status === 429)) {
            const retryAfterMsg = "You've reached your Gemini API quota. If you have a paid Google Cloud project or a higher-tier API key, you can switch to it using the button below.";
            alert(retryAfterMsg);
            break;
          }
          throw apiError;
        }
      }
    } catch (error) {
      console.error(error);
      alert('Error extracting names from PDF. Please ensure the PDF is readable and try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    const ids = Object.keys(extractedData);
    if (ids.length === 0) return;

    const workbook = XLSX.utils.book_new();
    
    ids.forEach(id => {
      const fileEntry = files.find(f => f.id === id);
      if (!fileEntry) return;

      const fileName = fileEntry.file.name;
      const names = extractedData[id];
      const data = names.map(name => ({ HHNAMES: name }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      let sheetName = fileName.replace(/\.pdf$/i, '').substring(0, 31).replace(/[\[\]\*\?\/\\]/g, '');
      if (!sheetName) sheetName = "Sheet";
      
      let finalName = sheetName;
      let counter = 1;
      while (workbook.SheetNames.includes(finalName)) {
        finalName = `${sheetName.substring(0, 28)}_${counter++}`;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, finalName);
    });
    
    XLSX.writeFile(workbook, `Extracted_HHNAMES_${Date.now()}.xlsx`);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    const nextData = { ...extractedData };
    delete nextData[id];
    setExtractedData(nextData);
  };

  const totalNames = (Object.values(extractedData) as string[][]).reduce((sum, names) => sum + names.length, 0);

  return (
    <div className="space-y-6">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
          files.length > 0 ? 'border-primary bg-primary-light/30' : 'border-slate-300 hover:border-primary hover:bg-slate-50'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".pdf"
          multiple
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${files.length > 0 ? 'text-primary' : 'text-slate-400'}`} />
          <h3 className="font-heading font-semibold text-slate-800">
            {files.length > 0 ? `${files.length} fayl oo PDF ah ayaa la doortay` : "Guji si aad u soo geliso PDF-yada"}
          </h3>
          <p className="text-sm text-slate-500 mt-2">Cabbirka ugu badan: 10MB halkii fayl</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Faylasha la doortay:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {files.map((fEntry) => (
              <div key={fEntry.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary transition-colors">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-slate-700 truncate">{fEntry.file.name}</span>
                  {extractedData[fEntry.id] && (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  )}
                </div>
                {!loading && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(fEntry.id); }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        {loading ? (
          <ProcessingAnimation toolName="Name Extractor" icon={FileSpreadsheet} />
        ) : (
          <>
            <button 
              onClick={processPdfs}
              disabled={files.length === 0}
              className="px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md"
            >
              <Wand2 className="w-5 h-5" /> Soo saar Magacyada
            </button>
            
            {Object.keys(extractedData).length > 0 && (
              <button 
                onClick={downloadExcel}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md"
              >
                <Download className="w-5 h-5" /> Degso Faylka Excel-ka ah
              </button>
            )}
          </>
        )}
      </div>

      {totalNames > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center border-t border-slate-200 pt-6">
            <h4 className="font-heading font-semibold text-slate-800">
              Natiijada Guud ({totalNames} magacyo ayaa laga helay {Object.keys(extractedData).length} fayl)
            </h4>
          </div>
          <div className="space-y-6">
            {(Object.entries(extractedData) as [string, string[]][]).map(([fileId, names]) => {
              const fileEntry = files.find(f => f.id === fileId);
              return (
                <div key={fileId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-sm font-semibold text-slate-700">{fileEntry?.file.name || "Fayl aan la aqoon"}</span>
                    <span className="text-xs text-slate-400">({names.length} magac)</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 max-h-40 overflow-y-auto shadow-inner">
                    <ul className="space-y-1">
                      {names.slice(0, 50).map((name, i) => (
                        <li key={`${fileId}-name-${i}`} className="text-sm text-slate-700 flex items-center gap-2">
                          <span className="text-slate-400 font-mono text-xs">{i + 1}.</span>
                          {name}
                        </li>
                      ))}
                      {names.length > 50 && (
                        <li className="text-sm text-slate-500 italic px-6">Iyo {names.length - 50} kale...</li>
                      )}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const PdfToJpg = () => {
  const [loading, setLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setShowStatus(true);
    playCompleteSound();
  };

  return (
    <div className="space-y-4 text-center py-4">
      {loading ? (
        <ProcessingAnimation toolName="PDF to JPG" icon={FileBox} />
      ) : showStatus ? (
        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-slate-800">Dhawaan ayaan soo kordhinaynaa!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Habkan waxa uu u baahan yahay nidaam dhinaca backend-ka ah oo aad u xooggan, dhawaan ayaana la soo kordhin doonaa inshaa Allah.
          </p>
          <button 
            onClick={() => setShowStatus(false)}
            className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition-colors"
          >
            Ku laabo
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-slate-200 shadow-inner">
            <FileBox className="w-10 h-10 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading font-bold text-xl text-secondary">U beddel PDF sawirro (JPG)</h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              Si fudud bogagga PDF-ka uga dhig sawirro tayo sare leh oo aad meel walba ku isticmaali karto.
            </p>
          </div>
          <div 
            className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-all cursor-pointer group"
            onClick={handleConvert}
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3 group-hover:text-primary transition-colors" />
            <p className="text-slate-600 font-bold">Guji si aad u soo geliso PDF</p>
            <p className="text-slate-400 text-xs mt-1">U beddel JPG ahaan</p>
          </div>
          <button 
            onClick={handleConvert}
            className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2 mx-auto"
          >
            <Zap className="w-4 h-4" /> Hadda tijaabi
          </button>
        </div>
      )}
    </div>
  );
};

const tools = [
  { 
    id: 'text-case', 
    name: 'Beddelaha Qoraalka', 
    icon: Type, 
    description: 'U beddel qoraalkaaga far waawein, far yaryar, ama bilawga oo keliya.', 
    component: TextCaseConverter,
    category: 'TEXT TOOLS',
    buttonText: 'Beddel',
    color: 'orange'
  },
  { 
    id: 'word-counter', 
    name: 'Tirinta Erayada', 
    icon: Hash, 
    description: 'Tiri erayada, xarfaha, iyo cutubyada qoraalkaaga.', 
    component: WordCounter,
    category: 'ANALYSIS',
    buttonText: 'Tiri',
    color: 'pink'
  },
  { 
    id: 'remove-spaces', 
    name: 'Sifeeyaha Boosaska', 
    icon: AlignLeft, 
    description: 'Nadiifi qoraalkaaga adigoo ka saaraya boosaska dheeraadka ah.', 
    component: RemoveExtraSpaces,
    category: 'TEXT TOOLS',
    buttonText: 'Sifeey',
    color: 'amber'
  },
  { 
    id: 'image-to-text', 
    name: 'Sawir u beddel Qoraal', 
    icon: FileText, 
    description: 'Ka soo saar qoraalka sawirada adigoo isticmaalaya AI.', 
    component: ImageToText,
    category: 'AI VISION',
    buttonText: 'Soo saar',
    color: 'purple'
  },
  { 
    id: 'jpg-to-word', 
    name: 'JPG u beddel Word', 
    icon: FileImage, 
    description: 'U beddel sawirka qoraalka leh si toos ah dukumiinti Word ah.', 
    component: JpgToWord,
    category: 'CONVERSION',
    buttonText: 'Beddel',
    color: 'orange'
  },
  { 
    id: 'title-to-image', 
    name: 'Sameeyaha Cover-ka', 
    icon: ImagePlus, 
    description: 'U sameey cover qurux badan blog-kaaga adigoo cinwaan siinaya.', 
    component: TitleToImage,
    category: 'DESIGN',
    buttonText: 'Sameey',
    color: 'pink'
  },
  { 
    id: 'background-generator', 
    name: 'Background Generator', 
    icon: Palette, 
    description: 'U sameey background-yo heer sare ah blog-kaaga ama mareegtaada.', 
    component: BackgroundGenerator,
    category: 'DESIGN',
    buttonText: 'Sameey',
    color: 'amber'
  },
  { 
    id: 'pdf-to-names', 
    name: 'PDF Name Extractor', 
    icon: FileSpreadsheet, 
    description: 'Ka soo saar magacyada (HHNAMES) PDF-yada adigoo u beddelaya Excel.', 
    component: PdfToExcelNames,
    category: 'AI DATA',
    buttonText: 'Soo saar',
    color: 'purple'
  },
  { 
    id: 'pdf-to-jpg', 
    name: 'PDF u beddel JPG', 
    icon: FileBox, 
    description: 'U beddel bogagga PDF-ka sawiro JPG ah oo tayo sare leh.', 
    component: PdfToJpg,
    category: 'DOCUMENT',
    buttonText: 'Beddel',
    color: 'orange'
  }
];

// --- Auth Components ---
const AuthModal = ({ isOpen, onClose, initialMode = 'login' }: { isOpen: boolean, onClose: () => void, initialMode?: 'login' | 'signup' | 'forgot' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { loading: authLoading, resetPassword, signInWithGoogle, signInWithGithub } = useAuth();

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsAuthLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      // Auto close after successful login
      onClose();
    } catch (error: any) {
      console.error('Email login error:', error);
      let message = 'Cillad ayaa dhacday markii aad isku dayday inaad gasho.';
      if (error.code === 'auth/user-not-found') message = 'Email-kan laguma helin xogta.';
      else if (error.code === 'auth/wrong-password') message = 'Password-kaagu waa khalad.';
      else if (error.code === 'auth/invalid-email') message = 'Email-ka aad gelisay ma saxna.';
      else if (error.code === 'auth/operation-not-allowed') message = 'Nidaamka Email/Password laguma fasaxin Console-ka.';
      else if (error.code === 'auth/network-request-failed') message = 'Hubi internet-kaaga.';
      alert(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleManualSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      alert('Fadlan buuxi dhammaan meelaha banaan.');
      return;
    }
    setIsAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await new Promise(resolve => setTimeout(resolve, 500));
      await updateProfile(userCredential.user, { displayName: username });
      // Redirect to verification prompt or handled by App state
      onClose();
    } catch (error: any) {
      console.error('Email signup error:', error);
      let message = 'Cillad ayaa dhacday markii aad is diiwaangelinaysay.';
      if (error.code === 'auth/email-already-in-use') message = 'Email-kan horey ayaa loo isticmaalay.';
      else if (error.code === 'auth/weak-password') message = 'Password-kaagu waa inuu ugu yaraan ka koobnaadaa 6 xaraf.';
      else if (error.code === 'auth/operation-not-allowed') message = 'Nidaamka is-diiwaangelinta Email/Password laguma fasaxin Firebase Console-ka.';
      else if (error.code === 'auth/invalid-email') message = 'Email-ka aad gelisay ma saxna.';
      alert(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsAuthLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (error: any) {
      alert('Cillad ayaa dhacday: ' + error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') await signInWithGoogle();
      else await signInWithGithub();
      onClose();
    } catch (error: any) {
      console.error('Social login error:', error);
      if (error.code !== 'auth/popup-closed-by-user') {
        alert('Cillad ayaa dhacday markii la isku dayay in la is diiwaangeliyo.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-secondary/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="relative w-full max-w-[440px] bg-[#161a22] rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden border border-primary/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-12">
          {/* Modal Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)]">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-black text-3xl text-white tracking-tighter uppercase">
              {authMode === 'login' ? 'Ku Soo Gal' : authMode === 'signup' ? 'Is Diiwaangeli' : 'Beddel Password-ka'}
            </h3>
            <p className="text-slate-500 mt-3 font-bold text-sm">
              {authMode === 'login' ? 'Geli xogtaada si aad u isticmaasho AI-ga' : authMode === 'signup' ? 'Ku biir kumannaan isticmaale maanta' : 'Geli email-kaaga si aad password u beddesho'}
            </p>
          </div>

          {authMode === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {resetSent ? (
                <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                   <p className="text-primary font-black text-sm uppercase tracking-widest">Email waa la diray!</p>
                   <p className="text-slate-400 text-xs mt-2 font-bold">Hubi sanduuqaaga (Inbox) si aad u hesho link-ga.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email-kaaga</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:border-primary focus:ring-0 transition-all font-bold placeholder:text-slate-700 shadow-inner" 
                      placeholder="tusaale@gmail.com"
                      required
                    />
                  </div>
                  <button className="w-full py-4 bg-primary hover:bg-primary-dark text-black rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-lg">
                    {isAuthLoading ? 'Waa la dirayaa...' : 'Soo dir Link-ga'}
                  </button>
                </>
              )}
              <button 
                type="button"
                onClick={() => { setAuthMode('login'); setResetSent(false); }}
                className="w-full text-slate-500 font-bold text-sm hover:text-white transition-colors"
              >
                Ku laabo Login
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={authMode === 'login' ? handleManualLogin : handleManualSignup} className="space-y-5">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Magacaaga</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:border-primary focus:ring-0 transition-all font-bold placeholder:text-slate-700 shadow-inner" 
                      placeholder="Dahir Ali"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email-kaaga</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:border-primary focus:ring-0 transition-all font-bold placeholder:text-slate-700 shadow-inner" 
                    placeholder="tusaale@gmail.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password-kaaga</label>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setAuthMode('forgot')}
                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        Ma ilowday?
                      </button>
                    )}
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] text-white focus:border-primary focus:ring-0 transition-all font-bold placeholder:text-slate-700 shadow-inner" 
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className="w-full py-5 bg-primary hover:bg-primary-dark disabled:bg-slate-700 text-black rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(0,255,120,0.2)]"
                >
                  {isAuthLoading ? 'Waa la shaqaynayaa...' : (authMode === 'login' ? 'Soo Gal' : 'Abuur Account')}
                </button>
              </form>

              <div className="relative my-10 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-6 bg-[#161a22] text-[10px] font-black text-slate-500 uppercase tracking-widest">Ama ku raaxayso</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                  Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('github')}
                  className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-sm font-bold text-slate-500">
                  {authMode === 'login' ? "Account ma haysatid?" : "Account horey ma u lahayd?"}
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="ml-3 text-primary font-black uppercase tracking-widest hover:underline"
                  >
                    {authMode === 'login' ? 'Is diiwaangeli' : 'Soo gal'}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const VerificationPrompt = () => {
  const { verifyEmail } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await verifyEmail();
      setSent(true);
      setTimeout(() => setSent(false), 30000); // 30s cooldown
    } catch (e) {
      alert('Error: ' + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100 p-3">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-800 font-medium">
            Fadlan hubi email-kaaga oo xaqiiji account-kaaga si aad u sii waddo isticmaalka.
          </p>
        </div>
        <button 
          onClick={handleResend}
          disabled={sent || loading}
          className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
        >
          {loading ? 'Dirayaa...' : sent ? 'Waa la soo diray (30s)' : 'Hadda Dir'}
        </button>
      </div>
    </div>
  );
};

const UserDashboard = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { user, userData } = useAuth();
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0b0d11]/80 backdrop-blur-xl"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="relative w-full max-w-2xl bg-[#161a22] rounded-[3rem] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden border border-primary/20"
      >
        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)]">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
               <h3 className="font-heading font-black text-2xl text-white uppercase tracking-tighter">Profile-kaaga</h3>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Dashboard-ka Account-ka</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=00ff78&color=000&bold=true`} 
              className="w-24 h-24 rounded-3xl border-4 border-white/10 shadow-2xl relative z-10 transition-transform group-hover:scale-105"
              alt="Avatar"
            />
            <div className="text-center sm:text-left space-y-3 relative z-10">
              <h4 className="text-3xl font-black text-white tracking-tighter">{user.displayName || 'User'}</h4>
              <p className="text-slate-500 flex items-center gap-2 justify-center sm:justify-start font-bold text-sm">
                <Mail className="w-4 h-4 text-primary" /> {user.email}
              </p>
              <div className="flex gap-3 pt-2 justify-center sm:justify-start">
                <span className="px-4 py-1.5 bg-primary text-black text-[10px] font-black rounded-full uppercase tracking-[0.2em]">
                  Unlimited Member
                </span>
                {user.emailVerified ? (
                  <span className="px-4 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-green-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Xaqiijisan
                  </span>
                ) : (
                   <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full uppercase tracking-[0.2em] border border-amber-500/20">
                    Aan Xaqiijisnayn
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-primary/20 transition-all">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.05)]">
                <Zap className="w-7 h-7" />
              </div>
              <div className="text-4xl font-black text-white tracking-tighter mb-1">{userData?.totalUsage || 0}</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wadarta Isticmaalka</div>
            </div>
            <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex flex-col items-center text-center group hover:border-primary/20 transition-all">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.05)]">
                <Shield className="w-7 h-7" />
              </div>
              <div className="text-xl font-black text-white uppercase tracking-widest mb-1 italic">Noloshaada</div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bilaash Ah</div>
            </div>
          </div>
        </div>

        <div className="p-10 bg-white/5 border-t border-white/5 text-center">
           <p className="text-primary font-black text-xs uppercase tracking-[0.4em] animate-pulse">
             Powered by Dualeaditools AI
           </p>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const { user, userData, isAdmin, trialCount, loading: authLoading } = useAuth();
  const [activeTool, setActiveTool] = useState<typeof tools[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const faqs = [
    { q: "Miyaan isticmaali karaa qalabkan si lacag la'aan ah?", a: "Haa, dhammaan agabka Dualeaditools waa 100% bilaash. Ma jirto qidmad ama lacag qarsoon." },
    { q: "Sideen u bilaabi karaa isticmaalka?", a: "Kaliya is-diiwaangeli si aad u abuurto account, waxaadna heli doontaa fursad aad ku isticmaasho dhammaan AI tools-ka adigoon wax xadidaad ah lahayn." },
    { q: "Xogtaydu miyay ammaan tahay?", a: "Xaqiiqdii. Wax walba waxaan ku dhex shaqaynaa browser-kaaga ama si ammaan ah ayaan API ugu dirnaa, marnaba ma kaydinno faylashaada ama qoraalkaaga." },
    { q: "Ma u baahanahay inaan account furtay?", a: "Haa, si aad u isticmaasho agabka AI-ga qaarkood, waxaad u baahan tay inaad ku soo gasho account-kaaga si aan u hubino nidaamka shaqada." }
  ];

  const openAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      {/* Top Banner for Verification */}
      {user && !user.emailVerified && user.providerData[0].providerId === 'password' && (
        <VerificationPrompt />
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0b0d11]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <span className="font-heading font-black text-2xl tracking-tighter text-white">Dualeaditools</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-10">
              <a href="#home" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Home</a>
              <a href="#how-it-works" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">How It Works</a>
              <a href="#tools" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">Tools</a>
              <a href="#faq" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsDashboardOpen(true)}
                    className="flex items-center gap-3 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                  >
                    <img 
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`} 
                      alt={user.displayName || ''} 
                      className="w-8 h-8 rounded-full border border-primary/20"
                    />
                    <span className="text-sm font-bold text-white truncate max-w-[100px]">
                      {user.displayName?.split(' ')[0]}
                    </span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white/5 rounded-full"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => openAuth('login')}
                    className="text-sm font-bold text-white hover:text-primary transition-colors"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuth('signup')}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-black rounded-xl text-sm font-black transition-all shadow-[0_0_20px_rgba(0,255,120,0.3)] active:scale-95"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden bg-[#161a22] border-b border-white/5 overflow-hidden"
              >
                <div className="px-4 pt-2 pb-6 space-y-1">
                  <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-black text-slate-400 hover:text-primary hover:bg-white/5 uppercase tracking-widest transition-all">Home</a>
                  <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 rounded-2xl text-base font-black text-slate-400 hover:text-primary hover:bg-white/5 uppercase tracking-widest transition-all">Tools</a>
                  {user ? (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-white/5 mt-4 pt-4">
                      <span className="text-primary font-black text-xs uppercase tracking-widest">Unlimited Free</span>
                      <button onClick={handleLogout} className="text-rose-500 font-bold text-sm">Logout</button>
                    </div>
                  ) : (
                    <button onClick={() => openAuth('login')} className="w-full text-left px-4 py-3 text-primary font-black uppercase tracking-widest">Login</button>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative pt-16 pb-24 lg:pt-32 lg:pb-48 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              {/* Left Column Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl mb-8">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">Next-Gen AI Platform</span>
                </div>

                <h1 className="font-heading text-6xl sm:text-7xl font-black text-white leading-[1.05] tracking-tighter mb-8">
                  Let AI Create <br />
                  Content <span className="text-primary scribble">20X Faster</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                  Generate copy on-the-spot & create engaging content 20X faster. Save energy and hours of time with Dualeaditools.
                </p>

                <div className="flex flex-col sm:flex-row gap-5 mb-16">
                  <button 
                    onClick={() => openAuth('signup')}
                    className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-black text-black bg-primary hover:bg-[#00e069] rounded-[2rem] transition-all shadow-[0_20px_40px_rgba(0,255,120,0.2)] active:scale-95"
                  >
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </button>
                  <a href="#how-it-works" className="inline-flex items-center justify-center gap-3 px-10 py-5 text-base font-black text-white bg-white/5 border border-white/10 hover:bg-white/10 rounded-[2rem] transition-all">
                    Book A Demo
                  </a>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-10">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white tracking-tighter">12,000+</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Current Users</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <Star className="w-5 h-5 text-primary fill-primary" />
                       <div className="text-3xl font-black text-white tracking-tighter">99%</div>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Satisfaction Rate</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Dashboard Preview Mockup */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="relative"
              >
                {/* Floating Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-[100px] -z-10" />
                <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-blue-500/20 rounded-full blur-[120px] -z-10" />

                <div className="relative bg-[#161a22] rounded-[2.5rem] p-3 shadow-2xl border border-primary/20 overflow-hidden group">
                   <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                  <div className="bg-[#0b0d11] rounded-[2rem] overflow-hidden shadow-inner relative z-10 border border-white/5">
                    <div className="p-10 space-y-10">
                      {/* Dashboard Header Mockup */}
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <h4 className="text-white font-black text-2xl tracking-tight uppercase tracking-widest">Hi creator!</h4>
                          <p className="text-slate-500 text-sm font-bold">Select a tool to begin.</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-primary/20 bg-primary/5 flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-primary" />
                        </div>
                      </div>

                      {/* Tool Categories Mockup */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-primary/20 flex flex-col items-center text-center group/card transition-all">
                          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                            <Type className="w-6 h-6 text-primary" />
                          </div>
                          <span className="font-black text-white text-[10px] uppercase tracking-widest">Writing</span>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-primary/20 flex flex-col items-center text-center transition-all">
                          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
                            <Palette className="w-6 h-6 text-primary" />
                          </div>
                          <span className="font-black text-white text-[10px] uppercase tracking-widest">Design</span>
                        </div>
                      </div>

                      {/* Processing Bar Mockup */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Processing...</span>
                           <span className="text-[10px] font-black text-primary uppercase tracking-widest">34%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="w-[34%] h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,255,120,0.8)]" />
                        </div>
                      </div>

                      {/* Steps List Mockup */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(0,255,120,0.4)]">
                            <CheckCircle2 className="w-3 h-3 text-black" />
                          </div>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">Completed</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-primary/40 animate-pulse" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating "AI MAGIC" Pill */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -left-6 px-5 py-2 bg-black border border-white/10 rounded-full shadow-2xl z-20 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">AI MAGIC ENABLED</span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Trusted By Section (Logo Cloud) */}
        <section className="py-20 border-t border-white/5 bg-[#0b0d11]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <p className="text-sm font-black text-slate-500 uppercase tracking-[0.2em] mb-12">Trusted & Rated By 1,000+ Teams Globally</p>
             <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-50 contrast-0 invert">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                   <span className="font-heading font-black text-xl tracking-tight text-white">SchedulePress</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">T</div>
                   <span className="font-heading font-black text-xl tracking-tight text-white">templately</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                   <span className="font-heading font-black text-xl tracking-tight text-white">easy.jobs</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                   <span className="font-heading font-black text-xl tracking-tight text-white">NotificationX</span>
                </div>
             </div>
          </div>
        </section>

        {/* Tools Showcase */}
        <section id="tools" className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d11] via-[#161a22] to-[#0b0d11]" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl mb-6">
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">POWERFUL TOOLS</span>
              </div>
              <h2 className="font-heading text-4xl sm:text-5xl font-black text-white mb-6">Agab xooggan oo farahaaga ku jira</h2>
              <p className="text-slate-400 max-w-xl mx-auto font-medium">Guji qalab kasta oo hoos ku yaal si aad isla markiiba u isticmaasho. Shaqadaada ku fududee agabka AI-ga ugu casrisan.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {tools.map((tool, index) => {
                const colorMap = {
                   orange: {
                    gradient: 'from-primary/40 to-primary/10',
                    shadow: 'shadow-primary/20',
                    border: 'border-primary/30',
                    text: 'text-primary',
                    bg: 'bg-primary/5',
                    glow: 'shadow-[0_0_40px_rgba(0,255,120,0.15)]'
                  },
                  pink: {
                    gradient: 'from-primary/40 to-primary/10',
                    shadow: 'shadow-primary/20',
                    border: 'border-primary/30',
                    text: 'text-primary',
                    bg: 'bg-primary/5',
                    glow: 'shadow-[0_0_40px_rgba(0,255,120,0.15)]'
                  },
                  amber: {
                    gradient: 'from-primary/40 to-primary/10',
                    shadow: 'shadow-primary/20',
                    border: 'border-primary/30',
                    text: 'text-primary',
                    bg: 'bg-primary/5',
                    glow: 'shadow-[0_0_40px_rgba(0,255,120,0.15)]'
                  },
                  purple: {
                    gradient: 'from-primary/40 to-primary/10',
                    shadow: 'shadow-primary/20',
                    border: 'border-primary/30',
                    text: 'text-primary',
                    bg: 'bg-primary/5',
                    glow: 'shadow-[0_0_40px_rgba(0,255,120,0.15)]'
                  }
                };
                
                const theme = colorMap[tool.color as keyof typeof colorMap] || colorMap.orange;
                const stepNum = (index + 1).toString().padStart(2, '0');

                return (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveTool(tool)}
                    className="group relative cursor-pointer pt-12"
                  >
                    <div className="relative bg-[#161a22] rounded-[2.5rem] p-10 pt-16 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-primary/10 group-hover:border-primary/60 transition-all duration-500 min-h-[380px] flex flex-col items-center">
                      
                      {/* Floating Step Badge */}
                      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-[2rem] bg-gradient-to-br ${theme.gradient} flex items-center justify-center p-0.5 ${theme.glow} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 z-10 shadow-2xl border border-primary/20`}>
                        <div className="w-full h-full rounded-[1.8rem] bg-black/40 backdrop-blur-md flex items-center justify-center overflow-hidden relative">
                           <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                           <tool.icon className="w-12 h-12 text-primary drop-shadow-[0_0_20px_rgba(0,255,120,0.5)] relative z-10" />
                        </div>
                      </div>

                      <div className="absolute top-6 right-8 opacity-20 select-none">
                        <div className={`text-6xl font-black ${theme.text} leading-none tracking-tighter italic opacity-10`}>
                          {stepNum}
                        </div>
                      </div>

                      <div className="text-center space-y-4 flex-1 flex flex-col justify-center mt-6">
                        <h3 className="text-white font-black text-2xl leading-tight uppercase tracking-widest group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-bold">
                          {tool.description}
                        </p>
                      </div>

                      <div className="mt-10">
                        <div className={`px-10 py-4 rounded-[1.5rem] bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] group-hover:bg-primary group-hover:text-black group-hover:shadow-[0_0_30px_rgba(0,255,120,0.6)] transition-all flex items-center gap-3`}>
                          Bilaw Tool <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-secondary mb-4">Maxaad u dooranaysaa Dualeabditools?</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Waxaan u dhisnay madashan si aad u hesho waayo-aragnimo isticmaale oo fudud iyo waxqabad sare.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group text-center p-10 bg-[#161a22] rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all duration-300">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)] group-hover:scale-110 transition-transform">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="font-heading text-2xl font-black text-white uppercase tracking-widest mb-4">Xawaare Sare</h3>
                <p className="text-slate-400 font-bold text-sm leading-relaxed">Agabka intooda badan waxay si toos ah ugu dhex shaqeeyaan browser-kaaga, iyagoo ku siinaya natiijooyin degdeg ah.</p>
              </div>
              <div className="group text-center p-10 bg-[#161a22] rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all duration-300">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)] group-hover:scale-110 transition-transform">
                  <Shield className="w-10 h-10" />
                </div>
                <h3 className="font-heading text-2xl font-black text-white uppercase tracking-widest mb-4">Ammaanka Xogta</h3>
                <p className="text-slate-400 font-bold text-sm leading-relaxed">Xogtaadu waa ammaan. Ma kaydinno qoraalkaaga ama faylashaada ka dib markaan dhammaystirno shaqada.</p>
              </div>
              <div className="group text-center p-10 bg-[#161a22] rounded-[2.5rem] border border-white/5 hover:border-primary/30 transition-all duration-300">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)] group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10" />
                </div>
                <h3 className="font-heading text-2xl font-black text-white uppercase tracking-widest mb-4">Meel walba laga heli karaa</h3>
                <p className="text-slate-400 font-bold text-sm leading-relaxed">Wuxuu si fiican ugu shaqeeyaa computer-ka, tablet-ka, iyo mobile-ka. Looma baahna in la rakibo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section Removed */}

        {/* Testimonials */}
        <section className="py-20 bg-secondary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold mb-4">Waxaa ku kalsoon dadka xirfadlayaasha ah</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Eeg waxa ay dadka isticmaala agabkayaga ka yiraahdeen.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Sarah Jenkins", role: "Content Writer", text: "Tirinta Erayada iyo Beddelaha Qoraalka waxay iga badbaadiyaan waqti badan maalin kasta. Waa agabka aan mar walba isticmaalo." },
                { name: "Dahir Ali", role: "Student", text: "Sawir u beddel qoraalka waa mid aad u saxan. Waxay iga caawisay inaan dhammaan qoraalladaydii gacanta u beddelo digital." },
                { name: "Emily Rodriguez", role: "Marketing Manager", text: "Waa mid nadiif ah, degdeg ah, mana laha xayeysiisyo dhib leh. Dhab ahaan waa waxa loo baahan yahay." }
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors">
                  <div className="flex text-primary mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-300 mb-6">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold text-secondary mb-4">Su'aalaha Inta badan la isweydiiyo</h2>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl bg-[#161a22]">
                  <button 
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-all group"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span className="font-black text-white uppercase tracking-widest text-sm group-hover:text-primary transition-colors">{faq.q}</span>
                    {activeFaq === index ? <ChevronUp className="w-6 h-6 text-primary" /> : <ChevronDown className="w-6 h-6 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-8 pb-8 pt-2 text-slate-400 font-bold bg-[#161a22] border-t border-white/5 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-secondary border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-black">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-heading font-black text-xl text-white">Dualeaditools</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Empowering content creators and affiliate marketers with high-performance AI tools.
              </p>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Platform</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a href="#tools" className="hover:text-primary transition-colors">AI Tools</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Company</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black text-sm uppercase tracking-widest mb-8">Support</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5">
            <div className="text-sm text-slate-500 font-bold">
              &copy; {new Date().getFullYear()} Dualeaditools. Built for performance.
            </div>
            <div className="flex gap-10 text-sm font-bold text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Tool Modal */}
      <AnimatePresence>
        {activeTool && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTool(null)}
              className="absolute inset-0 bg-secondary/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#0b0d11] rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] border border-white/5"
            >
              <div className="flex items-center justify-between p-6 sm:p-10 border-b border-white/5 bg-[#161a22]">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,255,120,0.1)]">
                    <activeTool.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl font-black text-white uppercase tracking-widest">{activeTool.name}</h2>
                    <p className="text-sm text-slate-500 font-bold hidden sm:block mt-1">{activeTool.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTool(null)}
                  className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              
              <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-[#0b0d11]">
                <activeTool.component />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            initialMode={authModalMode} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDashboardOpen && (
          <UserDashboard 
            isOpen={isDashboardOpen} 
            onClose={() => setIsDashboardOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
