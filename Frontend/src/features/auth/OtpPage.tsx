import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OtpInput } from './components/OtpInput';
import { Button } from '@/components/Button';
import { useCountdown } from '@/hooks/useCountdown';
import { verifyOtp, requestOtp } from '@/api/auth.api';
import { useAuthStore } from './auth.store';
import {
  OTP_LENGTH,
  RESEND_COUNTDOWN_SECONDS,
  DEMO_OTP,
  PHONE_PREFIX,
} from '@/lib/constants';
import { formatSeconds } from '@/lib/format';

export const OtpPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const phone = (location.state as { phone?: string })?.phone;

  // Redirect back to signup if phone is missing
  if (!phone) {
    return <Navigate to="/signup" replace />;
  }

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { seconds, isComplete, reset: resetCountdown } = useCountdown(
    RESEND_COUNTDOWN_SECONDS
  );

  const isValid = otp.length === OTP_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await verifyOtp(phone, otp);
      setSession(response.token, response.user);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid verification code. Please try again.'
      );
      setOtp(''); // Clear boxes on error per plan
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setError(null);

    try {
      await requestOtp(phone);
      resetCountdown();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resend code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-subtle sm:shadow-card rounded-3xl border border-gray-100 flex flex-col min-h-[540px] justify-between">
          <div>
            {/* Back button to signup */}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-8 h-8 rounded-full text-brand hover:bg-orange-50 active:scale-95 flex items-center justify-center transition-all mb-4"
              aria-label="Back to sign up"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Headers */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                6-digit code
              </h1>
              <p className="text-xs text-gray-400 font-normal leading-relaxed pr-2">
                Please enter the code we've sent to{' '}
                <span className="font-semibold text-gray-700">
                  {PHONE_PREFIX} {phone}
                </span>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <OtpInput
                value={otp}
                onChange={(val) => {
                  setOtp(val);
                  if (error) setError(null);
                }}
                disabled={isLoading}
              />

              {error && (
                <p className="text-xs text-red-500 font-medium text-center">
                  {error}
                </p>
              )}

              {/* Countdown / Resend Button */}
              <div className="text-center text-xs text-gray-500 font-medium">
                {isComplete ? (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="text-brand font-bold underline hover:text-brand-hover focus:outline-none"
                  >
                    {isResending ? 'Sending new code...' : 'Resend code'}
                  </button>
                ) : (
                  <span>
                    I didn't receive a code{' '}
                    <span className="text-brand font-bold">
                      ({formatSeconds(seconds)})
                    </span>
                  </span>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isValid}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </form>
          </div>

          {/* Quick Demo Code Hint */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] bg-orange-50 text-brand px-3 py-1 rounded-full font-semibold">
              Demo OTP: <strong className="font-extrabold">{DEMO_OTP}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
