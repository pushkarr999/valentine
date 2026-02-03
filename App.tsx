
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Step } from './types';
import { STORY_SLIDES, NO_MESSAGES, SOUND_URLS } from './constants';

const ImageWithFallback: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <div className={`${className} bg-pink-100 flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-pink-200`}>
        <span className="text-5xl animate-bounce">💖</span>
        <p className="text-xs text-pink-500 font-bold uppercase tracking-tighter">Ishita & Pushkar</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white p-2 shadow-inner group">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-pink-50/50 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-all duration-700 object-cover rounded-lg group-hover:scale-105`}
        referrerPolicy="no-referrer"
        onLoad={() => setLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.LANDING);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);
  const [yesScale, setYesScale] = useState(1);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number; emoji: string; size: number }[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const playSound = useCallback((url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.25;
    audio.play().catch(() => {});
  }, []);

  const spawnHeart = useCallback((x?: number, y?: number, forceEmoji?: string) => {
    const emojis = ['❤️', '💖', '✨', '🌸', '💘', '💕', '🥰', '🍭', '🌹'];
    const newHeart = {
      id: Math.random(),
      x: x ?? Math.random() * window.innerWidth,
      y: y ?? Math.random() * window.innerHeight,
      emoji: forceEmoji ?? emojis[Math.floor(Math.random() * emojis.length)],
      size: Math.random() * 20 + 20
    };
    setHearts(prev => [...prev.slice(-30), newHeart]); // Keep heart count manageable
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 2000);
  }, []);

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (Math.random() > 0.85) { // Spawn trail sometimes
        spawnHeart(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [spawnHeart]);

  const moveNoButton = () => {
    playSound(SOUND_URLS.pop);
  setIsShaking(true);
  setTimeout(() => setIsShaking(false), 500);

  const btnWidth = 160;
  const btnHeight = 60;
  const padding = 20;
  const maxX = window.innerWidth - btnWidth - padding * 2;
  const maxY = window.innerHeight - btnHeight - padding * 2;

  const newX = padding + Math.random() * (maxX - padding);
  const newY = padding + Math.random() * (maxY - padding);

    setNoButtonPos({ x: newX, y: newY });
    setNoCount(prev => prev + 1);
    setYesScale(prev => Math.min(prev + 0.15, 3)); // Yes button gets bigger!
    spawnHeart(newX, newY, '💨');
  };

  const handleYes = () => {
    playSound(SOUND_URLS.success);
    setStep(Step.SUCCESS);
    // Multi-wave confetti
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const nextSlide = () => {
    playSound(SOUND_URLS.click);
    if (currentSlide < STORY_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setStep(Step.QUESTION);
    }
    // Spawn a burst of hearts
    for(let i=0; i<8; i++) spawnHeart();
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-1000 bg-gradient-to-br from-[#fff5f7] via-[#ffeef2] to-[#fff5f7] bg-[length:200%_200%] animate-[gradient_15s_ease_infinite]`}
      onClick={(e) => { if((e.target as HTMLElement).tagName === 'DIV') spawnHeart(e.clientX, e.clientY); }}
    >
      {/* Background Bubbles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-pink-300 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-rose-200 rounded-full blur-3xl animate-bounce"></div>
      </div>

      {/* Floating Elements */}
      {hearts.map(heart => (
        <div 
          key={heart.id} 
          className="floating-heart fixed pointer-events-none z-[100] transition-transform duration-1000" 
          style={{ 
            left: heart.x, 
            top: heart.y, 
            fontSize: `${heart.size}px`,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Main Container with Shake logic */}
      <div 
        ref={containerRef}
        className={`max-w-md w-full bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(255,182,193,0.4)] border-4 border-white/50 z-10 text-center relative transition-all duration-300 ${isShaking ? 'shake' : ''}`}
      >
        
        {step === Step.LANDING && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-1000">
            <div className="relative inline-block">
                <div className="text-8xl mb-4 animate-bounce drop-shadow-lg">🎁</div>
                <div className="absolute -top-2 -right-2 text-3xl animate-spin-slow">✨</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-pacifico text-pink-500 drop-shadow-sm">Hi Ishita! 👑</h1>
            <p className="text-xl text-gray-600 font-medium leading-relaxed">
              Pushkar has prepared a magical journey just for you...
            </p>
            <button 
              onClick={() => { playSound(SOUND_URLS.click); setStep(Step.STORY); }}
              className="group bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-black py-5 px-14 rounded-full shadow-[0_10px_20px_rgba(244,114,182,0.4)] transition-all active:scale-90 text-2xl relative overflow-hidden"
            >
              <span className="relative z-10">Let's Begin 💖</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        )}

        {step === Step.STORY && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
            <div className="w-full h-64 md:h-72 overflow-hidden rounded-[2rem] mb-6 border-8 border-white shadow-2xl rotate-[-2deg] hover:rotate-0 transition-all duration-500 bg-gray-50 flex items-center justify-center">
               <ImageWithFallback 
                  src={STORY_SLIDES[currentSlide].imageUrl || ""} 
                  alt="Special Memory" 
                  className="w-full h-full"
               />
            </div>
            <div className="px-2">
                <div className="text-5xl mb-3 animate-[pulse_2s_infinite]">{STORY_SLIDES[currentSlide].emoji}</div>
                <h2 className="text-3xl font-bold text-gray-800 leading-tight mb-2">{STORY_SLIDES[currentSlide].text}</h2>
                <p className="text-gray-500 italic text-lg">{STORY_SLIDES[currentSlide].subtext}</p>
            </div>
            
            <div className="pt-8 flex flex-col items-center gap-6">
               <div className="flex gap-3">
                 {STORY_SLIDES.map((_, i) => (
                   <button 
                     key={i} 
                     onClick={() => { setCurrentSlide(i); playSound(SOUND_URLS.click); }}
                     className={`h-3 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-pink-500 w-12 shadow-md' : 'bg-pink-100 w-3 hover:bg-pink-200'}`} 
                   />
                 ))}
               </div>
               <button 
                onClick={nextSlide}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black py-4 px-12 rounded-2xl shadow-lg text-xl transition-all transform hover:translate-y-[-2px] active:scale-95"
              >
                {currentSlide === STORY_SLIDES.length - 1 ? "The Big Question... 💍" : "Continue Journey 🌸"}
              </button>
            </div>
          </div>
        )}

        {step === Step.QUESTION && (
          <div className="space-y-10 animate-in zoom-in duration-700">
            <div className="relative">
                <h1 className="text-4xl md:text-5xl font-pacifico text-pink-500 leading-tight animate-pulse">
                  Ishita, will you be my Valentine? 💘
                </h1>
                <div className="absolute -right-4 -top-4 text-4xl">👑</div>
            </div>

            <div className="flex gap-8 justify-center items-center flex-wrap relative" style={{ minHeight: '300px', pointerEvents: 'none' }}>
              <button 
                onClick={handleYes}
                style={{ transform: `scale(${yesScale})`, pointerEvents: 'auto' }}
                className="bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500 text-white font-black py-6 px-16 rounded-full shadow-[0_15px_30px_rgba(244,114,182,0.5)] transition-all active:scale-90 text-3xl z-20 border-b-8 border-pink-700 relative group"
              >
                <span className="relative z-10">YES! 😍</span>
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              <button 
                onMouseEnter={moveNoButton}
                onClick={moveNoButton}
                style={noCount > 0 ? {
  position: 'fixed',
  left: `${noButtonPos.x}px`,
  top: `${noButtonPos.y}px`,
  zIndex: 99999,
  pointerEvents: 'auto',
  transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
} : {
  position: 'relative',
  pointerEvents: 'auto'
}}
                className="bg-white/90 text-gray-400 font-bold py-4 px-10 rounded-full transition-all text-xl whitespace-nowrap shadow-xl border-2 border-pink-100 hover:text-pink-400 hover:border-pink-300"
              >
                {noCount === 0 ? "No 🙄" : NO_MESSAGES[Math.min(noCount - 1, NO_MESSAGES.length - 1)]}
              </button>
            </div>
          </div>
        )}

        {step === Step.SUCCESS && (
          <div className="space-y-8 animate-in zoom-in-up duration-1000">
            <div className="text-9xl animate-bounce drop-shadow-2xl">💍🤴👸</div>
            <h1 className="text-6xl font-pacifico text-pink-600 bg-clip-text">Success!</h1>
            <p className="text-2xl text-gray-700 font-bold">Ishita + Pushkar = Forever ❤️</p>
            
            <div className="p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-[2.5rem] border-4 border-white shadow-inner text-gray-600 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">❤️</div>
                <p className="italic font-black text-pink-600 text-2xl mb-3 underline decoration-wavy">Valentine Secured!</p>
                <p className="text-lg leading-relaxed font-medium">
                    Pushkar is the luckiest man alive today. He's coming to pick you up at 7:00 PM. 
                    Dress like the Queen you are, Ishita! 👑✨
                </p>
            </div>

            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => { playSound(SOUND_URLS.pop); for(let i=0; i<30; i++) setTimeout(() => spawnHeart(), i * 50); }}
                    className="bg-pink-500 text-white font-black py-4 px-8 rounded-2xl shadow-lg hover:bg-pink-600 transition-all active:scale-95 text-xl"
                >
                  Spam Love Hearts! 💖🔥
                </button>
                <p className="text-pink-400 text-sm font-bold animate-pulse">Pushkar loves you more than anything else in this world.</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Branding */}
      <div className="mt-12 flex flex-col items-center gap-2 z-10">
          <div className="flex items-center gap-3">
              <div className="h-[2px] w-8 bg-pink-200"></div>
              <p className="text-pink-400 text-sm font-black uppercase tracking-[0.4em]">Pushkar ❤️ Ishita</p>
              <div className="h-[2px] w-8 bg-pink-200"></div>
          </div>
          <p className="text-pink-300 text-xs font-medium italic">Handcrafted memories for my favorite person ✨</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default App;
