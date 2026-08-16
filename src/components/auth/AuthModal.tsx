import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Fingerprint,
  AlertCircle,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { StorageService, DEFAULT_USER_PROFILE } from '../../services/storageService';
import { BiometricAuthService } from '../../services/biometricAuthService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginWithPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('נא למלא אימייל וסיסמה');
      return;
    }

    setLoading(true);
    const users = StorageService.getUsersRegistry();
    const existingUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      const loggedIn: UserProfile = {
        ...existingUser,
        isLoggedIn: true,
      };
      onLoginSuccess(loggedIn);
      onClose();
    } else {
      // Create user if logging in for first time with default profile
      const newUser: UserProfile = {
        ...DEFAULT_USER_PROFILE,
        id: 'usr_' + Date.now(),
        name: email.split('@')[0],
        email: email.toLowerCase(),
        password,
        isLoggedIn: true,
      };
      onLoginSuccess(newUser);
      onClose();
    }
    setLoading(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('נא למלא את כל השדות');
      return;
    }

    setLoading(true);
    const users = StorageService.getUsersRegistry();
    const existing = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      setError('משתמש עם כתובת אימייל זו כבר קיים. עבור להתחברות.');
      setLoading(false);
      return;
    }

    const newUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: 'usr_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password,
      isLoggedIn: true,
      hasBiometrics: false,
    };

    onLoginSuccess(newUser);
    onClose();
    setLoading(false);
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setLoading(true);

    const isAvailable = await BiometricAuthService.isBiometricAvailable();
    if (!isAvailable) {
      setError('זיהוי ביומטרי אינו זמין במכשיר זה');
      setLoading(false);
      return;
    }

    const res = await BiometricAuthService.authenticateBiometrics(currentUser.biometricCredentialId);
    if (res.success) {
      const loggedIn: UserProfile = {
        ...currentUser,
        isLoggedIn: true,
      };
      onLoginSuccess(loggedIn);
      onClose();
    } else {
      setError(res.error || 'אימות ביומטרי נכשל. נסה באמצעות סיסמה.');
    }
    setLoading(false);
  };

  const handleContinueAsGuest = () => {
    const guestUser: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      id: 'guest_' + Date.now(),
      name: 'אורח',
      email: '',
      isLoggedIn: false,
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-[420px] p-6 shadow-2xl border border-outline-variant/30 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="סגור"
          className="absolute top-4 left-4 p-2 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-teal-400 p-0.5 mx-auto mb-3 shadow-md flex items-center justify-center">
            <img src="/icon.svg" alt="NutriTrack Logo" className="w-full h-full object-contain rounded-2xl" />
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface">
            {mode === 'login' ? 'ברוך הבא ל-NutriTrack' : 'יצירת חשבון חדש'}
          </h2>
          <p className="text-xs text-outline mt-0.5">
            {mode === 'login'
              ? 'התחבר כדי לסנכרן את יומן התזונה והיעדים שלך'
              : 'הירשם והתחל לנהל את התזונה היומית שלך בדיוק מרבי'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-surface-container-low p-1 rounded-2xl border border-surface-container-high mb-5">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>התחברות</span>
          </button>

          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>הרשמה חדשה</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/20 flex items-center gap-2 text-xs text-error font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Biometric Quick Login Button (when in Login mode) */}
        {mode === 'login' && (
          <div className="mb-4">
            <button
              type="button"
              disabled={loading}
              onClick={handleBiometricLogin}
              className="w-full py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98 shadow-xs"
            >
              <Fingerprint className="w-5 h-5 text-primary" />
              <span>התחבר עם טביעת אצבע / Face ID</span>
            </button>
            <div className="flex items-center my-3 gap-2">
              <div className="flex-1 h-px bg-surface-container-high" />
              <span className="text-[10px] text-outline">או באמצעות סיסמה</span>
              <div className="flex-1 h-px bg-surface-container-high" />
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={mode === 'login' ? handleLoginWithPassword : handleRegister} className="space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-[11px] font-bold text-outline block mb-1">שם מלא</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="לדוגמה: דניאל לוי"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                  required
                />
                <User className="w-4 h-4 text-outline absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-outline block mb-1">כתובת אימייל</label>
            <div className="relative">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                required
              />
              <Mail className="w-4 h-4 text-outline absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-outline block mb-1">סיסמה</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-hidden focus:border-primary"
                required
              />
              <Lock className="w-4 h-4 text-outline absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary font-headline font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>התחבר לחשבון</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>צור חשבון חדש</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Quick Links */}
        <div className="mt-5 pt-3 border-t border-surface-container-high text-center">
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="text-xs text-outline hover:text-on-surface font-semibold underline decoration-dotted"
          >
            המשך כאורח ללא הרשמה
          </button>
        </div>

      </div>
    </div>
  );
};
