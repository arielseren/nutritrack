import React from 'react';
import { Home, BookOpen, PlusCircle, BookMarked, User } from 'lucide-react';

export type NavTab = 'dashboard' | 'diary' | 'plans' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-lg border-t border-surface-container-high shadow-[0_-4px_24px_0_rgba(0,107,95,0.06)] pt-1.5 px-4 bottom-nav-safe">
      <div className="w-full max-w-[480px] mx-auto flex items-center justify-between">
        {/* דף הבית */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 ${
            activeTab === 'dashboard'
              ? 'text-primary font-bold scale-105'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'dashboard' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">דף הבית</span>
        </button>

        {/* יומן */}
        <button
          onClick={() => onTabChange('diary')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 ${
            activeTab === 'diary'
              ? 'text-primary font-bold scale-105'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'diary' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">יומן</span>
        </button>

        {/* כפתור הוספה ראשי מודגש */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickAdd}
            aria-label="הוסף מזון או סרוק ברקוד"
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-tertiary to-tertiary-container text-white shadow-lg shadow-tertiary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <PlusCircle className="w-7 h-7" />
          </button>
        </div>

        {/* תפריטים */}
        <button
          onClick={() => onTabChange('plans')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 ${
            activeTab === 'plans'
              ? 'text-primary font-bold scale-105'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'plans' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <BookMarked className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">תפריטים</span>
        </button>

        {/* פרופיל */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-200 ${
            activeTab === 'profile'
              ? 'text-primary font-bold scale-105'
              : 'text-outline hover:text-on-surface'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'profile' ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5">פרופיל</span>
        </button>
      </div>
    </nav>
  );
};
