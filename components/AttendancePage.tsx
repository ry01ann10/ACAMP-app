
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { AthleteData } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendancePageProps {
  user: AthleteData;
  onCheckIn: (id: string) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ user, onCheckIn }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const isSunday = today.getDay() === 0;
  
  const hasCheckedInToday = user.attendance_history.some(d => d === todayStr);

  const handleCheckIn = async () => {
    if (isSunday || hasCheckedInToday || loading) return;

    setLoading(true);
    try {
      await onCheckIn(user.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Erro ao registrar presença. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const resetToToday = () => setViewDate(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();
  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const daysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const attendancesInViewMonth = user.attendance_history.filter(d => {
    const date = new Date(d);
    return date.getMonth() === viewMonth && date.getFullYear() === viewYear;
  });

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);
  const isViewingCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isViewingCurrentMonth && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-acamp-light p-2 rounded-xl text-acamp-blue">
              {ICONS.Calendar}
            </div>
            <h2 className="text-xl font-bold text-gray-800">Assinar Presença</h2>
          </div>

          {showSuccess ? (
            <div className="text-center py-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                {ICONS.Check}
              </div>
              <h3 className="font-bold text-xl text-gray-900">Presença Confirmada!</h3>
              <p className="text-gray-500 text-sm mt-1">Sua disciplina foi recompensada com <span className="text-acamp-blue font-bold">+5 BORTOCOINS</span></p>
            </div>
          ) : hasCheckedInToday ? (
            <div className="text-center py-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="w-16 h-16 bg-white text-acamp-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                {ICONS.Check}
              </div>
              <h3 className="font-bold text-lg text-gray-900 leading-tight px-4">Treino do dia registrado!</h3>
              <p className="text-gray-400 text-xs mt-2 font-medium uppercase tracking-widest">Disciplina é a alma do arqueiro</p>
            </div>
          ) : isSunday ? (
            <div className="text-center py-6 bg-orange-50 rounded-2xl border border-orange-100">
               <div className="text-orange-500 mb-2 flex justify-center opacity-50">{ICONS.Calendar}</div>
               <h3 className="font-bold text-orange-700">Clube Fechado hoje</h3>
               <p className="text-orange-600/70 text-xs px-8 mt-1">O registro de presença está disponível apenas de Segunda a Sábado. Bom descanso!</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-6 text-sm leading-relaxed px-4">
                Ao clicar no botão abaixo você confirma sua participação no treino presencial da ACAMP no dia de hoje.
              </p>
              <button 
                onClick={handleCheckIn}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'bg-acamp-blue text-white hover:bg-acamp-dark'}`}
              >
                {loading ? 'Sincronizando...' : 'Registrar Presença'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[120px]">
              <h3 className="font-bold text-gray-800 text-lg capitalize">{monthName}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{viewYear}</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
          {!isViewingCurrentMonth && (
            <button onClick={resetToToday} className="text-[9px] font-black text-acamp-blue uppercase bg-acamp-light px-3 py-1.5 rounded-lg border border-acamp-blue/10 active:scale-95 transition-all">
              Hoje
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {daysLabels.map((d, i) => (
            <span key={i} className={`text-[10px] font-black tracking-tighter ${i === 0 ? 'text-red-300' : 'text-gray-300'}`}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {paddingDays.map(d => <div key={`p-${d}`} className="h-10"></div>)}
          {calendarDays.map(d => {
            const dateObj = new Date(viewYear, viewMonth, d);
            const dateStr = dateObj.toISOString().split('T')[0];
            const isDaySunday = dateObj.getDay() === 0;
            const isDayToday = d === today.getDate() && isViewingCurrentMonth;
            const hasAttendance = user.attendance_history.includes(dateStr);
            
            return (
              <div 
                key={d} 
                className={`h-11 flex items-center justify-center rounded-2xl text-xs font-black relative transition-all
                  ${isDayToday ? 'ring-2 ring-acamp-blue ring-inset' : ''} 
                  ${hasAttendance ? 'bg-acamp-blue text-white shadow-md scale-105 z-10' : isDaySunday ? 'bg-gray-50 text-gray-200 opacity-50' : 'bg-gray-50/50 text-gray-300'}
                `}
              >
                {d}
                {hasAttendance && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-acamp-yellow text-acamp-blue rounded-full border-2 border-white flex items-center justify-center text-[8px] shadow-sm">
                    {ICONS.Check}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
