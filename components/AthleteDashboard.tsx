
import React, { useEffect, useRef, useState } from 'react';
import { AthleteData, GlobalGoals } from '../types';
import { ICONS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Minus, Zap, Target as TargetIcon, Award, TrendingUp, Clock, ChevronRight, Loader2, Star } from 'lucide-react';

interface AthleteDashboardProps {
  user: AthleteData;
  goals: GlobalGoals;
  progress: {
    today_shots: number;
    today_best_score: number;
    week_attendance: number;
  };
  onAdjustShots?: (amount: number) => void;
}

const AthleteDashboard: React.FC<AthleteDashboardProps> = ({ user, goals, progress, onAdjustShots }) => {
  const [isPending, setIsPending] = useState(false);
  
  const scorePercent = Math.min((progress.today_best_score / goals.daily_score_target) * 100, 100);
  const shotsPercent = Math.min((progress.today_shots / goals.daily_shots_target) * 100, 100);
  
  const isShotsGoalMet = shotsPercent >= 100;
  const isScoreGoalMet = scorePercent >= 100;

  const prevShotsMet = useRef(isShotsGoalMet);
  const prevScoreMet = useRef(isScoreGoalMet);

  useEffect(() => {
    // Verifica se alguma meta foi atingida NESTE momento
    const newlyMetShots = isShotsGoalMet && !prevShotsMet.current;
    const newlyMetScore = isScoreGoalMet && !prevScoreMet.current;

    if (newlyMetShots || newlyMetScore) {
      const root = document.getElementById('root');
      if (root) {
        root.classList.remove('goal-reached-anim');
        void root.offsetWidth; // Trigger reflow
        root.classList.add('goal-reached-anim');
      }
    }
    
    prevShotsMet.current = isShotsGoalMet;
    prevScoreMet.current = isScoreGoalMet;
  }, [isShotsGoalMet, isScoreGoalMet]);

  const handleAdjust = async (amount: number) => {
    if (onAdjustShots && !isPending) {
      setIsPending(true);
      await onAdjustShots(amount);
      setTimeout(() => setIsPending(false), 300);
    }
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay() || 7;
    const date = new Date(now);
    if (day !== 1) date.setDate(now.getDate() - (day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startOfWeekDate = getStartOfWeek();
  const weeklyHistory = user.history.filter(h => new Date(h.date).getTime() >= startOfWeekDate.getTime());
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = user.history.filter(h => h.date.startsWith(todayStr));

  const chartData = [...weeklyHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(h => ({
      name: new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      score: h.score,
    }));

  const weeklyAvg = weeklyHistory.length > 0 
    ? Math.round(weeklyHistory.reduce((acc, h) => acc + h.score, 0) / weeklyHistory.length)
    : 0;

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Performance</h1>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Atleta: {user.name} • {user.category}</p>
        </div>
        <div className={`bg-acamp-blue text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-b-4 border-acamp-dark active:scale-95 transition-all ${isScoreGoalMet && isShotsGoalMet ? 'ring-4 ring-acamp-yellow ring-offset-2' : ''}`}>
          <Award size={24} className={isScoreGoalMet || isShotsGoalMet ? "text-acamp-yellow animate-bounce" : "text-blue-300"} />
        </div>
      </div>

      {/* CARD VOLUME */}
      <div className={`bg-white rounded-[3rem] p-8 shadow-sm border-2 transition-all duration-500 ${isShotsGoalMet ? 'border-green-400 bg-green-50/10 card-conquest' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-[1.5rem] transition-all duration-500 ${isShotsGoalMet ? 'bg-green-500 text-white shadow-lg rotate-12' : 'bg-acamp-light text-acamp-blue'}`}>
              {isPending ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} fill={isShotsGoalMet ? "currentColor" : "none"} />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Volume de Hoje</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">
                {progress.today_shots} <span className="text-sm text-gray-300 font-bold">/ {goals.daily_shots_target}</span>
              </h3>
            </div>
          </div>
          {isShotsGoalMet && (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Meta Batida
            </div>
          )}
        </div>

        <div className="relative h-4 w-full bg-gray-100 rounded-full mb-8 overflow-hidden border border-gray-50">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isShotsGoalMet ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-acamp-blue'}`} 
            style={{ width: `${shotsPercent}%` }}
          />
        </div>

        {onAdjustShots && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <button disabled={isPending} onClick={() => handleAdjust(-6)} className="flex-1 h-16 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl flex flex-col items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50">
                <span className="text-xs font-black">-6</span>
              </button>
              <button disabled={isPending} onClick={() => handleAdjust(-1)} className="w-16 h-16 bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl flex items-center justify-center hover:bg-red-50 active:scale-95 disabled:opacity-50">
                <Minus size={20} />
              </button>
            </div>
            <div className="flex gap-2">
              <button disabled={isPending} onClick={() => handleAdjust(1)} className="w-16 h-16 bg-acamp-light text-acamp-blue border border-acamp-blue/10 rounded-2xl flex items-center justify-center hover:bg-acamp-blue hover:text-white transition-all active:scale-95 disabled:opacity-50">
                <Plus size={20} />
              </button>
              <button disabled={isPending} onClick={() => handleAdjust(6)} className="flex-1 h-16 bg-acamp-blue text-white rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95 border-b-4 border-acamp-dark disabled:opacity-50">
                <span className="font-black text-xs">+6</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GRID DE MÉTRICAS */}
      <div className="grid grid-cols-2 gap-4">
        {/* SCORE DO DIA */}
        <div className={`p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border-2 transition-all duration-500 ${isScoreGoalMet ? 'bg-gradient-to-br from-green-500 to-green-700 text-white border-green-400 card-conquest' : 'bg-gradient-to-br from-acamp-blue to-acamp-dark text-white border-transparent'}`}>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <TargetIcon size={80} />
          </div>
          <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${isScoreGoalMet ? 'text-white' : 'text-acamp-yellow'}`}>
            {isScoreGoalMet ? '🎯 Score Batido!' : 'Melhor Score'}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black tracking-tighter">{progress.today_best_score}</span>
            <span className={`text-[10px] font-bold ${isScoreGoalMet ? 'text-green-200' : 'text-blue-300'}`}>/ {goals.daily_score_target}</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${isScoreGoalMet ? 'bg-white' : 'bg-acamp-yellow'}`} style={{ width: `${scorePercent}%` }} />
          </div>
        </div>

        {/* FREQUÊNCIA */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Frequência</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900 tracking-tighter">{progress.week_attendance}</span>
            <span className="text-[10px] text-gray-400 font-bold">/ {goals.weekly_attendance_target} dias</span>
          </div>
          <p className="text-[8px] font-black text-acamp-blue uppercase mt-3">Meta Semanal</p>
        </div>
      </div>

      {/* TIMELINE DE HOJE */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 mb-6">
          <Clock size={16} className="text-acamp-blue" /> Sessões de Hoje
        </h3>
        <div className="space-y-3">
          {todaySessions.length > 0 ? todaySessions.map((session, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-acamp-blue">
                  <TargetIcon size={14} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-800">{session.score} Pontos</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{session.distance}m • {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <TrendingUp size={14} className="text-acamp-blue opacity-30" />
            </div>
          )) : (
            <div className="py-6 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nenhuma sessão técnica hoje</p>
            </div>
          )}
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-wider">Evolução Técnica</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase">Média: {weeklyAvg} pts</p>
          </div>
          <TrendingUp className="text-acamp-blue" size={20} />
        </div>
        <div className="h-44 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#cbd5e1', fontWeight: 800}} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '10px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="score" stroke="#004A99" strokeWidth={4} dot={{ r: 4, fill: '#004A99', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#FFD700' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-300 border-2 border-dashed border-gray-50 rounded-[2rem]">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Aguardando dados</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;
