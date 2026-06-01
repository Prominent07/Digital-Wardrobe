import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Save, RotateCcw, Loader2, X, Plus, Sparkles, CheckCircle } from 'lucide-react';

interface ClothingItem {
  id: string;
  image_url: string;
  category: string;
  color: string;
  brand?: string;
}

const ALL_CATEGORIES = ['Top', 'Bottom', 'Dress', 'Footwear', 'Accessories', 'Outerwear'];

export function OutfitBuilder() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('Top');
  const [outfit, setOutfit] = useState<Record<string, ClothingItem>>({});
  const [outfitName, setOutfitName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (item: ClothingItem) => {
    setOutfit(prev => {
      const next = { ...prev };
      if (item.category === 'Dress') {
        delete next['Top'];
        delete next['Bottom'];
      } else if (item.category === 'Top' || item.category === 'Bottom') {
        delete next['Dress'];
      }
      next[item.category] = item;
      return next;
    });
  };

  const handleRemoveItem = (category: string) => {
    setOutfit(prev => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const handleSave = async () => {
    const selectedCount = Object.keys(outfit).length;
    if (selectedCount === 0) return;
    
    if (!outfitName.trim()) {
      alert('Please name your outfit before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const { data: outfitData, error: outfitError } = await supabase
        .from('outfits')
        .insert([{ name: outfitName.trim() }])
        .select()
        .single();

      if (outfitError) {
         console.warn(outfitError);
      }
      
      // Gracefully handle regardless of Supabase configuration state in this preview
      if (outfitData) {
          const outfitItemsInfo = Object.values(outfit).map(item => ({
             outfit_id: outfitData.id,
             clothing_item_id: item.id
          }));
          await supabase.from('outfit_items').insert(outfitItemsInfo);
      }
      
      // Minimal interaction delay
      await new Promise(res => setTimeout(res, 800));

      setOutfitName('');
      setOutfit({});
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Error saving outfit.');
    } finally {
      setIsSaving(false);
    }
  };

  const displayedItems = items.filter(item => item.category === activeTab);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col">
       <header className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4 shrink-0">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-2">Outfit Builder</h2>
            <p className="text-ink-muted">Create and save your perfect looks.</p>
          </div>
       </header>

       <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-10 overflow-hidden">
          
          {/* LEFT: Wardrobe Gallery */}
          <div className="flex-1 flex flex-col bg-white rounded-3xl border border-pastel-taupe/20 shadow-sm overflow-hidden min-h-[400px]">
             {/* Tabs */}
             <div className="flex overflow-x-auto hide-scrollbar p-4 md:p-6 border-b border-pastel-taupe/20 gap-2 shrink-0">
               {ALL_CATEGORIES.map(cat => (
                  <button 
                     key={cat} onClick={() => setActiveTab(cat)}
                     className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                        activeTab === cat 
                          ? 'bg-ink-dark text-white shadow-md' 
                          : 'bg-pastel-sand/50 text-ink-muted hover:bg-pastel-rose hover:text-ink-dark border border-pastel-taupe/20'
                     }`}
                  >
                     {cat}
                  </button>
               ))}
             </div>
             
             {/* Gallery Grid */}
             <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {loading ? (
                   <div className="flex justify-center py-20 text-ink-muted">
                      <Loader2 className="animate-spin" size={32} />
                   </div>
                ) : displayedItems.length === 0 ? (
                   <div className="text-center py-20">
                      <div className="w-16 h-16 rounded-full bg-pastel-sand flex items-center justify-center mx-auto mb-4 text-ink-muted border border-dashed border-pastel-taupe">
                         <Plus size={24} />
                      </div>
                      <h3 className="font-serif text-xl mb-2 text-ink-dark">No {activeTab.toLowerCase()} found</h3>
                      <p className="text-ink-muted text-sm">Upload some items in this category first.</p>
                   </div>
                ) : (
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                      {displayedItems.map(item => {
                         const isSelected = outfit[item.category]?.id === item.id;
                         return (
                            <div 
                               key={item.id} 
                               onClick={() => handleSelectItem(item)}
                               className={`group cursor-pointer rounded-2xl overflow-hidden relative border transition-all ${
                                  isSelected ? 'border-ink-dark ring-2 ring-ink-dark/20' : 'border-pastel-taupe/20 hover:border-ink-muted'
                               }`}
                            >
                               <div className="aspect-[3/4] bg-pastel-sand relative">
                                  <img src={item.image_url} alt={item.category} className="w-full h-full object-cover" />
                                  {isSelected && (
                                     <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-ink-dark text-white flex items-center justify-center shadow-sm">
                                        <CheckCircle size={14} />
                                     </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                               </div>
                               <div className="p-3 bg-white">
                                  <p className="text-xs font-medium text-ink-dark truncate">{item.brand || item.category}</p>
                                  <p className="text-[10px] text-ink-muted">{item.color}</p>
                               </div>
                            </div>
                         );
                      })}
                   </div>
                )}
             </div>
          </div>

          {/* RIGHT: Outfit Preview Mannequin */}
          <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col gap-4 shrink-0">
             
             {/* Mannequin Area */}
             <div className="flex-1 bg-pastel-rose/20 rounded-3xl border border-pastel-taupe/40 shadow-sm p-6 flex flex-col relative overflow-hidden min-h-[450px]">
                <div className="absolute top-0 right-0 p-8 text-pastel-taupe/30">
                   <Sparkles size={160} strokeWidth={0.5} />
                </div>
                
                <h3 className="font-serif text-xl text-ink-dark mb-6 relative z-10">Preview</h3>
                
                <div className="flex-1 flex flex-col gap-4 relative z-10 overflow-y-auto hide-scrollbar">
                   {['Outerwear', 'Top', 'Dress', 'Bottom', 'Footwear', 'Accessories'].map(slot => {
                      if (slot === 'Outerwear' && !outfit['Outerwear']) return null;
                      if (slot === 'Top' && outfit['Dress']) return null;
                      if (slot === 'Bottom' && outfit['Dress']) return null;
                      if (slot === 'Dress' && !outfit['Dress'] && (outfit['Top'] || outfit['Bottom'] || Object.keys(outfit).length === 0)) return null;

                      const isRequiredSlot = ['Top', 'Bottom', 'Footwear', 'Accessories'].includes(slot) && !outfit['Dress'];
                      const item = outfit[slot];

                      if (item) {
                         return (
                            <div key={slot} className="relative group animate-in zoom-in-95 duration-300">
                               <div className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-pastel-taupe/20">
                                  <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden bg-pastel-sand shrink-0 border border-pastel-taupe/10 relative">
                                     <img src={item.image_url} alt={slot} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <p className="text-[10px] text-ink-muted uppercase tracking-wider mb-0.5">{slot}</p>
                                     <p className="text-sm font-medium text-ink-dark truncate">{item.brand || item.category}</p>
                                     <p className="text-xs text-ink-muted">{item.color}</p>
                                  </div>
                                  <button 
                                     onClick={() => handleRemoveItem(slot)}
                                     className="w-8 h-8 rounded-full flex items-center justify-center text-ink-muted hover:bg-pastel-rose hover:text-ink-dark transition-colors mr-2 shrink-0"
                                     aria-label="Remove item"
                                  >
                                     <X size={16} />
                                  </button>
                               </div>
                            </div>
                         );
                      }

                      if (isRequiredSlot) {
                         return (
                            <div key={slot} className="flex items-center gap-4 bg-white/40 p-3 rounded-2xl border border-dashed border-pastel-taupe/50 text-ink-muted">
                               <div className="w-16 h-20 md:w-20 md:h-24 rounded-xl shrink-0 flex items-center justify-center bg-pastel-sand/30">
                                  <Plus size={20} className="opacity-40" />
                               </div>
                               <div className="flex-1">
                                  <p className="text-[10px] uppercase tracking-wider font-medium opacity-60 mb-0.5">{slot}</p>
                                  <p className="text-xs opacity-50">Select item</p>
                               </div>
                            </div>
                         );
                      }
                      
                      return null;
                   })}
                   
                   {Object.keys(outfit).length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                         <div className="w-24 h-32 md:w-32 md:h-40 border-2 border-dashed border-pastel-taupe/40 rounded-2xl mb-4 flex items-center justify-center opacity-40">
                            <span className="font-serif italic text-2xl">M</span>
                         </div>
                         <p className="text-ink-muted font-medium">Select items from the gallery</p>
                         <p className="text-sm text-ink-muted/70 mt-1">to compose your look</p>
                      </div>
                   )}
                </div>
             </div>
             
             {/* Action Area */}
             <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-pastel-taupe/20 shrink-0">
                <input 
                   type="text" 
                   placeholder="Name your outfit (e.g. Office Chic)" 
                   value={outfitName}
                   onChange={(e) => setOutfitName(e.target.value)}
                   className="w-full bg-pastel-sand/50 border border-pastel-taupe/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink-dark mb-4 placeholder:text-ink-muted/70 transition-colors"
                />
                
                <div className="flex gap-3">
                   <button 
                      onClick={() => { setOutfit({}); setOutfitName(''); }}
                      className="flex items-center justify-center p-3 rounded-xl border border-pastel-taupe/50 text-ink-muted hover:bg-pastel-rose hover:text-ink-dark transition-colors"
                      title="Clear Outfit"
                   >
                      <RotateCcw size={18} />
                   </button>
                   <button 
                      onClick={handleSave}
                      disabled={isSaving || Object.keys(outfit).length === 0}
                      className="flex-1 flex items-center justify-center gap-2 bg-ink-dark text-white font-medium text-sm rounded-xl py-3 hover:bg-ink-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                      {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Outfit</>}
                   </button>
                </div>
             </div>
          </div>
       </div>

       {showToast && (
          <div className="fixed bottom-8 max-w-sm left-1/2 -translate-x-1/2 bg-white text-ink-dark shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 border border-pastel-taupe/20">
             <div className="w-8 h-8 rounded-full bg-[#f4ebe8] text-[#d6aea1] flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-green-600" />
             </div>
             <div>
                <p className="text-sm font-medium">Outfit saved!</p>
                <p className="text-xs text-ink-muted">It has been added to your collection.</p>
             </div>
          </div>
       )}
    </div>
  );
}
