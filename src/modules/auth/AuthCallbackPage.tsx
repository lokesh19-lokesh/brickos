import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Allow Supabase client to exchange hash or query code for session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.user) {
          // If session is not immediately ready, wait for onAuthStateChange
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession?.user && isMounted) {
              subscription.unsubscribe();
              await proceedWithUser();
            }
          });

          // Timeout fallback after 6 seconds
          setTimeout(() => {
            if (isMounted && !error) {
              setError('Authentication timed out. Please try signing in again.');
            }
          }, 6000);
          return;
        }

        await proceedWithUser();
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        if (isMounted) {
          setError(err.message || 'Google authentication failed.');
        }
      }
    };

    const proceedWithUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!isMounted) return;

        if (user) {
          const isSuperAdmin = user.role === 'super_admin' || user.email?.toLowerCase() === 'brickserpsoftware@gmail.com';
          if (isSuperAdmin) {
            toast.success('Welcome back, Super Admin!');
            navigate('/admin/dashboard', { replace: true });
          } else {
            toast.success(`Welcome, ${user.fullName || 'Factory Owner'}!`);
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e.message || 'Failed to complete profile synchronization.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Authentication Failed</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <Button
            variant="primary"
            className="w-full font-bold"
            onClick={() => navigate('/login', { replace: true })}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 via-slate-50 to-white px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <img
          src="/logo.png"
          alt="BrickFlow ERP"
          className="h-14 w-auto mx-auto object-contain animate-pulse"
        />
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-lg">
            <Loader2 className="w-5 h-5 animate-spin text-[#E53935]" />
            <span>Connecting with Google</span>
          </div>
          <p className="text-xs text-slate-500">
            Synchronizing your enterprise factory profile and setting up workspace...
          </p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#E53935] h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
