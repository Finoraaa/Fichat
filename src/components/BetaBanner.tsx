import React from 'react';
import { AlertCircle, Bug } from 'lucide-react';
import { motion } from 'motion/react';

interface BetaBannerProps {
  onReportClick: () => void;
}

export function BetaBanner({ onReportClick }: BetaBannerProps) {
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-[100] bg-[#0A0A0A]/80 backdrop-blur-md border-b border-blue-500/10 py-2 px-4 flex items-center justify-center gap-4"
    >
      <div className="flex items-center gap-2 text-[11px] md:text-xs font-medium tracking-wide">
        <span className="flex items-center gap-1.5 text-blue-400">
          <AlertCircle size={14} />
          🚀 Fichat Alpha:
        </span>
        <span className="text-zinc-400">
          Bu proje henüz tamamlanmamıştır. Gördüğünüz her şey geliştirme aşamasındadır.
        </span>
      </div>
      
      <button
        onClick={onReportClick}
        className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-full text-[10px] md:text-xs font-bold text-blue-400 transition-all active:scale-95 group"
      >
        <Bug size={14} className="group-hover:rotate-12 transition-transform" />
        Hata Bildir 🛠️
      </button>
    </motion.div>
  );
}
