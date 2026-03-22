import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TierItem } from '../types';

interface ItemCardProps {
  item: TierItem;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  index: number;
  size?: 'normal' | 'small';
  theme?: 'dark' | 'light';
}

export default function ItemCard({ item, onDelete, onDragStart, onDragEnd, index, size = 'normal', theme = 'dark' }: ItemCardProps) {
  const hasImage = !!item.imageUrl;
  const isSmall = size === 'small';
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
          delay: index * 0.01,
        }
      }}
      exit={{ 
        scale: 0, 
        opacity: 0, 
        rotate: 180,
        transition: {
          duration: 0.25,
          ease: 'easeIn'
        }
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-lg overflow-hidden shadow-md cursor-grab active:cursor-grabbing shrink-0 ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-slate-200/80 border-black/10'}`}
      style={{
        width: isSmall ? '80px' : '100px',
        height: isSmall ? '80px' : '100px',
      }}
    >
      <div
        draggable
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData('text/plain', item.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        className="w-full h-full flex items-center justify-center overflow-hidden"
      >
        {hasImage && !imageError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={`font-medium text-xs px-1 text-center break-words ${isDark ? 'text-white/80' : 'text-black/80'}`}>
            {item.name}
          </span>
        )}
      </div>

      {/* Delete Button - Show on hover with spatial animation */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={isHovered
          ? { scale: 1.2, opacity: 1, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.6)' }
          : { scale: 0, opacity: 0, boxShadow: '0 0 0 rgba(239, 68, 68, 0)' }
        }
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
        className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
        title="移至待分类"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </motion.button>

      {/* Move to Staging hint - shows on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
        <span className="text-white/80 text-xs">移至待分类</span>
      </div>
    </motion.div>
  );
}
