import { Calendar, LayoutDashboard, Shirt, PlusCircle, Sparkles } from 'lucide-react';
import React from 'react';

interface SidebarProps {
  currentRoute: string;
  onRouteChange: (route: string) => void;
}

export function Sidebar({ currentRoute, onRouteChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'closet', label: 'My Wardrobe', icon: Shirt },
    { id: 'builder', label: 'Outfit Builder', icon: PlusCircle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'aistylist', label: 'AI Stylist', icon: Sparkles },
  ];

  return (
    <aside className="w-full md:w-64 bg-pastel-blush/50 border-b md:border-r border-pastel-taupe/30 flex flex-col pt-4 md:pt-12 px-6 h-auto md:h-screen md:sticky md:top-0">
      <div className="flex items-center gap-3 mb-8 md:mb-12">
        <div className="w-8 h-8 rounded-full bg-pastel-taupe flex items-center justify-center">
          <span className="font-serif italic font-medium text-ink-dark">I</span>
        </div>
        <h1 className="font-serif text-xl md:text-2xl tracking-widest font-medium text-ink-dark uppercase">ISHU'S Wardrobe</h1>
      </div>
      
      <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onRouteChange(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white shadow-sm text-ink-dark font-medium' 
                  : 'text-ink-muted hover:bg-pastel-rose/50 hover:text-ink-dark'
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto hidden md:block pb-8">
        <div className="p-4 bg-pastel-rose/40 rounded-2xl">
          <p className="text-xs text-ink-muted mb-2 font-medium uppercase tracking-wider">Storage</p>
          <div className="h-1.5 w-full bg-pastel-taupe/30 rounded-full mb-2">
            <div className="h-full bg-ink-dark rounded-full w-3/4"></div>
          </div>
          <p className="text-xs text-ink-muted">124 / 200 items</p>
        </div>
      </div>
    </aside>
  );
}
