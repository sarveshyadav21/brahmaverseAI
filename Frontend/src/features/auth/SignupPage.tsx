import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PhoneField } from './components/PhoneField';
import { Button } from '@/components/Button';
import { requestOtp } from '@/api/auth.api';
import { PHONE_LENGTH } from '@/lib/constants';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = phone.length === PHONE_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      await requestOtp(phone);
      navigate('/verify', { state: { phone } });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to request OTP. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Card Container */}
        <div className="bg-white py-8 px-6 shadow-subtle sm:shadow-card rounded-3xl border border-gray-100 flex flex-col min-h-[540px] justify-between">
          <div>
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full text-brand hover:bg-orange-50 active:scale-95 flex items-center justify-center transition-all mb-4"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Headers */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Sign Up to Fastor
              </h1>
              <p className="text-xs text-gray-400 font-normal leading-relaxed pr-4">
                Let us know your mobile number and we will send you an OTP for
                verification.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <PhoneField
                value={phone}
                onChange={(val) => {
                  setPhone(val);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                error={error || undefined}
              />

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!isValid}
                  isLoading={isLoading}
                  className="w-full"
                >
                  Get OTP
                </Button>

                <p className="text-[11px] text-center text-gray-400 leading-normal">
                  By clicking, I accept the{' '}
                  <a
                    href="#terms"
                    className="underline text-gray-600 hover:text-brand"
                  >
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="#privacy"
                    className="underline text-gray-600 hover:text-brand"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </form>
          </div>

          {/* Quick Demo Helper Hint */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-[11px] bg-orange-50 text-brand px-3 py-1 rounded-full font-semibold">
              Demo: Any 10-digit phone number is accepted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
