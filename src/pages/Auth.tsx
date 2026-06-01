import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Registration successful! You can now log in.' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onAuthSuccess();
      }
    } catch (error: any) {
      if (error.message.includes('placeholder')) {
         setMessage({ type: 'error', text: 'Please configure your Supabase connection in settings (.env)' });
      } else {
         setMessage({ type: 'error', text: error.message || 'An error occurred during authentication.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pastel-sand p-6">
      <div className="w-full max-w-md bg-white rounded-[24px] shadow-sm border border-pastel-taupe/20 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-pastel-blush flex items-center justify-center mb-4">
            <span className="font-serif italic font-medium text-ink-dark text-xl">I</span>
          </div>
          <h1 className="font-serif text-3xl text-ink-dark font-medium text-center">
            {isSignUp ? 'Join the Wardrobe' : 'Welcome Back'}
          </h1>
          <p className="text-ink-muted text-sm mt-2 text-center">
            {isSignUp 
              ? 'Create an account to build your digital closet.' 
              : 'Enter your credentials to access your closet.'}
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm ${
            message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-medium text-ink-muted ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/50" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-pastel-sand/30 border border-pastel-taupe/30 focus:outline-none focus:border-ink-dark focus:ring-1 focus:ring-ink-dark transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider font-medium text-ink-muted ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/50" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-pastel-sand/30 border border-pastel-taupe/30 focus:outline-none focus:border-ink-dark focus:ring-1 focus:ring-ink-dark transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-ink-dark text-white rounded-full py-3 md:py-4 font-medium flex justify-center items-center gap-2 hover:bg-ink-dark/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-sm text-ink-muted hover:text-ink-dark transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
