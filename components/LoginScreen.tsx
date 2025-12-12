import React, { useState } from 'react';
import { UserProfile, Gender, BodyShape, SkinTone } from '../types';
import { ArrowRight, Smartphone, Sparkles, Loader2, Lock } from 'lucide-react';

interface Props {
  onLogin: (profile: UserProfile) => void;
}

// Default profile for the Demo User
const DEMO_PROFILE: UserProfile = {
  name: "Alex",
  age: 28,
  gender: Gender.Female,
  bodyShape: BodyShape.Hourglass,
  skinTone: SkinTone.MediumNeutral,
  heightCm: 165,
  location: "New York",
  stylePreferences: ["Minimalist", "Chic"],
  budget: 'Medium',
  favoriteShades: []
};

const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError('');
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 4) {
      setError('Please enter the 4-digit code');
      return;
    }
    setLoading(true);
    setError('');
    
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      // For real login, this would fetch the specific user's profile
      // We will create a fresh profile for a new phone login for now
      const newProfile: UserProfile = {
        ...DEMO_PROFILE,
        name: "Member",
        location: "Unknown",
        stylePreferences: []
      };
      onLogin(newProfile);
    }, 1500);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin(DEMO_PROFILE);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-200/40 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden relative z-10">
        <div className="p-8 md:p-10 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">Ixora.</h1>
            <p className="text-stone-500 font-medium">Your Personal AI Stylist</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {step === 'phone' ? (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Mobile Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-800"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                 <div className="text-center mb-6">
                    <p className="text-sm text-stone-500">We sent a code to <span className="font-bold text-stone-800">{phone}</span></p>
                    <button onClick={() => setStep('phone')} className="text-xs text-rose-500 hover:underline mt-1">Change number</button>
                 </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2 ml-1">Verification Code</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <input
                      type="text"
                      maxLength={4}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="• • • •"
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-800 tracking-widest text-center text-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Login"}
                </button>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-stone-400">Or</span>
              </div>
            </div>

            <button
              onClick={handleDemoLogin}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
               <Sparkles className="w-4 h-4" /> Try Demo Account
            </button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-stone-50 p-4 text-center border-t border-stone-100">
            <p className="text-xs text-stone-400">By logging in, you agree to our Terms & Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;