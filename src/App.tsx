import React, { useState, useRef } from 'react';
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
  Lock
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import * as XLSX from 'xlsx';
import { useAuth } from './contexts/AuthContext';
import { auth, signInWithPopup, signOut, googleProvider } from './lib/firebase';

// --- UI Components ---
const CreditWallet = () => {
  const { userData, isAdmin, user } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light/30 border border-primary/20 rounded-full">
      <Coins className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-bold text-primary-dark">
        {isAdmin ? 'UNLIMITED' : `${userData?.credits || 0} Credits`}
      </span>
      <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.5 bg-white rounded-md border border-slate-200 uppercase">
        {userData?.tier || 'Free'}
      </span>
    </div>
  );
};

// --- Tool Components ---

const TextCaseConverter = () => {
  const [text, setText] = useState('');
  return (
    <div className="space-y-4">
      <textarea 
        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => setText(text.toUpperCase())} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">WAWAAIN (UPPERCASE)</button>
        <button onClick={() => setText(text.toLowerCase())} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">yaryar (lowercase)</button>
        <button onClick={() => setText(text.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase()))))} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">Eray Kasta Weynee</button>
        <button onClick={() => setText(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase())} className="px-4 py-2 bg-slate-100 hover:bg-primary-light rounded-lg text-sm font-medium transition-colors text-slate-800">Bilaawga Weynee</button>
      </div>
      <div className="flex justify-end">
        <button onClick={() => navigator.clipboard.writeText(text)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-md">
          <Copy className="w-4 h-4" /> Koobiyeey
        </button>
      </div>
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.trim() ? text.split(/\n+/).length : 0;

  return (
    <div className="space-y-4">
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
      <textarea 
        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};

const RemoveExtraSpaces = () => {
  const [text, setText] = useState('');
  
  const handleRemove = () => {
    setText(text.replace(/\s+/g, ' ').trim());
  };

  return (
    <div className="space-y-4">
      <textarea 
        className="w-full h-40 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
        placeholder="Ku qor ama soo koobiyeey qoraalkaaga halkan..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-between items-center">
        <button onClick={handleRemove} className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary-light text-white rounded-lg text-sm font-medium transition-colors">
          <Scissors className="w-4 h-4" /> Ka saar Boosaska Dheeraadka ah
        </button>
        <button onClick={() => navigator.clipboard.writeText(text)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors">
          <Copy className="w-4 h-4" /> Koobiyeey
        </button>
      </div>
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
    if (!user) {
      alert('Fadlan marka hore soo gal (Login) si aad u isticmaasho AI-ga.');
      return;
    }
    
    setLoading(true);
    try {
      const success = await consumeCredit();
      if (!success) {
        alert('Credits-kaaga waa ay dhammaadeen. Fadlan cusboonaysii (Upgrade) qorshahaaga.');
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Extract all the text from this image exactly as it appears. Do not add any extra commentary.' }
          ]
        }
      });
      setText(response.text || 'Qoraal lama helin.');
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
            <button 
              onClick={extractText} 
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md hover:shadow-lg translate-y-0 active:translate-y-1"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Soo saarayaa...</>
              ) : (
                <><FileText className="w-4 h-4" /> Soo saar Qoraalka</>
              )}
            </button>
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
    if (!user) {
      alert('Fadlan marka hore soo gal (Login) si aad u isticmaasho AI-ga.');
      return;
    }

    setLoading(true);
    try {
      const success = await consumeCredit();
      if (!success) {
        alert('Credits-kaaga waa ay dhammaadeen. Fadlan cusboonaysii (Upgrade) qorshahaaga.');
        setLoading(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: 'Extract all the text from this image exactly as it appears. Do not add any extra commentary.' }
          ]
        }
      });
      
      const text = response.text || 'No text found.';
      
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
            <button 
              onClick={convertToWord} 
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Beddelayaa...</>
              ) : (
                <><Download className="w-4 h-4" /> Hadda Degso (Word)</>
              )}
            </button>
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
    if (!user) {
      alert('Fadlan marka hore soo gal (Login) si aad u isticmaasho AI-ga.');
      return;
    }

    setLoading(true);
    try {
      const success = await consumeCredit();
      if (!success) {
        alert('Credits-kaaga waa ay dhammaadeen. Fadlan cusboonaysii (Upgrade) qorshahaaga.');
        setLoading(false);
        return;
      }
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
        <button 
          onClick={generateImage} 
          disabled={loading || !title.trim()}
          className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Diyaarinta...</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Diyaari Sawirka</>
          )}
        </button>
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
    if (!user) {
      alert('Fadlan marka hore soo gal (Login) si aad u isticmaasho AI-ga.');
      return;
    }

    setLoading(true);
    try {
      const success = await consumeCredit();
      if (!success) {
        alert('Credits-kaaga waa ay dhammaadeen. Fadlan cusboonaysii (Upgrade) qorshahaaga.');
        setLoading(false);
        return;
      }
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
        <button 
          onClick={generateBackground} 
          disabled={loading}
          className="px-6 py-2 bg-primary hover:bg-primary-dark disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md translate-y-0 active:translate-y-1"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Diyaarinta...</>
          ) : (
            <><Wand2 className="w-4 h-4" /> Diyaari Background-ka</>
          )}
        </button>
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
    if (!user) {
      alert('Fadlan marka hore soo gal (Login) si aad u isticmaasho AI-ga.');
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const newData: Record<string, string[]> = { ...extractedData };
      
      for (const { id, file } of files) {
        if (newData[id]) continue;
        
        const success = await consumeCredit();
        if (!success) {
          alert('Credits-kaaga waa ay dhammaadeen. Fadlan cusboonaysii (Upgrade) qorshahaaga.');
          break;
        }

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
        <button 
          onClick={processPdfs}
          disabled={files.length === 0 || loading}
          className="px-8 py-3 bg-primary hover:bg-primary-dark disabled:bg-slate-300 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Shaqaynaya...</>
          ) : (
            <><Wand2 className="w-5 h-5" /> Soo saar Magacyada</>
          )}
        </button>
        
        {Object.keys(extractedData).length > 0 && (
          <button 
            onClick={downloadExcel}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md"
          >
            <Download className="w-5 h-5" /> Degso Faylka Excel-ka ah
          </button>
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
  return (
    <div className="space-y-4 text-center py-8">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileBox className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="font-heading font-semibold text-lg text-slate-800">U beddel PDF-ka sawir ahaan (JPG)</h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Qaabkan waxa uu u baahan yahay nidaam dhinaca backend-ka ah, dhawaan ayaana la soo kordhin doonaa inshaa Allah.
      </p>
      <button disabled className="mt-4 px-6 py-2 bg-slate-200 text-slate-500 rounded-lg font-medium cursor-not-allowed">
        Dhawaan Filo
      </button>
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
    bgImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'word-counter', 
    name: 'Tirinta Erayada', 
    icon: Hash, 
    description: 'Tiri erayada, xarfaha, iyo cutubyada qoraalkaaga.', 
    component: WordCounter,
    category: 'ANALYSIS',
    buttonText: 'Tiri',
    bgImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'remove-spaces', 
    name: 'Sifeeyaha Boosaska', 
    icon: AlignLeft, 
    description: 'Nadiifi qoraalkaaga adigoo ka saaraya boosaska dheeraadka ah.', 
    component: RemoveExtraSpaces,
    category: 'TEXT TOOLS',
    buttonText: 'Sifeey',
    bgImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'image-to-text', 
    name: 'Sawir u beddel Qoraal', 
    icon: ImageIcon, 
    description: 'Ka soo saar qoraalka sawirada adigoo isticmaalaya AI.', 
    component: ImageToText,
    category: 'AI VISION',
    buttonText: 'Soo saar',
    bgImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'jpg-to-word', 
    name: 'JPG u beddel Word', 
    icon: FileImage, 
    description: 'U beddel sawirka qoraalka leh si toos ah dukumiinti Word ah.', 
    component: JpgToWord,
    category: 'CONVERSION',
    buttonText: 'Beddel',
    bgImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'title-to-image', 
    name: 'Sameeyaha Cover-ka', 
    icon: Coins, 
    description: 'U sameey cover qurux badan blog-kaaga adigoo cinwaan siinaya.', 
    component: TitleToImage,
    category: 'DESIGN',
    buttonText: 'Sameey',
    bgImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'background-generator', 
    name: 'Background Generator', 
    icon: Palette, 
    description: 'U sameey background-yo heer sare ah blog-kaaga ama mareegtaada.', 
    component: BackgroundGenerator,
    category: 'DESIGN',
    buttonText: 'Sameey',
    bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'pdf-to-names', 
    name: 'PDF Name Extractor', 
    icon: FileSpreadsheet, 
    description: 'Ka soo saar magacyada (HHNAMES) PDF-yada adigoo u beddelaya Excel.', 
    component: PdfToExcelNames,
    category: 'AI DATA',
    buttonText: 'Soo saar',
    bgImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 'pdf-to-jpg', 
    name: 'PDF u beddel JPG', 
    icon: Banknote, 
    description: 'U beddel bogagga PDF-ka sawiro JPG ah oo tayo sare leh.', 
    component: PdfToJpg,
    category: 'DOCUMENT',
    buttonText: 'Beddel',
    bgImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800'
  }
];

// --- Main Application ---

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTool, setActiveTool] = useState<typeof tools[0] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Miyaan isticmaali karaa qalabkan si lacag la'aan ah?", a: "Haa, Dualeabditools waxay bixisaa 5 Credits oo bilaash ah maalin kasta oo aad ku isticmaali karto agabka AI-ga." },
    { q: "Sideen u heli karaa Credits dheeraad ah?", a: "Waxaad u baahan tahay inaad gasho (Login) si aad u hesho 5 credits ee bilaashka ah. Haddii aad u baahan tahay in kabadan, waxaad iska diiwaangelin kartaa qorshayaasha Pro ama Max." },
    { q: "Xogtaydu miyay ammaan tahay?", a: "Xaqiiqdii. Wax walba waxaan ku dhex shaqaynaa browser-kaaga ama si ammaan ah ayaan API ugu dirnaa, marnaba ma kaydinno faylashaada ama qoraalkaaga." },
    { q: "Ma u baahanahay inaan account furtay?", a: "Haa, si aad u isticmaasho agabka AI-ga (sida sawir u beddel qoraal), waxaad u baahan tahay inaad ku soo gasho Google account-kaaga." }
  ];

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
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
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight text-secondary">Dualeabditools</span>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Home</a>
              <a href="#tools" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Tools</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Pricing</a>
              
              {user ? (
                <div className="flex items-center gap-4">
                  <CreditWallet />
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                    <img 
                      src={user.photoURL || ''} 
                      alt={user.displayName || ''} 
                      className="w-8 h-8 rounded-full border border-primary/20"
                    />
                    <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  disabled={authLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <LogIn className="w-4 h-4" /> Soo gal (Login)
                </button>
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
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Home</a>
                <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Tools</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Pricing</a>
                {user ? (
                  <div className="px-3 py-2 flex items-center justify-between">
                    <CreditWallet />
                    <button onClick={handleLogout} className="text-rose-500 font-medium text-sm">Logout</button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="w-full text-left px-3 py-2 text-primary font-medium">Login</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-light via-white to-white opacity-50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-secondary tracking-tight mb-6">
                Habka ugu fudud ee <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Shaqadaada AI</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 mb-10">
                Dualeabditools waa meesha aad ka helayso agabka ugu fiican ee affiliate marketing-ka. Soo saar qoraal, diyaari cover, oo ku fududee shaqadaada AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a href="#tools" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-md hover:shadow-lg">
                  Bilaaw hadda <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-medium text-secondary bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm hover:shadow-md">
                  Wax badan ka baro
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tools Showcase */}
        <section id="tools" className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-secondary mb-4">Agab xooggan oo farahaaga ku jira</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Guji qalab kasta oo hoos ku yaal si aad isla markiiba u isticmaasho. Wax is-diiwaangalin ah looma baahna.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setActiveTool(tool)}
                  className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-slate-200 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  {/* Background Image */}
                  <img 
                    src={tool.bgImage} 
                    alt={tool.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent" />
                  
                  {/* Tag */}
                  <div className="absolute top-5 left-5 bg-primary text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {tool.category}
                  </div>
                  
                  {/* Button */}
                  <div className="absolute top-5 right-5 bg-secondary/80 backdrop-blur-md text-primary text-[10px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10 shadow-sm transition-all group-hover:bg-primary group-hover:text-white">
                    <ExternalLink className="w-3.5 h-3.5" /> {tool.buttonText}
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white group-hover:bg-primary/40 transition-colors">
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-white font-bold text-xl leading-tight">{tool.name}</h3>
                    </div>
                    <p className="text-white/70 text-sm line-clamp-2">{tool.description}</p>
                  </div>
                </motion.div>
              ))}
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
              <div className="text-center p-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="w-16 h-16 bg-primary-light/50 text-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Xawaare Sare</h3>
                <p className="text-slate-600">Agabka intooda badan waxay si toos ah ugu dhex shaqeeyaan browser-kaaga, iyagoo ku siinaya natiijooyin degdeg ah.</p>
              </div>
              <div className="text-center p-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="w-16 h-16 bg-secondary-light/20 text-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Ammaanka Xogta</h3>
                <p className="text-slate-600">Xogtaadu waa ammaan. Ma kaydinno qoraalkaaga ama faylashaada ka dib markaan dhammaystirno shaqada.</p>
              </div>
              <div className="text-center p-6 hover:translate-y-[-5px] transition-transform duration-300">
                <div className="w-16 h-16 bg-primary-light/50 text-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">Meel walba laga heli karaa</h3>
                <p className="text-slate-600">Wuxuu si fiican ugu shaqeeyaa computer-ka, tablet-ka, iyo mobile-ka. Looma baahna in la rakibo.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-secondary mb-4">Qorshayaasha Qiimaha</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">U dooro qorshaha ku habboon baahidaada shaqo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Plan */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <h3 className="font-heading text-xl font-bold text-secondary mb-2">FREE</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-secondary">$0</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> 5 Credits Maalintii
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Dhammaan Agabka (Basic)
                  </li>
                  <li className="flex items-center gap-2 text-slate-400 text-sm italic">
                    <X className="w-4 h-4" /> Usage Limited
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-slate-100 text-secondary font-bold rounded-xl hover:bg-slate-200 transition-colors">Hadda Isticmaal</button>
              </div>

              {/* Pro Plan */}
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-primary shadow-xl relative overflow-hidden group transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-6 py-1.5 rotate-45 translate-x-8 translate-y-4 uppercase tracking-widest">Popular</div>
                <h3 className="font-heading text-xl font-bold text-primary mb-2">PRO</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-secondary">$15</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> 50 Credits Maalintii
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> High Priority Processing
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Mark-ga Hub-ka oo laga saaray
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg">Ku biir Hadda</button>
              </div>

              {/* Max Plan */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-light/30 rounded-bl-[5rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                <h3 className="font-heading text-xl font-bold text-secondary mb-2">MAX</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-secondary">$49</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Unlimited Credits
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Dedicated Support
                  </li>
                  <li className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-secondary" /> Agab Cusub (Beta)
                  </li>
                </ul>
                <button className="w-full py-3 px-4 bg-secondary text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Noqo Max</button>
              </div>
            </div>
          </div>
        </section>

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
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  >
                    <span className="font-medium text-secondary">{faq.q}</span>
                    {activeFaq === index ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                      >
                        <div className="px-6 pb-4 pt-2 text-slate-600 bg-white">
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
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Coins className="w-3 h-3 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-secondary">Dualeabditools</span>
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <div className="text-sm text-slate-500 font-medium">
              &copy; {new Date().getFullYear()} Dualeabditools. Xuquuqda way dhowran tahay.
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
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light/50 text-primary-dark rounded-lg flex items-center justify-center shadow-inner">
                    <activeTool.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-secondary">{activeTool.name}</h2>
                    <p className="text-sm text-slate-500 hidden sm:block">{activeTool.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTool(null)}
                  className="p-2 text-slate-400 hover:text-secondary hover:bg-slate-200 rounded-lg transition-colors shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto">
                <activeTool.component />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
