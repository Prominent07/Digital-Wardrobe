import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Closet } from './pages/Closet';
import { OutfitBuilder } from './pages/OutfitBuilder';
import { CalendarPage } from './pages/Calendar';
import { UploadItem } from './pages/UploadItem';
import { AIStylist } from './pages/AIStylist';
import Auth from './pages/Auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-pastel-sand flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-ink-muted" />
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => setCurrentRoute('dashboard')} />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-pastel-sand">
      <Sidebar currentRoute={currentRoute} onRouteChange={setCurrentRoute} />
      
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto w-full max-w-6xl mx-auto relative">
        {/* Top bar with sign out */}
        <div className="absolute top-4 right-6 md:top-8 md:right-10 z-10">
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs font-medium uppercase tracking-widest text-ink-muted hover:text-ink-dark transition-colors px-4 py-2 rounded-full border border-pastel-taupe/30 hover:bg-white bg-pastel-sand shadow-sm"
          >
            Sign Out
          </button>
        </div>

        <div className="pt-8 md:pt-0">
          {currentRoute === 'dashboard' && <Dashboard onRouteChange={setCurrentRoute} />}
          {currentRoute === 'closet' && <Closet onRouteChange={setCurrentRoute} />}
          {currentRoute === 'builder' && <OutfitBuilder />}
          {currentRoute === 'calendar' && <CalendarPage />}
          {currentRoute === 'aistylist' && <AIStylist />}
          {currentRoute === 'upload' && <UploadItem onRouteChange={setCurrentRoute} />}
        </div>
      </main>
    </div>
  );
}
