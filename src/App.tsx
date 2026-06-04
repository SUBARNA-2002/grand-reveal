/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImageUploader } from './components/ImageUploader';
import { CurtainStage } from './components/CurtainStage';
import { PptxStage } from './components/PptxStage';

export default function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pptxData, setPptxData] = useState<ArrayBuffer | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setImageUrl(null);
        setPptxData(null);
        setIsRevealed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasContent = imageUrl || pptxData;

  return (
    <div className="min-h-screen bg-[#2a0000] text-white font-sans selection:bg-amber-500/30 overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasContent ? (
          <ImageUploader
            key="uploader"
            onUpload={setImageUrl}
            onPptxUpload={setPptxData}
          />
        ) : pptxData ? (
          <PptxStage
            key="pptx-stage"
            pptxData={pptxData}
            onRevealComplete={() => setIsRevealed(true)}
          />
        ) : (
          <CurtainStage
            key="stage"
            imageUrl={imageUrl!}
            onRevealComplete={() => setIsRevealed(true)}
            revealDelayMs={4000}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
