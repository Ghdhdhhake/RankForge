import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TierRow from './components/TierRow';
import StagingArea from './components/StagingArea';
import Toolbar from './components/Toolbar';
import ExportModal from './components/ExportModal';
import type { Tier, TierItem } from './types';

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${timestamp}_${randomPart}`;
};

const tierColors = [
  '#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#5D4037',
];

const defaultTiers: Tier[] = [
  { id: '1', name: '夯', color: tierColors[0], order: 0 },
  { id: '2', name: '顶尖', color: tierColors[1], order: 1 },
  { id: '3', name: '一般', color: tierColors[2], order: 2 },
  { id: '4', name: 'NPC', color: tierColors[3], order: 3 },
  { id: '5', name: '拉完了', color: tierColors[4], order: 4 },
];

const STORAGE_KEY = 'tier_ranking_data_v5';

function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function loadData(): { tiers: Tier[]; items: TierItem[] } {
  if (!isLocalStorageAvailable()) {
    return { tiers: defaultTiers, items: [] };
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (Array.isArray(data.tiers) && Array.isArray(data.items)) {
        const validTiers = data.tiers.filter((t: unknown): t is Tier => 
          typeof t === 'object' && t !== null && 'id' in t && 'name' in t && 'color' in t
        );
        const validItems = data.items.filter((i: unknown): i is TierItem =>
          typeof i === 'object' && i !== null && 'id' in i && 'name' in i
        );
        if (validTiers.length > 0) {
          return { tiers: validTiers, items: validItems };
        }
      }
    }
  } catch { /* ignore */ }
  return { tiers: defaultTiers, items: [] };
}

export default function App() {
  const [tiers, setTiers] = useState<Tier[]>(() => loadData().tiers);
  const [items, setItems] = useState<TierItem[]>(() => loadData().items);
  const [newItemImages, setNewItemImages] = useState<string[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingTierName, setEditingTierName] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverTierId, setDragOverTierId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState({ x: 0, y: 0 });
  const [saveError, setSaveError] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saveError || !isLocalStorageAvailable()) return;
    
    const saveData = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ tiers, items }));
      } catch (e) {
        console.warn('存储空间不足，尝试清理后重试');
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ tiers, items }));
        } catch {
          console.error('存储失败，数据无法保存');
          setSaveError(true);
        }
      }
    };

    const timer = setTimeout(saveData, 500);
    return () => clearTimeout(timer);
  }, [tiers, items, saveError]);

  const handleImageSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    const fileArray = Array.from(files);

    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxSize = 200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      });
    };

    try {
      const newImages = await Promise.all(fileArray.map(compressImage));
      
      // 获取所有已存在的图片 URL（只检查当前预览中的图片，不检查已添加的items）
      const existingImageUrls = new Set(newItemImages);
      
      // 过滤重复图片
      const uniqueImages = newImages.filter(url => !existingImageUrls.has(url));
      const duplicates = newImages.length - uniqueImages.length;
      
      setDuplicateCount(duplicates);
      if (duplicates > 0) {
        setTimeout(() => setDuplicateCount(0), 3000);
      }
      
      if (uniqueImages.length > 0) {
        setNewItemImages(prev => [...prev, ...uniqueImages]);
      }
      setSaveError(false);
    } catch (error) {
      console.error('图片处理错误:', error);
      alert('图片处理失败，请重试');
    } finally {
      setIsProcessingImages(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  }, [newItemImages]);

  const handleRemoveImagePreview = useCallback((index: number) => {
    setNewItemImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddItems = useCallback(() => {
    if (newItemImages.length === 0) return;

    const newItems: TierItem[] = newItemImages.map((imageUrl, index) => ({
      id: generateId(),
      name: `图片 ${items.length + index + 1}`,
      tierId: '',
      imageUrl,
    }));

    setItems(prev => [...prev, ...newItems]);
    setNewItemImages([]);
  }, [newItemImages, items.length]);

  const handleDeleteItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleMoveToStaging = useCallback((itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, tierId: '' } : item
    ));
  }, []);

  const handleMoveItem = useCallback((itemId: string, toTierId: string | null) => {
    setDraggedItemId(null);
    setDragOverTierId(null);
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, tierId: toTierId || '' } : item
    ));
  }, []);

  const handleEditTier = useCallback((tierId: string) => {
    const tier = tiers.find(t => t.id === tierId);
    if (tier) {
      setEditingTierId(tierId);
      setEditingTierName(tier.name);
    }
  }, [tiers]);

  const handleSaveTier = useCallback(() => {
    if (!editingTierId) return;
    const newName = editingTierName.trim() || '未命名';
    setTiers(prev => prev.map(tier =>
      tier.id === editingTierId ? { ...tier, name: newName } : tier
    ));
    setEditingTierId(null);
    setEditingTierName('');
  }, [editingTierId, editingTierName]);

  const handleAddTier = useCallback(() => {
    const colorIndex = tiers.length % tierColors.length;
    const tierName = tiers.length < 26 
      ? String.fromCharCode(65 + tiers.length)
      : `T${tiers.length + 1}`;
    const newTier: Tier = {
      id: generateId(),
      name: tierName,
      color: tierColors[colorIndex],
      order: tiers.length,
    };
    setTiers(prev => [...prev, newTier]);
  }, [tiers]);

  const handleDeleteTier = useCallback((tierId: string) => {
    if (tiers.length <= 1) {
      alert('至少保留一个层级');
      return;
    }
    setItems(prev => prev.map(item =>
      item.tierId === tierId ? { ...item, tierId: '' } : item
    ));
    setTiers(prev => prev.filter(t => t.id !== tierId).map((t, i) => ({ ...t, order: i })));
  }, [tiers]);

  const getItemsByTier = (tierId: string) => items.filter(item => item.tierId === tierId);
  const unstagedItems = items.filter(item => !item.tierId);

  const sortedTiers = [...tiers].sort((a, b) => a.order - b.order);

  const isDark = theme === 'dark';

  const handleThemeChange = useCallback((newTheme: 'dark' | 'light', origin: { x: number; y: number }) => {
    setTransitionOrigin(origin);
    setIsTransitioning(true);
    setTheme(newTheme);
    setTimeout(() => setIsTransitioning(false), 600);
  }, []);

  return (
    <div className={`min-h-screen font-ios flex flex-col relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300'}`}>
      {/* Theme transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className={`fixed inset-0 z-50 ${isDark ? 'bg-slate-100' : 'bg-slate-900'}`}
            initial={{ clipPath: `circle(0% at ${transitionOrigin.x}px ${transitionOrigin.y}px)` }}
            animate={{ clipPath: `circle(150% at ${transitionOrigin.x}px ${transitionOrigin.y}px)` }}
            exit={{ clipPath: `circle(0% at ${transitionOrigin.x}px ${transitionOrigin.y}px)` }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          />
        )}
      </AnimatePresence>
      <Toolbar
        onAddTier={handleAddTier}
        onExport={() => setShowExport(true)}
        theme={theme}
        onThemeChange={handleThemeChange}
        lang={lang}
        onLangChange={setLang}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex h-12 shrink-0 border-b transition-all duration-500 ${isDark ? 'border-white/10 bg-slate-900/80' : 'border-black/10 bg-slate-200/80'}`}>
            <div className="w-24 shrink-0 flex items-center justify-center">
              <span className={`text-xs font-medium transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'zh' ? '等级' : 'Tier'}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className={`text-sm font-medium transition-colors duration-500 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{lang === 'zh' ? '← 拖拽图片到对应等级分类 →' : '← Drag images to tiers →'}</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {sortedTiers.map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                items={getItemsByTier(tier.id)}
                isDragOver={dragOverTierId === tier.id}
                isDragging={draggedItemId !== null}
                isEditing={editingTierId === tier.id}
                editingName={editingTierName}
                onStartEdit={() => handleEditTier(tier.id)}
                onNameChange={setEditingTierName}
                onSaveEdit={handleSaveTier}
                onCancelEdit={() => setEditingTierId(null)}
                onDeleteTier={() => handleDeleteTier(tier.id)}
                onMoveItem={handleMoveItem}
                onMoveToStaging={handleMoveToStaging}
                onDragStart={(id) => setDraggedItemId(id)}
                onDragEnd={() => { setDraggedItemId(null); setDragOverTierId(null); }}
                onDragEnter={() => setDragOverTierId(tier.id)}
                onDragLeave={() => setDragOverTierId(null)}
                theme={theme}
                lang={lang}
              />
            ))}
          </div>
        </div>

        <StagingArea
          items={unstagedItems}
          onDeleteItem={handleDeleteItem}
          onAddItems={handleAddItems}
          newItemImages={newItemImages}
          onImageSelect={handleImageSelect}
          onRemoveImagePreview={handleRemoveImagePreview}
          imageInputRef={imageInputRef}
          isProcessingImages={isProcessingImages}
          onDragStart={(id) => setDraggedItemId(id)}
          onDragEnd={() => setDraggedItemId(null)}
          theme={theme}
          lang={lang}
          duplicateCount={duplicateCount}
        />
      </div>

      <AnimatePresence>
        {showExport && (
          <ExportModal
            tiers={sortedTiers}
            items={items}
            onClose={() => setShowExport(false)}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
