import React, { useState } from 'react';
import { User, Lock, Mail, X, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import type { UserProfile } from '../../types';

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
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setIsSuccess(false);
      setEmail(currentUser.email || '');
      setPassword('');
      setName(currentUser.name || '');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('נא למלא את כל השדות');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('הסיסמה חייבת להכיל לפחות 4 תווים');
      return;
    }

    // Save/Update user profile in LocalStorage
    const updatedUser: UserProfile = {
      ...currentUser,
      email: email.trim(),
      name: isRegisterMode ? (name.trim() || currentUser.name) : (currentUser.name || name.trim() || 'דני'),
    };

    // Save to users registry
    try {
      const existingUsersRaw = localStorage.getItem('nutritrack_users');
      const existingUsers: UserProfile[] = existingUsersRaw ? JSON.parse(existingUsersRaw) : [];
      const userIndex = existingUsers.findIndex((u) => u.email === updatedUser.email);
      if (userIndex >= 0) {
        existingUsers[userIndex] = updatedUser;
      } else {
        existingUsers.push(updatedUser);
      }
      localStorage.setItem('nutritrack_users', JSON.stringify(existingUsers));
    } catch (e) {
      console.warn(e);
    }

    setIsSuccess(true);
    setTimeout(() => {
      onLoginSuccess(updatedUser);
      onClose();
    }, 600);
  };

  const handleGuestContinue = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[440px] max-h-[92vh] bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-surface-container-high">
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                {isRegisterMode ? 'יצירת חשבון חדש' : 'התחברות לחשבון'}
              </h3>
              <p className="text-xs text-outline">
                {isRegisterMode
                  ? 'הצטרף ל-NutriTrack וסנכרן את היעדים שלך'
                  : 'שמור וגבה את נתוני התזונה שלך'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-surface-container-low rounded-2xl border border-surface-container-high text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                !isRegisterMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              התחברות
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all ${
                isRegisterMode
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              הרשמה
            </button>
          </div>

          {/* Name field (for registration) */}
          {isRegisterMode && (
            <div>
              <label className="font-bold text-on-surface block mb-1">שם מלא</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: דני כהן"
                  className="w-full bg-surface-container-low text-on-surface py-2.5 pr-9 pl-3 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none"
                />
                <User className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="font-bold text-on-surface block mb-1">כתובת אימייל</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-surface-container-low text-on-surface py-2.5 pr-9 pl-3 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none text-left"
                dir="ltr"
              />
              <Mail className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="font-bold text-on-surface block mb-1">סיסמה</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container-low text-on-surface py-2.5 pr-9 pl-3 rounded-xl border border-surface-container-high focus:ring-2 focus:ring-primary outline-none text-left"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-outline absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-error-container/40 text-error text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-2"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSuccess
                ? 'בוצע בהצלחה!'
                : isRegisterMode
                ? 'צור חשבון והתחל'
                : 'התחבר עכשיו'}
            </span>
          </button>

          {/* Guest / Privacy note */}
          <div className="pt-2 text-center space-y-2">
            <div className="flex items-center justify-center gap-1 text-[11px] text-outline">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>הנתונים נשמרים ומאובטחים ישירות במכשירך</span>
            </div>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-xs text-primary font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <span>המשך כאורח ללא הרשמה</span>
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
