import React, { useState, useRef } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageUploaderProps {
  key?: string;
  onUpload: (imageUrl: string) => void;
}

export function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-[#2a0000] p-6"
    >
      {/* Grand Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Deep maroon theater gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#800000] via-[#4a0404] to-[#2a0000] opacity-90" />
        
        {/* Subtle spotlight effects */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[140%] bg-white/5 blur-[100px] rounded-full rotate-12 mix-blend-overlay"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[-20%] right-[-10%] w-[50%] h-[140%] bg-white/5 blur-[100px] rounded-full -rotate-12 mix-blend-overlay"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        
        {/* Dust particles overlay */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3 text-amber-500 mb-6">
            <Sparkles className="w-6 h-6" />
            <span className="uppercase tracking-[0.3em] text-sm font-semibold">The Premiere</span>
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 drop-shadow-lg">
            Grand Reveal
          </h1>
          <p className="text-lg text-amber-200/60 font-light tracking-wide max-w-md mx-auto">
            Upload your masterpiece to prepare the stage for an unforgettable ceremony.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative group cursor-pointer overflow-hidden
            rounded-3xl p-1
            transition-all duration-500 ease-out
            ${isDragging ? 'scale-105' : 'hover:scale-[1.02]'}
          `}
        >
          {/* Animated border gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br from-amber-400 via-red-600 to-amber-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500 ${isDragging ? 'animate-spin-slow' : ''}`} />
          
          <div className="relative bg-[#1a0505]/90 backdrop-blur-xl rounded-[23px] p-12 flex flex-col items-center justify-center gap-6 border border-white/5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              accept="image/jpeg, image/png, image/webp"
              className="hidden"
            />
            
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
              <div className="relative p-6 rounded-full bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 group-hover:border-amber-500/50 transition-colors duration-500">
                <Upload className={`w-10 h-10 ${isDragging ? 'text-amber-400' : 'text-amber-500/70 group-hover:text-amber-400'} transition-colors duration-500`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-serif text-amber-100 group-hover:text-white transition-colors duration-300">
                {isDragging ? 'Drop to set the stage' : 'Click or drag to upload'}
              </p>
              <p className="text-sm text-amber-500/50 uppercase tracking-widest font-semibold">
                Supports JPG, PNG, WEBP
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
