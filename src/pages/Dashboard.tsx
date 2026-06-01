import { mockCloset, mockOutfits } from '../data';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Dashboard({ onRouteChange }: { onRouteChange: (route: string) => void }) {
  const recentItems = mockCloset.slice(0, 3);
  
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h2 className="font-serif text-3xl md:text-4xl text-ink-dark mb-2">Welcome back, Ishu</h2>
        <p className="text-ink-muted font-light">Here's an overview of your wardrobe today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Quick Stats / Today's Outfit */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-pastel-taupe/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-pastel-taupe/40">
             <Sparkles size={120} strokeWidth={1} />
          </div>
          <div className="relative z-10 w-full md:w-2/3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-rose/50 text-xs font-medium text-ink-muted tracking-wide uppercase mb-4">
              <span>Today's Outfit</span>
            </div>
            <h3 className="font-serif text-2xl mb-4">Office Chic</h3>
            <p className="text-ink-muted leading-relaxed mb-6">
              A curated selection for your 10 AM meeting. Effortless, professional, and comfortable.
            </p>
            <div className="flex -space-x-4 mb-6">
              {mockOutfits[0].items.map((item, i) => (
                <div key={i} className="w-14 h-14 rounded-full border-2 border-white overflow-hidden bg-pastel-sand">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <button 
              onClick={() => onRouteChange('builder')}
              className="bg-ink-dark text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-ink-dark/90 transition-colors flex items-center gap-2"
            >
              Edit Outfit <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-pastel-rose/30 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-xl mb-6">Closet Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-pastel-taupe/20 pb-3">
                <span className="text-ink-muted">Total Items</span>
                <span className="font-medium">124</span>
              </div>
              <div className="flex justify-between items-center border-b border-pastel-taupe/20 pb-3">
                <span className="text-ink-muted">Total Outfits</span>
                <span className="font-medium">32</span>
              </div>
              <div className="flex justify-between items-center border-b border-pastel-taupe/20 pb-3">
                <span className="text-ink-muted">Most Worn Color</span>
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-black"></div> Black
                </span>
              </div>
            </div>
          </div>
          <button 
             onClick={() => onRouteChange('closet')}
             className="w-full py-3 mt-6 text-sm font-medium border border-ink-dark/10 rounded-xl hover:bg-white transition-colors"
          >
            View Entire Closet
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-serif text-2xl">Recently Added</h3>
          <button 
             onClick={() => onRouteChange('closet')}
             className="text-sm font-medium text-ink-muted hover:text-ink-dark transition-colors"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {recentItems.map(item => (
            <div key={item.id} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-white mb-3">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <h4 className="font-medium text-sm md:text-base truncate">{item.name}</h4>
              <p className="text-xs md:text-sm text-ink-muted">{item.brand}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
