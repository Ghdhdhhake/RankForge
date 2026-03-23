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
const QUICK_START_KEY = 'tier_ranking_quick_start_hidden_v1';

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

function normalizeImportedData(raw: unknown): { tiers: Tier[]; items: TierItem[] } | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const candidate = raw as { tiers?: unknown; items?: unknown };
  if (!Array.isArray(candidate.tiers)) {
    return null;
  }

  const tiers = candidate.tiers
    .filter((tier): tier is Tier =>
      typeof tier === 'object' &&
      tier !== null &&
      'id' in tier &&
      'name' in tier &&
      'color' in tier &&
      'order' in tier
    )
    .map((tier) => ({
      id: String(tier.id),
      name: String(tier.name),
      color: String(tier.color),
      order: Number(tier.order),
    }));

  if (tiers.length === 0) {
    return null;
  }

  const itemsSource = Array.isArray(candidate.items) ? candidate.items : [];
  const items = itemsSource
    .filter((item): item is TierItem =>
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item &&
      'tierId' in item
    )
    .map((item) => ({
      id: String(item.id),
      name: String(item.name),
      tierId: String(item.tierId),
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : undefined,
      color: typeof item.color === 'string' ? item.color : undefined,
      note: typeof item.note === 'string' ? item.note : undefined,
    }));

  return { tiers, items };
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
  const [showQuickStart, setShowQuickStart] = useState(() => {
    if (!isLocalStorageAvailable()) return true;
    return localStorage.getItem(QUICK_START_KEY) !== 'hidden';
  });
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

  useEffect(() => {
    if (!showQuickStart || !isLocalStorageAvailable()) return;
    localStorage.removeItem(QUICK_START_KEY);
  }, [showQuickStart]);

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

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeImportedData(parsed);

      if (!normalized) {
        alert(lang === 'zh' ? '这个 JSON 不是可恢复的夯拉榜备份文件。' : 'This JSON is not a valid backup file.');
        return;
      }

      setTiers(normalized.tiers.sort((a, b) => a.order - b.order));
      setItems(normalized.items);
      setNewItemImages([]);
      setShowExport(false);
      setSaveError(false);
      alert(lang === 'zh' ? '导入成功，当前排行已恢复。' : 'Import successful.');
    } catch (error) {
      console.error('导入失败:', error);
      alert(lang === 'zh' ? '导入失败，请确认文件是正确的 JSON。' : 'Import failed. Please check the JSON file.');
    }
  }, [lang]);

  const handleResetBoard = useCallback(() => {
    const confirmed = window.confirm(
      lang === 'zh'
        ? '确认清空当前排行吗？已上传图片、层级调整和分类结果都会被清空。'
        : 'Clear the current board? Uploaded images, tier edits, and rankings will be removed.'
    );

    if (!confirmed) {
      return;
    }

    setTiers(defaultTiers);
    setItems([]);
    setNewItemImages([]);
    setShowExport(false);
    setSaveError(false);
    setEditingTierId(null);
    setEditingTierName('');
  }, [lang]);

  const handleDismissQuickStart = useCallback(() => {
    setShowQuickStart(false);
    if (isLocalStorageAvailable()) {
      localStorage.setItem(QUICK_START_KEY, 'hidden');
    }
  }, []);

  const isEmptyBoard = items.length === 0 && newItemImages.length === 0;

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
        onImport={handleImport}
        onReset={handleResetBoard}
        onExport={() => setShowExport(true)}
        theme={theme}
        onThemeChange={handleThemeChange}
        lang={lang}
        onLangChange={setLang}
      />

      {showQuickStart && isEmptyBoard && (
        <div className="px-4 pt-4">
          <div className={`mx-auto max-w-6xl rounded-3xl border px-5 py-4 shadow-xl transition-all duration-500 ${isDark ? 'border-white/10 bg-white/5 shadow-black/20' : 'border-black/10 bg-white/80 shadow-slate-400/20'}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className={`text-sm font-semibold ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>
                  {lang === 'zh' ? '第一次用？三步就够了' : 'First time here? It only takes 3 steps'}
                </p>
                <h2 className={`mt-1 text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {lang === 'zh' ? '上传图片、拖到等级、最后导出保存' : 'Upload images, drag to a tier, then export'}
                </h2>
                <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {lang === 'zh' ? '右侧先选图片，添加后直接拖动到左边等级里。做完点右上角“导出”即可。' : 'Choose images on the right, add them, then drag them into tiers on the left. Export when done.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  lang === 'zh' ? '1. 点击右侧上传图片' : '1. Upload on the right',
                  lang === 'zh' ? '2. 拖到对应等级' : '2. Drag into a tier',
                  lang === 'zh' ? '3. 点导出保存结果' : '3. Export your result',
                ].map((step) => (
                  <div
                    key={step}
                    className={`rounded-2xl px-4 py-3 text-sm ${isDark ? 'bg-slate-900/70 text-slate-100' : 'bg-slate-100 text-slate-700'}`}
                  >
                    {step}
                  </div>
                ))}
              </div>

              <button
                onClick={handleDismissQuickStart}
                className={`shrink-0 rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-black/5 text-slate-700 hover:bg-black/10'}`}
              >
                {lang === 'zh' ? '我知道了' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

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
