
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { AthleteData, Role } from '../types';
import { ChevronLeft, ChevronRight, Search, User, Calendar as CalendarIcon, Filter, Info, Target, TrendingUp } from 'lucide-react';

interface AttendancePageProps {
  user: AthleteData;
  athletes?: AthleteData[];
  onCheckIn: (id: string) => void;
}

// Fixed utility function moved outside component to avoid redeclaration errors
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const AttendancePage: React.FC<AttendancePageProps> = ({ user, athletes = [], onCheckIn }) => {
  const isCoach = user.role === Role.TECNICO;
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteData | null>(null);

  // Estado local para o mês visualizado na aba detalhada do atleta (Técnico)
  const [athleteHistoryMonth, setAthleteHistoryMonth] = useState(new Date());

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

  const changeMonth = (offset: number, type: 'main' | 'athlete' = 'main') => {
    if (type === 'main') {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
      setViewDate(newDate);
    } else {
      const newDate = new Date(athleteHistoryMonth.getFullYear(), athleteHistoryMonth.getMonth() + offset, 1);
      setAthleteHistoryMonth(newDate);
    }
  };

  const resetToToday = () => setViewDate(new Date());

  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewDate);

  // Visão do Técnico
  if (isCoach) {
    const filteredAthletes = athletes.filter(a => 
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Gestão de Equipe</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Monitoramento de frequência e performance</p>
        </div>

        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar arqueiro..." 
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-sm outline-none shadow-sm focus:ring-2 focus:ring-acamp-blue"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-4">
          {filteredAthletes.map(athlete => {
            const presentToday = athlete.attendance_history.includes(todayStr);
            const isExpanded = selectedAthlete?.id === athlete.id;

            return (
              <div 
                key={athlete.id} 
                className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-acamp-blue shadow-lg ring-1 ring-acamp-blue/10' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}
              >
                <button 
                  onClick={() => {
                    setSelectedAthlete(isExpanded ? null : athlete);
                    setAthleteHistoryMonth(new Date()); 
                  }}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={athlete.avatar_url || `https://ui-avatars.com/api/?name=${athlete.name}&background=E6F0FF&color=004A99`} 
                        className="w-12 h-12 rounded-2xl border border-gray-50 object-cover" 
                        alt={athlete.name} 
                      />
                      {presentToday && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{athlete.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${presentToday ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {presentToday ? 'Presente Hoje' : 'Ausente Hoje'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{athlete.monthly_attendance} treinos no mês</span>
                      </div>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300 space-y-6">
                    {/* Atividade Recente Individual */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <TrendingUp size={12} className="text-acamp-blue" /> Sessões Recentes
                      </h4>
                      <div className="space-y-3">
                        {athlete.history.length > 0 ? (
                          athlete.history.slice(0, 3).map((session, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div>
                                <p className="text-xs font-black text-gray-800">{session.score} Pontos</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase">{session.distance}m • {new Date(session.date).toLocaleDateString('pt-BR')}</p>
                              </div>
                              <div className="bg-acamp-blue/10 p-2 rounded-lg text-acamp-blue">
                                <Target size={14} />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-center text-gray-300 font-bold uppercase py-2">Sem sessões registradas</p>
                        )}
                      </div>
                    </div>

                    {/* Calendário de Presença */}
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <CalendarIcon size={12} /> Histórico de Presença
                        </h4>
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeMonth(-1, 'athlete')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronLeft size={14}/></button>
                          <span className="text-[9px] font-black uppercase text-acamp-blue">
                            {new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(athleteHistoryMonth)}
                          </span>
                          <button onClick={() => changeMonth(1, 'athlete')} className="p-1 hover:bg-white rounded-lg transition-colors"><ChevronRight size={14}/></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: getDaysInMonth(athleteHistoryMonth.getFullYear(), athleteHistoryMonth.getMonth()) }, (_, i) => {
                          const d = i + 1;
                          const date = new Date(athleteHistoryMonth.getFullYear(), athleteHistoryMonth.getMonth(), d);
                          const dStr = date.toISOString().split('T')[0];
                          const hasAtt = athlete.attendance_history.includes(dStr);
                          const isSun = date.getDay() === 0;

                          return (
                            <div 
                              key={d} 
                              className={`h-8 rounded-lg flex items-center justify-center text-[8px] font-black border transition-colors
                                ${hasAtt ? 'bg-green-500 border-green-600 text-white shadow-sm' : isSun ? 'bg-gray-100 text-gray-200 border-transparent' : 'bg-white text-gray-300 border-gray-100'}
                              `}
                            >
                              {d}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredAthletes.length === 0 && (
             <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
                <div className="text-gray-200 mb-4 flex justify-center opacity-30"><User size={48} /></div>
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Nenhum arqueiro encontrado</p>
             </div>
          )}
        </div>
      </div>
    );
  }

  // Visão do Atleta
  const isViewingCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();
  const totalDays = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {isViewingCurrentMonth && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-acamp-light p-3 rounded-2xl text-acamp-blue">
              {ICONS.Calendar}
            </div>
            <div>
               <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Assinar Presença</h2>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Confirme seu treino no clube</p>
            </div>
          </div>

          {showSuccess ? (
            <div className="text-center py-6 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                {ICONS.Check}
              </div>
              <h3 className="font-black text-lg text-gray-900 uppercase">Presença Confirmada!</h3>
              <p className="text-gray-400 text-[10px] mt-1 font-black uppercase tracking-widest">Sua disciplina foi registrada.</p>
            </div>
          ) : hasCheckedInToday ? (
            <div className="text-center py-8 bg-blue-50/50 rounded-3xl border border-blue-100/50">
              <div className="w-16 h-16 bg-white text-acamp-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                {ICONS.Check}
              </div>
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-tighter">Treino registrado com sucesso!</h3>
              <p className="text-gray-400 text-[9px] mt-2 font-black uppercase tracking-[0.2em]">Disciplina é o caminho do ouro</p>
            </div>
          ) : isSunday ? (
            <div className="text-center py-8 bg-orange-50 rounded-3xl border border-orange-100">
               <div className="text-orange-500 mb-2 flex justify-center opacity-50">{ICONS.Calendar}</div>
               <h3 className="font-black text-sm text-orange-700 uppercase">Clube Fechado hoje</h3>
               <p className="text-orange-600/70 text-[10px] px-8 mt-2 font-bold leading-relaxed">O registro está disponível de Segunda a Sábado.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 mb-8 text-xs font-medium leading-relaxed px-4">
                Ao registrar, você confirma que está fisicamente presente no treino da ACAMP hoje.
              </p>
              <button 
                onClick={handleCheckIn}
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${loading ? 'bg-gray-100 text-gray-400' : 'bg-acamp-blue text-white hover:bg-acamp-dark border-b-4 border-acamp-dark'}`}
              >
                {loading ? 'Processando...' : 'Confirmar Presença'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="text-center min-w-[120px]">
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tighter">{monthName}</h3>
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{viewYear}</p>
            </div>
            <button onClick={() => changeMonth(1)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
              <ChevronRight size={18} />
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
            <span key={i} className={`text-[10px] font-black tracking-widest ${i === 0 ? 'text-red-300' : 'text-gray-300'}`}>{d}</span>
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
