import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Sparkles, CloudSun, MapPin, Palette } from 'lucide-react';

interface ClothingItem {
  id: string;
  image_url: string;
  category: string;
  color: string;
  brand?: string;
}

export function AIStylist() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [weather, setWeather] = useState('');
  const [occasion, setOccasion] = useState('');
  const [preferredColor, setPreferredColor] = useState('');
  
  const [isRecommending, setIsRecommending] = useState(false);
  const [suggestion, setSuggestion] = useState<{outfitIds: string[], description: string} | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase.from('clothing_items').select('*');
        if (!error && data) {
          setItems(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleRecommend = async () => {
    if (items.length === 0) {
       alert("Your closet is empty. Upload some items first!");
       return;
    }

    setIsRecommending(true);
    setSuggestion(null);

    try {
      const response = await fetch('/api/recommend-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weather,
          occasion,
          preferredColor,
          wardrobe: items
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to get recommendation');
      }

      const data = await response.json();
      setSuggestion(data);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Error communicating with AI Stylist');
    } finally {
      setIsRecommending(false);
    }
  };

  const suggestedItems = suggestion 
     ? items.filter(item => suggestion.outfitIds.includes(item.id))
     : [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto pb-20">
      <header className="mb-10 text-center md:text-left">
        <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-3 flex items-center justify-center md:justify-start gap-3">
           <Sparkles className="text-pastel-taupe" size={32} />
           AI Stylist
        </h2>
        <p className="text-ink-muted">Discover new looks from your existing wardrobe.</p>
      </header>

      {loading ? (
         <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-ink-muted" size={32} />
         </div>
      ) : (
         <div className="grid md:grid-cols-12 gap-8">
            {/* Input Panel */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
               <div className="bg-white rounded-[2rem] p-6 lg:p-8 border border-pastel-taupe/20 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 text-pastel-taupe/20 pointer-events-none">
                     <Sparkles size={120} strokeWidth={0.5} />
                  </div>
                  
                  <h3 className="font-serif text-xl tracking-wide mb-6 relative z-10 text-ink-dark">Preferences</h3>
                  
                  <div className="space-y-5 relative z-10">
                     <div className="space-y-2">
                        <label className="text-xs font-medium text-ink-muted uppercase tracking-wider flex items-center gap-2">
                           <CloudSun size={14} /> Weather
                        </label>
                        <select 
                           value={weather}
                           onChange={(e) => setWeather(e.target.value)}
                           className="w-full bg-pastel-sand/50 border border-pastel-taupe/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink-dark transition-colors appearance-none"
                        >
                           <option value="">Any</option>
                           <option value="Hot & Sunny">Hot & Sunny</option>
                           <option value="Warm & Breezy">Warm & Breezy</option>
                           <option value="Cool / Mild">Cool / Mild</option>
                           <option value="Cold / Freezing">Cold / Freezing</option>
                           <option value="Rainy">Rainy</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-medium text-ink-muted uppercase tracking-wider flex items-center gap-2">
                           <MapPin size={14} /> Occasion
                        </label>
                        <select 
                           value={occasion}
                           onChange={(e) => setOccasion(e.target.value)}
                           className="w-full bg-pastel-sand/50 border border-pastel-taupe/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink-dark transition-colors appearance-none"
                        >
                           <option value="">Any</option>
                           <option value="Casual / Everyday">Casual / Everyday</option>
                           <option value="Office / Work">Office / Work</option>
                           <option value="Night Out / Party">Night Out / Party</option>
                           <option value="Formal Event">Formal Event</option>
                           <option value="Workout / Active">Workout / Active</option>
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs font-medium text-ink-muted uppercase tracking-wider flex items-center gap-2">
                           <Palette size={14} /> Color Preference (Optional)
                        </label>
                        <input 
                           type="text" 
                           placeholder="e.g. Earth tones, Black" 
                           value={preferredColor}
                           onChange={(e) => setPreferredColor(e.target.value)}
                           className="w-full bg-pastel-sand/50 border border-pastel-taupe/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink-dark transition-colors"
                        />
                     </div>
                  </div>

                  <button 
                     onClick={handleRecommend}
                     disabled={isRecommending || items.length === 0}
                     className="w-full mt-8 bg-ink-dark text-white rounded-xl py-4 font-medium flex justify-center items-center gap-2 hover:bg-ink-dark/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                     {isRecommending ? (
                        <><Loader2 size={18} className="animate-spin" /> Suggesting...</>
                     ) : (
                        <><Sparkles size={18} /> Get Recommendation</>
                     )}
                  </button>
               </div>
            </div>

            {/* Results Panel */}
            <div className="md:col-span-7 lg:col-span-8">
               <div className="bg-pastel-rose/20 rounded-[2rem] p-6 lg:p-8 border border-pastel-taupe/20 shadow-sm h-full flex flex-col min-h-[500px]">
                  
                  {!suggestion && !isRecommending && (
                     <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                           <Sparkles size={32} className="text-pastel-taupe" />
                        </div>
                        <h3 className="font-serif text-2xl text-ink-dark mb-2">Ready to style you</h3>
                        <p className="text-ink-muted max-w-md mx-auto">Set your preferences and let our AI curate the perfect outfit using pieces from your closet.</p>
                     </div>
                  )}

                  {isRecommending && (
                     <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                        <div className="relative w-24 h-24 mb-8">
                           <div className="absolute inset-0 border-4 border-pastel-taupe/20 align-top rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-ink-dark rounded-full animate-spin border-t-transparent"></div>
                           <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-ink-dark animate-pulse" />
                        </div>
                        <h3 className="font-serif text-xl text-ink-dark">Analyzing your wardrobe...</h3>
                        <p className="text-sm text-ink-muted mt-2">Finding the perfect combination</p>
                     </div>
                  )}

                  {suggestion && !isRecommending && (
                     <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 h-full flex flex-col">
                        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-pastel-taupe/20 mb-8 shrink-0">
                           <h3 className="font-serif text-lg font-medium text-ink-dark mb-2 flex items-center gap-2">
                              <Sparkles size={18} className="text-yellow-500" /> Stylist Note
                           </h3>
                           <p className="text-ink-muted text-sm leading-relaxed">{suggestion.description}</p>
                        </div>

                        <div className="flex-1">
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                              {suggestedItems.length > 0 ? suggestedItems.map(item => (
                                 <div key={item.id} className="group bg-white p-3 rounded-2xl shadow-sm border border-pastel-taupe/10 relative">
                                    <div className="w-full aspect-[3/4] bg-pastel-sand rounded-xl overflow-hidden mb-3 border border-pastel-taupe/10 relative">
                                       <img src={item.image_url} alt={item.category} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                       <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                                          <p className="text-[10px] font-medium uppercase tracking-wider text-ink-dark">{item.category}</p>
                                       </div>
                                    </div>
                                    <h4 className="text-sm font-medium text-ink-dark truncate">{item.brand || item.category}</h4>
                                    <p className="text-xs text-ink-muted capitalize">{item.color}</p>
                                 </div>
                              )) : (
                                 <div className="col-span-full text-center py-12">
                                    <p className="text-ink-muted">No items matched the recommendation IDs. There might be a sync issue.</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
