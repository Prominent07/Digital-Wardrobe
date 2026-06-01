import { useState, useEffect } from 'react';
import { Filter, Search, Plus, Trash2, Edit2, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ClothingItem {
  id: string;
  image_url: string;
  category: string;
  color: string;
  season?: string;
  occasion?: string;
  brand?: string;
}

const getColorStyle = (colorName: string) => {
  if (!colorName) return { backgroundColor: '#e5e7eb' };
  const normColor = colorName.toLowerCase();
  if (normColor === 'multi') return { background: 'linear-gradient(45deg, #f9a8d4, #93c5fd, #fde047)' };
  if (normColor === 'white') return { backgroundColor: '#fcfcfc' };
  if (normColor === 'beige') return { backgroundColor: '#f5f5dc' };
  if (normColor === 'navy') return { backgroundColor: '#1e3a8a' };
  return { backgroundColor: normColor };
};

export function Closet({ onRouteChange }: { onRouteChange?: (route: string) => void }) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const categories = ['All', 'Top', 'Bottom', 'Dress', 'Footwear', 'Accessories', 'Outerwear'];
  const colors = ['All', 'Black', 'White', 'Beige', 'Navy', 'Red', 'Pink', 'Green', 'Blue', 'Brown', 'Grey', 'Multi'];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching items:', error);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase.from('clothing_items').delete().eq('id', id);
      if (error) throw error;
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Could not delete item.');
    }
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    alert('Edit functionality coming soon for item: ' + id);
  };
  
  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'All' || item.category === filter;
    const matchesColor = colorFilter === 'All' || item.color === colorFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
      (item.category && item.category.toLowerCase().includes(searchLower)) ||
      (item.color && item.color.toLowerCase().includes(searchLower));
      
    return matchesCategory && matchesColor && matchesSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-2">My Wardrobe</h2>
          <p className="text-ink-muted mt-2">Manage and organize your collection.</p>
        </div>
        
        <button 
          onClick={() => onRouteChange?.('upload')}
          className="bg-ink-dark text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-ink-dark/90 transition-colors flex items-center justify-center gap-2 max-w-[200px]"
        >
          <Plus size={16} /> Add Item
        </button>
      </header>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 mb-8 bg-white p-4 rounded-3xl border border-pastel-taupe/20 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search by brand, category, or color..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-pastel-sand/50 border border-pastel-taupe/30 focus:border-ink-dark focus:ring-0 text-sm outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={colorFilter}
              onChange={(e) => setColorFilter(e.target.value)}
              className="bg-pastel-sand/50 border border-pastel-taupe/30 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-ink-dark text-ink-dark cursor-pointer appearance-none min-w-[120px]"
            >
              <option disabled>Color</option>
              {colors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                filter === cat 
                  ? 'bg-ink-dark text-white shadow-md font-medium' 
                  : 'bg-pastel-sand/50 text-ink-muted hover:bg-pastel-rose hover:text-ink-dark border border-pastel-taupe/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
          <Loader2 className="animate-spin mb-4" size={32} />
          <p>Loading your closet...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-pastel-taupe/50">
          <div className="w-16 h-16 rounded-full bg-pastel-sand flex items-center justify-center mx-auto mb-4 text-ink-muted">
            <Filter size={24} />
          </div>
          <h3 className="font-serif text-xl mb-2">No items found</h3>
          <p className="text-ink-muted text-sm max-w-sm mx-auto mb-6">
            Try adjusting your filters or upload a new item to your closet.
          </p>
          <button 
            onClick={() => { setFilter('All'); setColorFilter('All'); setSearchQuery(''); }}
            className="text-sm font-medium border border-ink-dark/20 rounded-full px-6 py-2 hover:bg-pastel-sand transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className="group cursor-pointer flex flex-col">
              <div 
                className="aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-3 relative shadow-sm border border-pastel-taupe/10"
                onClick={() => setLightboxImage(item.image_url)}
              >
                <img 
                  src={item.image_url} 
                  alt={item.category} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:flex flex-col justify-end p-3 hidden">
                  <div className="flex justify-end gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <button 
                      onClick={(e) => handleEdit(item.id, e)}
                      className="w-8 h-8 rounded-full bg-white text-ink-dark flex items-center justify-center hover:bg-pastel-sand shadow-sm transition-colors"
                      aria-label="Edit item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="w-8 h-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 shadow-sm transition-colors"
                      aria-label="Delete item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Mobile actions (visible by default on touch devices, we'll just show them always on small screens using CSS) */}
                <div className="absolute top-2 right-2 flex gap-2 md:hidden">
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm text-red-500 flex items-center justify-center shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                </div>
              </div>
              <div className="px-1 flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <h4 className="font-medium text-sm md:text-base text-ink-dark capitalize truncate">
                    {item.brand ? `${item.brand} ${item.category}` : item.category}
                  </h4>
                  <p className="text-xs text-ink-muted capitalize flex items-center gap-1 mt-0.5">
                    {item.color}
                  </p>
                </div>
                <div 
                  className="w-4 h-4 rounded-full border border-ink-muted/20 shadow-sm shrink-0 mt-0.5" 
                  style={getColorStyle(item.color)}
                  title={item.color}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <button 
            className="absolute top-6 right-6 z-[60] bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X size={24} />
          </button>
          
          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 relative">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing">
                  <img 
                    src={lightboxImage} 
                    alt="High resolution item" 
                    className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm"
                    draggable={false}
                  />
                </TransformComponent>
              )}
            </TransformWrapper>
            
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white/80 text-sm z-[60]">
              <span>Pinch or double-click to zoom</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

