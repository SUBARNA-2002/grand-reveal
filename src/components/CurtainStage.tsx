import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const RealisticScissor = ({ isOpen, isCutting }: { isOpen: boolean, isCutting: boolean }) => {
  return (
    <div 
      className="relative w-32 h-32 -translate-x-[30%] -translate-y-[50%] pointer-events-none"
      style={{ filter: 'drop-shadow(0px 15px 12px rgba(0,0,0,0.6))' }}
    >
      <div className="w-full h-full -rotate-[135deg]">
        {/* Top Blade & Handle */}
        <motion.div 
          className="absolute inset-0 origin-[30%_50%]"
          animate={{ rotate: isCutting ? 0 : isOpen ? -30 : -8 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="bladeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#94a3b8" />
                <stop offset="50%" stopColor="#f1f5f9" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="handleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b45309" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Blade */}
            <path 
              d="M30,50 L90,44 C95,44 95,48 90,48 L30,50 Z" 
              fill="url(#bladeGradient)" 
              stroke="#475569" 
              strokeWidth="0.5"
            />
            {/* Handle */}
            <path 
              d="M30,50 C20,45 5,10 20,5 C35,0 40,30 30,50 Z" 
              fill="none" 
              stroke="url(#handleGradient)" 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Handle Grip Detail */}
            <path 
              d="M18,12 C22,10 28,15 25,22" 
              fill="none" 
              stroke="#78350f" 
              strokeWidth="1" 
              strokeLinecap="round" 
              opacity="0.5"
            />
          </svg>
        </motion.div>

        {/* Bottom Blade & Handle */}
        <motion.div 
          className="absolute inset-0 origin-[30%_50%]"
          animate={{ rotate: isCutting ? 0 : isOpen ? 30 : 8 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Blade */}
            <path 
              d="M30,50 L90,56 C95,56 95,52 90,52 L30,50 Z" 
              fill="url(#bladeGradient)" 
              stroke="#475569" 
              strokeWidth="0.5"
            />
            {/* Handle */}
            <path 
              d="M30,50 C20,55 5,90 20,95 C35,100 40,70 30,50 Z" 
              fill="none" 
              stroke="url(#handleGradient)" 
              strokeWidth="7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            {/* Handle Grip Detail */}
            <path 
              d="M18,88 C22,90 28,85 25,78" 
              fill="none" 
              stroke="#78350f" 
              strokeWidth="1" 
              strokeLinecap="round" 
              opacity="0.5"
            />
          </svg>
        </motion.div>

        {/* Pivot Screw */}
        <div className="absolute top-1/2 left-[30%] w-4 h-4 -mt-2 -ml-2 bg-slate-400 rounded-full border-2 border-slate-600 shadow-inner flex items-center justify-center">
          <div className="w-0.5 h-2.5 bg-slate-600 rotate-45" />
        </div>
      </div>
    </div>
  );
};

interface CurtainStageProps {
  key?: string;
  imageUrl: string;
  onRevealComplete: () => void;
  revealDelayMs?: number;
}

export function CurtainStage({ imageUrl, onRevealComplete, revealDelayMs = 3000 }: CurtainStageProps) {
  const [stage, setStage] = useState<'waiting' | 'cutting' | 'ribbon_cut' | 'opening' | 'revealed'>('waiting');
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHoveringRibbon, setIsHoveringRibbon] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);
  
  const playSound = (url: string, volume = 0.4) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(err => console.log('Audio play blocked:', err));
  };

  const handleCut = () => {
    if (stage !== 'waiting') return;
    
    playSound('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3', 0.6); // Scissor snip
    setStage('cutting');
    
    setTimeout(() => {
      setStage('ribbon_cut');
      
      setTimeout(() => {
        playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.5); // Curtain swoosh
        setStage('opening');
        
        // Curtains open (6s)
        setTimeout(() => {
          playSound('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3', 0.4); // Celebration sparkle
          setStage('revealed');
          onRevealComplete();
        }, 6000);
      }, 100); // Start opening almost immediately after cut
    }, 200); // 200ms cutting animation
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative w-full h-screen overflow-hidden bg-black flex items-center justify-center ${stage === 'waiting' ? 'cursor-none' : ''}`}
      style={{ perspective: '1000px' }}
    >
      
      {/* Custom Cursor */}
      {stage === 'waiting' && (
        <div 
          ref={cursorRef}
          className="fixed top-0 left-0 z-50 pointer-events-none"
          style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        >
          <RealisticScissor isOpen={isHoveringRibbon} isCutting={isClicking} />
        </div>
      )}

      {/* The Revealed Image (Background) */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center p-4 z-0"
        initial={{ scale: 0.9, opacity: 0, filter: 'brightness(0.5)' }}
        animate={{ 
          scale: stage === 'revealed' ? 1.02 : (stage === 'opening' ? 1 : 0.9), 
          opacity: stage === 'revealed' || stage === 'opening' ? 1 : 0,
          filter: stage === 'revealed' ? 'brightness(1)' : 'brightness(0.5)'
        }}
        transition={{ duration: stage === 'revealed' ? 6 : 3, ease: "easeOut" }}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          {/* Grand Frame */}
          <div className="relative p-2 bg-[#1a1a1a] rounded-sm shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] border border-[#333] max-w-[95%] max-h-[95%]">
            <div className="border-[10px] border-[#8b6b4a] p-1.5 bg-[#2a2a2a] shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
              <div className="border border-[#5a432b] p-0.5 bg-black relative group overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Revealed masterpiece" 
                  className="max-w-full max-h-[88vh] w-auto h-auto object-contain shadow-inner"
                />
                {/* Subtle glass reflection over the image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Particles / Celebration (only when opening/revealed) */}
      <AnimatePresence>
        {(stage === 'opening' || stage === 'revealed') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-amber-400 rounded-full blur-[1px]"
                initial={{ 
                  x: '50vw', 
                  y: '50vh',
                  opacity: 1,
                  scale: 0
                }}
                animate={{ 
                  x: `${50 + (Math.random() * 100 - 50)}vw`, 
                  y: `${50 + (Math.random() * 100 - 50)}vh`,
                  opacity: 0,
                  scale: Math.random() * 2 + 1
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  ease: "easeOut",
                  delay: Math.random() * 0.5
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Curtain */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full z-20 origin-top-left overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #5a0000 0%, #b30000 20%, #e60000 50%, #b30000 80%, #5a0000 100%)',
          boxShadow: 'inset -20px 0 50px rgba(0,0,0,0.8), 10px 0 30px rgba(0,0,0,0.5)',
          borderRight: '2px solid #3a0000'
        }}
        animate={
          stage === 'opening' || stage === 'revealed' 
            ? {
                scaleX: 0.1,
                skewX: -15,
                x: '-5%',
              }
            : {
                scaleX: 1,
                skewX: 0,
                x: '0%',
              }
        }
        transition={{ 
          duration: 6, ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Deep shadows for folds */}
        <div className="absolute inset-0 opacity-70 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(0,0,0,0.5)_60px,rgba(0,0,0,0.7)_75px,rgba(0,0,0,0.5)_90px,transparent_100px)]" />
        {/* Velvet highlights */}
        <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_65px,rgba(255,100,100,0.15)_75px,transparent_85px)]" />
        {/* Top to bottom gradient for stage lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
      </motion.div>

      {/* Right Curtain */}
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full z-20 origin-top-right overflow-hidden"
        style={{
          background: 'linear-gradient(-90deg, #5a0000 0%, #b30000 20%, #e60000 50%, #b30000 80%, #5a0000 100%)',
          boxShadow: 'inset 20px 0 50px rgba(0,0,0,0.8), -10px 0 30px rgba(0,0,0,0.5)',
          borderLeft: '2px solid #3a0000'
        }}
        animate={
          stage === 'opening' || stage === 'revealed' 
            ? {
                scaleX: 0.1,
                skewX: 15,
                x: '5%',
              }
            : {
                scaleX: 1,
                skewX: 0,
                x: '0%',
              }
        }
        transition={{ 
          duration: 6, ease: [0.4, 0, 0.2, 1]
        }}
      >
        {/* Deep shadows for folds */}
        <div className="absolute inset-0 opacity-70 bg-[repeating-linear-gradient(-90deg,transparent,transparent_50px,rgba(0,0,0,0.5)_60px,rgba(0,0,0,0.7)_75px,rgba(0,0,0,0.5)_90px,transparent_100px)]" />
        {/* Velvet highlights */}
        <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(-90deg,transparent,transparent_65px,rgba(255,100,100,0.15)_75px,transparent_85px)]" />
        {/* Top to bottom gradient for stage lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
      </motion.div>

      {/* Ribbon */}
      <AnimatePresence>
        {(stage === 'waiting' || stage === 'cutting' || stage === 'ribbon_cut') && (
          <motion.div 
            className="absolute top-1/2 left-0 w-full h-24 z-30 flex items-center justify-center pointer-events-none"
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {/* Left Ribbon Half */}
            <motion.div 
              className="h-16 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 w-1/2 origin-right relative"
              animate={
                stage === 'cutting' ? { scaleX: 1.02, scaleY: 0.8 } :
                (stage === 'ribbon_cut' || stage === 'opening') ? { x: '-100%', opacity: 0 } : {}
              }
              transition={{ duration: stage === 'cutting' ? 0.2 : 1, ease: "easeInOut" }}
              style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}
            >
              {/* Ribbon Texture/Sheen */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-black/10" />
            </motion.div>
            {/* Right Ribbon Half */}
            <motion.div 
              className="h-16 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 w-1/2 origin-left relative"
              animate={
                stage === 'cutting' ? { scaleX: 1.02, scaleY: 0.8 } :
                (stage === 'ribbon_cut' || stage === 'opening') ? { x: '100%', opacity: 0 } : {}
              }
              transition={{ duration: stage === 'cutting' ? 0.2 : 1, ease: "easeInOut" }}
              style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}
            >
              {/* Ribbon Texture/Sheen */}
              <div className="absolute inset-0 bg-gradient-to-l from-white/10 via-transparent to-black/10" />
            </motion.div>
            
            {/* Center Bow/Knot */}
            <motion.div 
              className="absolute w-24 h-24 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 rounded-full shadow-2xl flex items-center justify-center border-4 border-amber-400/30"
              animate={
                stage === 'cutting' ? { scale: 0.9 } :
                (stage === 'ribbon_cut' || stage === 'opening') ? { 
                  scale: 0, 
                  opacity: 0
                } : {}
              }
              transition={{ 
                duration: stage === 'cutting' ? 0.2 : 0.5, 
                ease: "easeInOut" 
              }}
            >
              <div className="w-16 h-16 border-4 border-amber-200/40 rounded-full shadow-inner" />
              <div className="absolute w-8 h-8 bg-amber-700/20 rounded-full blur-sm" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ribbon Interaction Area */}
      {stage === 'waiting' && (
        <div 
          className="absolute top-1/2 left-0 w-full h-48 -translate-y-1/2 z-40 cursor-none flex items-center justify-center group"
          onMouseEnter={() => setIsHoveringRibbon(true)}
          onMouseLeave={() => setIsHoveringRibbon(false)}
          onClick={handleCut}
        >
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium tracking-widest uppercase text-white transition-opacity whitespace-nowrap"
            style={{ opacity: isHoveringRibbon ? 1 : 0 }}
          >
            Click to Cut
          </div>
        </div>
      )}

    </motion.div>
  );
}
