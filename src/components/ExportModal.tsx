import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { Tier, TierItem } from '../types';

interface ExportModalProps {
  tiers: Tier[];
  items: TierItem[];
  onClose: () => void;
  theme?: 'dark' | 'light';
}

export default function ExportModal({ tiers, items, onClose, theme = 'dark' }: ExportModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState<'image' | 'json'>('image');
  const isDark = theme === 'dark';
  
  const bgColor = isDark ? '#0f172a' : '#f1f5f9';
  const headerBg = isDark ? '#1e293b' : '#e2e8f0';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const emptyColor = isDark ? '#475569' : '#94a3b8';

  const getItemsByTier = useCallback((tierId: string) => 
    items.filter(item => item.tierId === tierId), 
    [items]
  );

  const handleExportImage = useCallback(async () => {
    const element = contentRef.current;
    if (!element) return;

    setExporting(true);
    try {
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(element, {
        backgroundColor: bgColor,
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `阶梯排行_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [bgColor]);

  const handleExportJSON = useCallback(() => {
    const data = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      title: '我的阶梯排行',
      tiers: tiers.map(tier => ({
        ...tier,
        items: getItemsByTier(tier.id).map(item => item.name),
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `阶梯排行_${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [tiers, getItemsByTier]);

  const handleShare = useCallback(async () => {
    try {
      const { toPng } = await import('html-to-image');
      const element = contentRef.current;
      if (!element) return;

      setExporting(true);
      const dataUrl = await toPng(element, {
        backgroundColor: bgColor,
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });

      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], '阶梯排行.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '我的阶梯排行',
        });
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        alert('图片已复制到剪贴板');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('分享失败，请重试');
    } finally {
      setExporting(false);
    }
  }, [bgColor]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">导出排行</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Export Type Tabs */}
        <div className="px-5 pt-4 flex gap-2">
          <button
            onClick={() => setExportType('image')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              exportType === 'image'
                ? 'bg-rose-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            📷 图片导出
          </button>
          <button
            onClick={() => setExportType('json')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              exportType === 'json'
                ? 'bg-rose-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            📄 JSON 导出
          </button>
        </div>

        {/* Preview */}
        <div className="p-4 max-h-[60vh] overflow-auto">
          <div
            ref={contentRef}
            className="rounded-xl overflow-hidden"
            style={{ background: bgColor }}
          >
            {/* Header */}
            <div className="flex items-center h-10 border-b" style={{ backgroundColor: headerBg, borderColor }}>
              <div className="w-16 shrink-0 flex items-center justify-center">
                <span className="text-xs font-medium" style={{ color: subTextColor }}>Tier</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <span className="text-xs font-medium" style={{ color: subTextColor }}>🏆 阶梯排行</span>
              </div>
            </div>

            {/* Tiers */}
            {tiers.map((tier) => (
              <div key={tier.id} className="flex border-b" style={{ borderColor }}>
                {/* Tier Label */}
                <div
                  className="w-16 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: tier.color }}
                >
                  <span className="text-white font-bold text-sm">{tier.name}</span>
                </div>
                {/* Items */}
                <div className="flex-1 p-2 flex flex-wrap gap-1.5 min-h-[60px]" style={{ backgroundColor: tier.color + '15' }}>
                  {getItemsByTier(tier.id).length === 0 ? (
                    <span className="text-xs self-center" style={{ color: emptyColor }}>-</span>
                  ) : (
                    getItemsByTier(tier.id).map((item) => (
                      <div
                        key={item.id}
                        className="w-12 h-12 rounded overflow-hidden flex items-center justify-center"
                        style={{ backgroundColor: isDark ? 'rgba(51,65,85,0.5)' : 'rgba(203,213,225,0.5)' }}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <span className="text-[10px] px-0.5 text-center leading-tight" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {item.name}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="py-2 px-4 text-center" style={{ backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : 'rgba(226,232,240,0.5)' }}>
              <span className="text-[10px]" style={{ color: subTextColor }}>由夯拉榜生成</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-4 border-t border-white/10 flex gap-3">
          {exportType === 'image' ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                disabled={exporting}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 text-white font-medium disabled:opacity-50"
              >
                分享
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportImage}
                disabled={exporting}
                className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold disabled:opacity-50"
              >
                {exporting ? '导出中...' : '下载图片'}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportJSON}
              className="flex-1 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
            >
              下载 JSON 文件
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
