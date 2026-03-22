import { motion, AnimatePresence } from 'framer-motion';
import type { RefObject } from 'react';
import ItemCard from './ItemCard';
import type { TierItem } from '../types';

interface StagingAreaProps {
  items: TierItem[];
  onDeleteItem: (itemId: string) => void;
  onAddItems: () => void;
  newItemImages: string[];
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImagePreview: (index: number) => void;
  imageInputRef: RefObject<HTMLInputElement>;
  isProcessingImages: boolean;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
  theme?: 'dark' | 'light';
  lang?: 'zh' | 'en';
  duplicateCount?: number;
}

export default function StagingArea({
  items,
  onDeleteItem,
  onAddItems,
  newItemImages,
  onImageSelect,
  onRemoveImagePreview,
  imageInputRef,
  isProcessingImages,
  onDragStart,
  onDragEnd,
  theme = 'dark',
  lang = 'zh',
  duplicateCount = 0,
}: StagingAreaProps) {
  const isDark = theme === 'dark';

  const canAdd = newItemImages.length > 0 && !isProcessingImages;

  return (
    <div className={`w-72 shrink-0 border-l flex flex-col transition-all duration-500 ${isDark ? 'border-white/10 bg-slate-900/50' : 'border-black/10 bg-slate-300/50'}`}>
      {/* Header */}
      <div className={`p-4 border-b shrink-0 transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        {/* Multi Image Upload Area */}
        <div className="mb-3">
          <div
            onClick={() => imageInputRef.current?.click()}
            className={`relative w-full h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden ${isDark ? 'border-white/20 hover:border-rose-400/50 hover:bg-white/5' : 'border-black/20 hover:border-rose-400/50 hover:bg-black/5'}`}
          >
            {newItemImages.length > 0 ? (
              <div className="w-full h-full flex">
                {newItemImages.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative flex-1 h-full">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveImagePreview(i);
                      }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newItemImages.length > 4 && (
                  <div className={`flex-1 h-full flex items-center justify-center text-xs transition-colors duration-500 ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-400 text-black'}`}>
                    +{newItemImages.length - 4}
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="text-3xl mb-1">🖼️</span>
                <span className={`text-xs transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{lang === 'zh' ? '点击上传（可多选）' : 'Click to upload (multi)'}</span>
              </>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImageSelect}
            className="hidden"
          />
          {newItemImages.length > 0 && (
            <p className={`text-xs mt-1 transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              {lang === 'zh' ? `已选择 ${newItemImages.length} 张图片` : `Selected ${newItemImages.length} images`}
              {isProcessingImages && (lang === 'zh' ? ' (处理中...)' : ' (processing...)')}
            </p>
          )}
          {duplicateCount > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs mt-1 text-amber-500"
            >
              {lang === 'zh' ? `⚠️ ${duplicateCount} 张重复图片已跳过` : `⚠️ ${duplicateCount} duplicate images skipped`}
            </motion.p>
          )}
        </div>

        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-sm transition-colors duration-500 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            📦 {lang === 'zh' ? '待分类图片' : 'Pending Images'}
          </h3>
          <button
            onClick={onAddItems}
            disabled={!canAdd}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isProcessingImages ? (lang === 'zh' ? '处理中...' : 'Processing...') : (lang === 'zh' ? '添加' : 'Add')}
          </button>
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 && newItemImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`h-full flex flex-col items-center justify-center text-sm transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
          >
            <span className="text-4xl mb-2">📭</span>
            <span>{lang === 'zh' ? '暂无待分类图片' : 'No pending images'}</span>
          </motion.div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  size="small"
                  theme={theme}
                  onDelete={() => onDeleteItem(item.id)}
                  onDragStart={() => onDragStart(item.id)}
                  onDragEnd={onDragEnd}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={`p-3 border-t text-center shrink-0 transition-colors duration-500 ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <span className={`text-xs transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{lang === 'zh' ? `共 ${items.length} 个待分类` : `${items.length} pending`}</span>
      </div>
    </div>
  );
}
