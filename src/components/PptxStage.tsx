import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { init } from 'pptx-preview';

interface PptxStageProps {
  key?: string;
  pptxData: ArrayBuffer;
  onRevealComplete: () => void;
}

export function PptxStage({ pptxData, onRevealComplete }: PptxStageProps) {
  const [stage, setStage] = useState<'waiting' | 'opening' | 'revealed'>('waiting');
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const previewerRef = useRef<ReturnType<typeof init> | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides, setTotalSlides] = useState(0);
  const [slideSize, setSlideSize] = useState({ width: 960, height: 540 });

  useEffect(() => {
    const calcSize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const navHeight = 80;
      const availH = vh - navHeight;
      const aspect = 16 / 9;
      let w = vw * 0.92;
      let h = w / aspect;
      if (h > availH * 0.92) {
        h = availH * 0.92;
        w = h * aspect;
      }
      setSlideSize({ width: Math.round(w), height: Math.round(h) });
    };
    calcSize();
    window.addEventListener('resize', calcSize);
    return () => window.removeEventListener('resize', calcSize);
  }, []);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const container = previewContainerRef.current;
    container.innerHTML = '';

    const previewer = init(container, {
      width: slideSize.width,
      height: slideSize.height,
      mode: 'slide',
    });
    previewerRef.current = previewer;

    previewer.preview(pptxData).then(() => {
      setTotalSlides(previewer.slideCount);
      setCurrentSlide(1);
    });

    return () => {
      previewer.destroy();
    };
  }, [pptxData, slideSize]);

  const goNext = useCallback(() => {
    const p = previewerRef.current;
    if (!p || currentSlide >= totalSlides) return;
    p.renderNextSlide();
    setCurrentSlide(prev => prev + 1);
  }, [currentSlide, totalSlides]);

  const goPrev = useCallback(() => {
    const p = previewerRef.current;
    if (!p || currentSlide <= 1) return;
    p.renderPreSlide();
    setCurrentSlide(prev => prev - 1);
  }, [currentSlide]);

  useEffect(() => {
    if (stage !== 'revealed') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, goNext, goPrev]);

  const playSound = (url: string, volume = 0.4) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  };

  const handleOpenCurtains = () => {
    if (stage !== 'waiting') return;
    playSound('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 0.5);
    setStage('opening');
    setTimeout(() => {
      playSound('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3', 0.4);
      setStage('revealed');
      onRevealComplete();
    }, 5000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`relative w-full h-screen overflow-hidden bg-black flex flex-col items-center justify-center ${stage === 'waiting' ? 'cursor-pointer' : ''}`}
      onClick={stage === 'waiting' ? handleOpenCurtains : undefined}
    >
      {/* Click to open prompt */}
      {stage === 'waiting' && (
        <motion.div
          className="absolute z-40 flex flex-col items-center gap-4 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.p
            className="text-2xl font-serif text-amber-200/90 tracking-widest uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Click to Open
          </motion.p>
        </motion.div>
      )}

      {/* PPTX Slide Content */}
      <motion.div
        className="flex items-center justify-center z-0"
        initial={{ scale: 0.95, opacity: 0, filter: 'brightness(0.3)' }}
        animate={{
          scale: stage === 'revealed' ? 1 : (stage === 'opening' ? 1 : 0.95),
          opacity: stage === 'revealed' || stage === 'opening' ? 1 : 0,
          filter: stage === 'revealed' ? 'brightness(1)' : 'brightness(0.3)'
        }}
        transition={{ duration: stage === 'revealed' ? 4 : 2.5, ease: "easeOut" }}
      >
        <div
          ref={previewContainerRef}
          className="pptx-preview-container"
          style={{ width: slideSize.width, height: slideSize.height, overflow: 'hidden' }}
        />
      </motion.div>

      {/* Slide Navigation — only after reveal */}
      <AnimatePresence>
        {stage === 'revealed' && totalSlides > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center gap-6 mt-4 z-30"
          >
            <button
              onClick={goPrev}
              disabled={currentSlide <= 1}
              className="p-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/40 hover:text-amber-200 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <span className="text-amber-200/80 font-serif text-lg tracking-wide min-w-[100px] text-center">
              {currentSlide} / {totalSlides}
            </span>

            <button
              onClick={goNext}
              disabled={currentSlide >= totalSlides}
              className="p-3 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:bg-amber-500/40 hover:text-amber-200 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles */}
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
                initial={{ x: '50vw', y: '50vh', opacity: 1, scale: 0 }}
                animate={{
                  x: `${50 + (Math.random() * 100 - 50)}vw`,
                  y: `${50 + (Math.random() * 100 - 50)}vh`,
                  opacity: 0,
                  scale: Math.random() * 2 + 1
                }}
                transition={{ duration: 2 + Math.random() * 2, ease: "easeOut", delay: Math.random() * 0.5 }}
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
            ? { scaleX: 0, x: '-5%' }
            : { scaleX: 1, x: '0%' }
        }
        transition={{ duration: 5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="absolute inset-0 opacity-70 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(0,0,0,0.5)_60px,rgba(0,0,0,0.7)_75px,rgba(0,0,0,0.5)_90px,transparent_100px)]" />
        <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(90deg,transparent,transparent_65px,rgba(255,100,100,0.15)_75px,transparent_85px)]" />
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
            ? { scaleX: 0, x: '5%' }
            : { scaleX: 1, x: '0%' }
        }
        transition={{ duration: 5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="absolute inset-0 opacity-70 bg-[repeating-linear-gradient(-90deg,transparent,transparent_50px,rgba(0,0,0,0.5)_60px,rgba(0,0,0,0.7)_75px,rgba(0,0,0,0.5)_90px,transparent_100px)]" />
        <div className="absolute inset-0 opacity-50 bg-[repeating-linear-gradient(-90deg,transparent,transparent_65px,rgba(255,100,100,0.15)_75px,transparent_85px)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
