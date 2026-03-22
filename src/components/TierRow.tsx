import { motion, AnimatePresence } from 'framer-motion';
import ItemCard from './ItemCard';
import type { Tier, TierItem } from '../types';

interface TierRowProps {
  tier: Tier;
  items: TierItem[];
  isDragOver: boolean;
  isDragging: boolean;
  isEditing: boolean;
  editingName: string;
  onStartEdit: () => void;
  onNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteTier: () => void;
  onMoveItem: (itemId: string, toTierId: string) => void;
  onMoveToStaging: (itemId: string) => void;
  onDragStart: (itemId: string) => void;
  onDragEnd: () => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  theme?: 'dark' | 'light';
  lang?: 'zh' | 'en';
}

export default function TierRow({
  tier,
  items,
  isDragOver,
  isDragging,
  isEditing,
  editingName,
  onStartEdit,
  onNameChange,
  onSaveEdit,
  onCancelEdit,
  onDeleteTier,
  onMoveItem,
  onMoveToStaging,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  theme = 'dark',
  lang = 'zh',
}: TierRowProps) {
  const isDark = theme === 'dark';
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onMoveItem(itemId, tier.id);
    }
    onDragEnd();
  };

  return (
    <div className={`flex h-32 shrink-0 border-b transition-all duration-500 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
      {/* Tier Label - Fixed width */}
      <div
        className="w-24 shrink-0 flex flex-col items-center justify-center py-2 border-r"
        style={{ backgroundColor: tier.color + '20' }}
      >
        {isEditing ? (
          <div className="flex flex-col gap-1 w-full px-1">
            <input
              type="text"
              value={editingName}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              onBlur={onSaveEdit}
              className={`w-full px-1 py-1.5 rounded text-center font-bold outline-none text-lg transition-colors duration-500 ${isDark ? 'text-white bg-white/20' : 'text-black bg-black/20'}`}
              autoFocus
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onStartEdit()}
              className="w-20 h-12 rounded-lg flex items-center justify-center font-bold text-black text-sm shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: tier.color }}
            >
              {tier.name}
            </button>
            <span className={`text-xs transition-colors duration-500 ${isDark ? 'text-white/60' : 'text-black/60'}`}>{items.length}{lang === 'zh' ? '个' : items.length === 1 ? ' item' : ' items'}</span>
            <motion.button
              whileHover={{ scale: 1.2, color: '#ef4444' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDeleteTier()}
              className={`text-xs transition-colors duration-500 ${isDark ? 'text-white/40' : 'text-black/40'}`}
            >
              {lang === 'zh' ? '删除' : 'Del'}
            </motion.button>
          </div>
        )}
      </div>

      {/* Drop Zone / Items Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        className={`
          flex-1 p-2 flex flex-wrap gap-2 content-start overflow-hidden
          transition-all duration-200
          ${isDragOver
            ? 'bg-rose-500/20 ring-2 ring-inset ring-rose-400/50'
            : isDragging
              ? isDark ? 'bg-slate-800/30' : 'bg-slate-300/50'
              : 'bg-transparent'
          }
        `}
      >
        {items.length === 0 && !isDragOver ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full flex items-center justify-center text-xs transition-colors duration-500 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
          >
            {isDragging ? (lang === 'zh' ? '松手放入 👆' : 'Drop here 👆') : (lang === 'zh' ? '拖拽图片到这里' : 'Drag images here')}
          </motion.div>
        ) : (
          <AnimatePresence>
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                size="small"
                theme={theme}
                onDelete={() => onMoveToStaging(item.id)}
                onDragStart={() => onDragStart(item.id)}
                onDragEnd={onDragEnd}
                index={index}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
