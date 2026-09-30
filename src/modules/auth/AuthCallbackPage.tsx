import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export const AuthCallbackPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // 1. Parse URL: check both query params and hash fragment
        const searchParams = new URLSearchParams(window.location.search);
        const rawHash = window.location.hash.startsWith('#')
          ? window.location.hash.slice(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(rawHash);

        // 2. Check for explicit errors first
        const errorMsg =
          searchParams.get('error_description') ||
          searchParams.get('error') ||
          hashParams.get('error_description') ||
          hashParams.get('error');

        if (errorMsg) {
          throw new Error(decodeURIComponent(errorMsg));
        }

        // 3. Detect PASSWORD_RECOVERY type (Supabase sends `type=recovery` in hash or query)
        const callbackType =
          searchParams.get('type') ||
          hashParams.get('type') ||
          '';

        const isPasswordRecovery = callbackType === 'recovery';

        // 4. Exchange PKCE code for session if present
        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('Code exchange notice:', exchangeError.message);
          }
        }

        // 5. Listen for Supabase auth state changes (handles hash-based tokens)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;

          // PASSWORD_RECOVERY event means this is a reset password link click
          if (event === 'PASSWORD_RECOVERY' || isPasswordRecovery) {
            subscription.unsubscribe();
            if (isMounted) {
              setIsRecovery(true);
              toast.info('Recovery link verified. Please set your new password.');
              navigate('/reset-password', { replace: true });
            }
            return;
          }

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
            subscription.unsubscribe();
            await proceedWithUser();
          }
        });

        // 6. Also check if there's already an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user && isMounted) {
          // If this came from a recovery link, redirect to reset password
          if (isPasswordRecovery) {
            setIsRecovery(true);
            toast.info('Recovery link verified. Please set your new password.');
            subscription.unsubscribe();
            navigate('/reset-password', { replace: true });
            return;
          }
          subscription.unsubscribe();
          await proceedWithUser();
          return;
        }

        // 7. Timeout fallback after 8 seconds
        setTimeout(() => {
          if (isMounted && !error) {
            setError('Authentication timed out. Please try signing in again.');
          }
        }, 8000);

      } catch (err: any) {
        console.error('Auth Callback Error:', err);
        if (isMounted) {
          setError(err.message || 'Authentication failed. Please try again.');
        }
      }
    };

    const proceedWithUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!isMounted) return;

        if (user) {
          const isSuperAdmin =
            user.role === 'super_admin' ||
            user.email?.toLowerCase() === 'brickserpsoftware@gmail.com';
          if (isSuperAdmin) {
            toast.success('Welcome back, Super Admin!');
            navigate('/admin/dashboard', { replace: true });
          } else {
            toast.success(`Welcome, ${user.fullName || 'Factory Owner'}!`);
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
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
            <span>
              {isRecovery ? 'Verifying Recovery Link...' : 'Connecting your account...'}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isRecovery
              ? 'Validating your password reset token...'
              : 'Synchronizing your enterprise factory profile...'}
          </p>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#E53935] h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
};
