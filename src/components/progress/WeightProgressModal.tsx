import React, { useState } from 'react';
import {
  X,
  Scale,
  TrendingDown,
  Plus,
  Trash2,
  Bell,
  Check,
  Award,
} from 'lucide-react';
import type { UserProfile, WeightLogEntry } from '../../types';
import { formatHebrewDate, getTodayDateString } from '../../services/nutritionCalculator';
import { NotificationService } from '../../services/notificationService';

interface WeightProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveWeight: (weight: number, date?: string, note?: string) => void;
  onDeleteWeightLog: (logId: string) => void;
  onUpdateReminderSettings: (settings: {
    weeklyWeightReminderEnabled: boolean;
    weeklyWeightReminderDay: number;
    weeklyWeightReminderTime: string;
  }) => void;
}

export const WeightProgressModal: React.FC<WeightProgressModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveWeight,
  onDeleteWeightLog,
  onUpdateReminderSettings,
}) => {
  const [newWeight, setNewWeight] = useState<string>('');
  const [logDate, setLogDate] = useState<string>(getTodayDateString());
  const [logNote, setLogNote] = useState<string>('');
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(
    userProfile.weeklyWeightReminderEnabled ?? true
  );
  const [reminderDay, setReminderDay] = useState<number>(
    userProfile.weeklyWeightReminderDay ?? 0
  );
  const [reminderTime, setReminderTime] = useState<string>(
    userProfile.weeklyWeightReminderTime || '08:00'
  );
  const [testSent, setTestSent] = useState<boolean>(false);

  if (!isOpen) return null;

  const initialWeight = userProfile.initialWeight || userProfile.currentWeight;
  const currentWeight = userProfile.currentWeight;
  const targetWeight = userProfile.targetWeight;

  const totalDelta = Number((currentWeight - initialWeight).toFixed(1));
  const remainingDelta = Number((currentWeight - targetWeight).toFixed(1));

  // Determine progress percentage
  const totalGoalDelta = initialWeight - targetWeight;
  let progressPct = 0;
  if (Math.abs(totalGoalDelta) > 0.1) {
    if (userProfile.goal === 'lose_weight') {
      progressPct = Math.min(100, Math.max(0, Math.round(((initialWeight - currentWeight) / totalGoalDelta) * 100)));
    } else {
      progressPct = Math.min(100, Math.max(0, Math.round(((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100)));
    }
  }

  // Weight logs sorted ascending for graph
  const rawLogs: WeightLogEntry[] = Array.isArray(userProfile.weightLogs) && userProfile.weightLogs.length > 0
    ? [...userProfile.weightLogs]
    : [
        {
          id: 'init',
          date: getTodayDateString(),
          weight: currentWeight,
          note: 'משקל התחלתי',
        },
      ];

  const graphLogs = [...rawLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const tableLogs = [...rawLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!w || w <= 20 || w >= 350) {
      alert('נא להזין משקל תקין בקילוגרמים');
      return;
    }
    onSaveWeight(w, logDate, logNote);
    setNewWeight('');
    setLogNote('');
  };

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled);
    onUpdateReminderSettings({
      weeklyWeightReminderEnabled: enabled,
      weeklyWeightReminderDay: reminderDay,
      weeklyWeightReminderTime: reminderTime,
    });
  };

  const handleReminderChange = (day: number, time: string) => {
    setReminderDay(day);
    setReminderTime(time);
    onUpdateReminderSettings({
      weeklyWeightReminderEnabled: reminderEnabled,
      weeklyWeightReminderDay: day,
      weeklyWeightReminderTime: time,
    });
  };

  const handleTestReminder = async () => {
    const sent = await NotificationService.sendNotification(
      '⚖️ תזכורת שקילה שבועית - NutriTrack',
      `בוקר טוב ${userProfile.name}! זה הזמן לעדכן את המשקל השבועי שלך כדי לעקוב אחר קצב ההתקדמות.`,
      { tag: 'nutritrack-weight-test' }
    );
    if (sent) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  // SVG Chart Computations
  const minW = Math.min(...graphLogs.map((l) => l.weight), targetWeight) - 1.5;
  const maxW = Math.max(...graphLogs.map((l) => l.weight), targetWeight, initialWeight) + 1.5;
  const range = maxW - minW || 1;

  const chartW = 380;
  const chartH = 140;
  const padX = 25;
  const padY = 20;

  const points = graphLogs.map((l, i) => {
    const x =
      graphLogs.length === 1
        ? chartW / 2
        : padX + (i / (graphLogs.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - ((l.weight - minW) / range) * (chartH - padY * 2);
    return { x, y, ...l };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Target horizontal line Y
  const targetY = chartH - padY - ((targetWeight - minW) / range) * (chartH - padY * 2);

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl w-full max-w-2xl max-h-[92dvh] flex flex-col shadow-2xl border border-outline-variant/30 overflow-hidden animate-modal-sheet">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-container-high bg-surface-container-lowest flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-base font-bold text-on-surface">
                מעקב משקל, גרפים והתקדמות
              </h2>
              <p className="text-xs text-outline">
                מעקב שקילות שבועי, קצב שינוי משקל ויעד אישי
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="סגור"
            className="p-2 rounded-xl text-outline hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          
          {/* 3 Main Stat Cards */}
          <div className="grid grid-cols-3 gap-2">
            {/* Initial Weight */}
            <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-center">
              <span className="text-[11px] font-bold text-outline block mb-0.5">משקל התחלתי</span>
              <span className="font-headline text-base sm:text-lg font-bold text-on-surface">
                {initialWeight} <span className="text-xs font-normal text-outline">ק"ג</span>
              </span>
            </div>

            {/* Current Weight */}
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center shadow-xs">
              <span className="text-[11px] font-bold text-primary block mb-0.5">משקל נוכחי</span>
              <span className="font-headline text-lg sm:text-xl font-extrabold text-primary">
                {currentWeight} <span className="text-xs font-normal">ק"ג</span>
              </span>
            </div>

            {/* Target Weight */}
            <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-container-high text-center">
              <span className="text-[11px] font-bold text-outline block mb-0.5">משקל יעד</span>
              <span className="font-headline text-base sm:text-lg font-bold text-tertiary">
                {targetWeight} <span className="text-xs font-normal text-outline">ק"ג</span>
              </span>
            </div>
          </div>

          {/* Progress & Milestone Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-on-surface flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                <span>התקדמות לעבר היעד: {progressPct}%</span>
              </span>
              <span className="font-bold text-primary">
                {userProfile.goal === 'lose_weight'
                  ? totalDelta <= 0
                    ? `ירדת ${Math.abs(totalDelta)} ק"ג עד כה`
                    : `עלייה של ${totalDelta} ק"ג`
                  : totalDelta >= 0
                  ? `עלית ${totalDelta} ק"ג עד כה`
                  : `ירידה של ${Math.abs(totalDelta)} ק"ג`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                style={{ width: `${Math.max(5, Math.min(100, progressPct))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-outline pt-0.5">
              <span>נותרו ליעד: <strong>{Math.abs(remainingDelta)} ק"ג</strong></span>
              <span>יעד: <strong>{userProfile.goal === 'lose_weight' ? 'חיטוב וירידה' : 'עלייה במסת שריר'}</strong></span>
            </div>
          </div>

          {/* Interactive Weight History SVG Graph */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-tertiary" />
                <span>גרף מגמת משקל לאורך זמן</span>
              </span>
              <span className="text-[10px] text-outline">
                {graphLogs.length} שקילות מתועדות
              </span>
            </div>

            <div className="w-full overflow-x-auto hide-scrollbar pt-2">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-[150px] overflow-visible"
              >
                {/* Horizontal Grid lines */}
                <line
                  x1="0"
                  y1={targetY}
                  x2={chartW}
                  y2={targetY}
                  stroke="var(--color-tertiary)"
                  strokeDasharray="4 3"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
                <text
                  x={chartW - 5}
                  y={targetY - 4}
                  textAnchor="end"
                  fill="var(--color-tertiary)"
                  fontSize="9"
                  fontWeight="bold"
                >
                  יעד: {targetWeight}kg
                </text>

                {/* Main Trend Polyline */}
                {points.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={polylineStr}
                  />
                )}

                {/* Data Points */}
                {points.map((p, idx) => (
                  <g key={p.id || idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4.5"
                      fill="var(--color-primary)"
                      stroke="var(--color-surface-container-lowest)"
                      strokeWidth="2"
                    />
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      fill="var(--color-on-surface)"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {p.weight}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* Quick Weigh-in Form */}
          <form
            onSubmit={handleAddWeightSubmit}
            className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-3"
          >
            <span className="font-bold text-xs text-on-surface flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" />
              <span>רישום שקילה חדשה</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">משקל (ק"ג) *</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="350"
                  required
                  placeholder="למשל: 74.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface font-bold text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">תאריך</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-outline block mb-1">הערה (אופציונלי)</label>
                <input
                  type="text"
                  placeholder="למשל: שקילת בוקר בצום"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>שמור שקילה ביומן</span>
            </button>
          </form>

          {/* Weekly Weight Reminder Settings Card */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-on-surface block">תזכורת שקילה שבועית</span>
                  <span className="text-[10px] text-outline">קבלת התראת Push שבועית לעדכון המשקל</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleReminderToggle(!reminderEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                  reminderEnabled ? 'bg-primary justify-end' : 'bg-surface-container-high justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-surface shadow-xs block" />
              </button>
            </div>

            {reminderEnabled && (
              <div className="pt-2 border-t border-surface-container-high space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">יום בשבוע</label>
                    <select
                      value={reminderDay}
                      onChange={(e) => handleReminderChange(Number(e.target.value), reminderTime)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface font-semibold"
                    >
                      {daysOfWeek.map((dName, idx) => (
                        <option key={idx} value={idx}>
                          יום {dName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-outline block mb-1">שעת התזכורת</label>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => handleReminderChange(reminderDay, e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-surface-container border border-surface-container-high text-xs text-on-surface font-bold text-center"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleTestReminder}
                    className="px-3 py-1 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-[11px] font-bold transition-all"
                  >
                    {testSent ? '✓ התראה נשלחה למכשיר' : 'שלח תזכורת בדיקה עכשיו'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Weigh-in History Log List */}
          <div className="space-y-2">
            <span className="font-bold text-xs text-outline block">היסטוריית שקילות:</span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
              {tableLogs.length === 0 ? (
                <p className="text-center text-outline text-xs py-4">טרם נרשמו שקילות</p>
              ) : (
                tableLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-surface-container-lowest border border-surface-container-high/70 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs text-primary">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-on-surface">{log.weight} ק"ג</span>
                          {log.note && (
                            <span className="text-[10px] text-outline px-1.5 py-0.2 bg-surface-container rounded-md">
                              {log.note}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-outline">
                          {formatHebrewDate(log.date)} {log.timestamp && `• ${log.timestamp}`}
                        </span>
                      </div>
                    </div>

                    {tableLogs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onDeleteWeightLog(log.id)}
                        className="p-1.5 text-outline hover:text-error hover:bg-surface-container rounded-lg transition-all"
                        title="מחק שקילה זו"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
