import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  onAddTier: () => void;
  onExport: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light', origin: { x: number; y: number }) => void;
  lang: 'zh' | 'en';
  onLangChange: (lang: 'zh' | 'en') => void;
}

const translations = {
  zh: {
    title: '夯拉榜',
    addTier: '添加层级',
    export: '导出',
    theme: '主题',
    lang: '语言',
  },
  en: {
    title: '夯拉榜',
    addTier: 'Add Tier',
    export: 'Export',
    theme: 'Theme',
    lang: 'Lang',
  },
};

export default function Toolbar({ onAddTier, onExport, theme, onThemeChange, lang, onLangChange }: ToolbarProps) {
  const isDark = theme === 'dark';
  const t = translations[lang];
  const themeBtnRef = useRef<HTMLButtonElement>(null);

  const handleThemeToggle = () => {
    if (themeBtnRef.current) {
      const rect = themeBtnRef.current.getBoundingClientRect();
      const origin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      onThemeChange(isDark ? 'light' : 'dark', origin);
    }
  };

  return (
    <div className={`sticky top-0 z-20 backdrop-blur-xl border-b safe-area-top ${isDark ? 'bg-slate-900/80 border-white/5' : 'bg-slate-200/80 border-black/5'}`}>
      <div className="flex items-center justify-between px-5 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/25">
            <span className="text-white font-bold text-xl">🏆</span>
          </div>
          <div>
            <h1 className={`font-bold text-2xl leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: "'Ma Shan Zheng', cursive" }}>{t.title}</h1>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <motion.button
            ref={themeBtnRef}
            whileTap={{ scale: 0.9 }}
            onClick={handleThemeToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
            title={t.theme}
          >
            {/* Icon with rotation animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isDark ? 'sun' : 'moon'}
                initial={{ rotate: -180, opacity: 0, scale: 0 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 180, opacity: 0, scale: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="relative z-10"
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Language Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onLangChange(lang === 'zh' ? 'en' : 'zh')}
            className={`px-3 h-10 rounded-xl text-sm font-medium transition-all duration-500 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-300 text-slate-700 hover:bg-slate-400'}`}
            title={t.lang}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddTier}
            className={`px-4 py-2 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all duration-500 ${isDark ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white' : 'bg-black/5 border-black/10 text-slate-700 hover:bg-black/10'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.addTier}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-500/25"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t.export}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
