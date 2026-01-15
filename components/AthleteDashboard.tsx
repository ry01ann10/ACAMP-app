
import React, { useEffect, useRef } from 'react';
import { AthleteData, GlobalGoals } from '../types';
import { ICONS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Minus, Zap } from 'lucide-react';

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
  const scorePercent = Math.min((progress.today_best_score / goals.daily_score_target) * 100, 100);
  const shotsPercent = Math.min((progress.today_shots / goals.daily_shots_target) * 100, 100);
  const isShotsGoalMet = shotsPercent >= 100;
  const isScoreGoalMet = scorePercent >= 100;

  const prevShotsMet = useRef(isShotsGoalMet);
  const prevScoreMet = useRef(isScoreGoalMet);

  useEffect(() => {
    const newlyReached = (isShotsGoalMet && !prevShotsMet.current) || (isScoreGoalMet && !prevScoreMet.current);
    
    if (newlyReached) {
      const root = document.getElementById('root');
      if (root) {
        root.classList.remove('goal-reached-anim');
        void root.offsetWidth;
        root.classList.add('goal-reached-anim');
      }
    }

    prevShotsMet.current = isShotsGoalMet;
    prevScoreMet.current = isScoreGoalMet;
  }, [isShotsGoalMet, isScoreGoalMet]);

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

  const chartData = [...weeklyHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(h => ({
      name: new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
      score: h.score,
      fullDate: h.date
    }));

  const weeklyAvg = weeklyHistory.length > 0 
    ? Math.round(weeklyHistory.reduce((acc, h) => acc + h.score, 0) / weeklyHistory.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 text-sm">Pronto para o treino de hoje?</p>
        </div>
        <div className="bg-acamp-light px-4 py-2 rounded-2xl border border-acamp-blue/10 text-right">
          <span className="text-[10px] font-black text-acamp-blue uppercase block mb-0.5 tracking-widest opacity-60">Categoria</span>
          <span className="font-black text-acamp-blue text-sm uppercase">{user.category}</span>
        </div>
      </div>

      {/* Card de Meta de Pontuação */}
      <div className={`bg-gradient-to-br from-acamp-blue to-acamp-dark rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${isScoreGoalMet ? 'ring-4 ring-acamp-yellow ring-opacity-50' : ''}`}>
        <div className="absolute top-0 right-0 p-6 opacity-10">
          {ICONS.Target}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-acamp-yellow font-black text-[10px] uppercase tracking-[0.2em]">Meta de Pontuação</h3>
          {isScoreGoalMet && (
            <div className="bg-acamp-yellow text-acamp-blue text-[9px] font-black px-3 py-1 rounded-full uppercase animate-bounce shadow-lg">
              Meta Batida!
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mb-4">
          <span className="text-5xl font-black tracking-tighter">{progress.today_best_score} <span className="text-lg opacity-40 font-bold">/ {goals.daily_score_target}</span></span>
          <span className="text-acamp-yellow text-xs font-black bg-white/10 px-2 py-1 rounded-lg">{scorePercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 mb-6 border border-white/5">
          <div className="bg-acamp-yellow h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,215,0,0.5)]" style={{ width: `${scorePercent}%` }}></div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100 uppercase tracking-widest">
          {isScoreGoalMet ? (
            <div className="flex items-center gap-2"><div className="bg-green-400 w-2 h-2 rounded-full animate-pulse"></div> Excelente desempenho!</div>
          ) : (
            `Faltam ${goals.daily_score_target - progress.today_best_score} pts para o objetivo`
          )}
        </div>
      </div>

      {/* Card de Volume de Tiros (Atualizado) */}
      <div className={`bg-white rounded-[2.5rem] p-8 shadow-sm border-2 transition-all duration-500 ${isShotsGoalMet ? 'border-acamp-yellow bg-yellow-50/20 shadow-lg' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isShotsGoalMet ? 'bg-acamp-yellow text-acamp-blue' : 'bg-acamp-light text-acamp-blue'}`}>
              <Zap size={24} fill={isShotsGoalMet ? "currentColor" : "none"} />
            </div>
            <div>
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-wider">Volume do Dia</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Flechas disparadas</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-3xl font-black tracking-tighter ${isShotsGoalMet ? 'text-acamp-blue' : 'text-gray-900'}`}>
              {progress.today_shots}
            </span>
            <span className="text-xs text-gray-400 font-bold"> / {goals.daily_shots_target}</span>
          </div>
        </div>

        <div className="w-full bg-gray-100 h-4 rounded-full mb-8 overflow-hidden p-1 border border-gray-50">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isShotsGoalMet ? 'bg-acamp-yellow shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-acamp-blue'}`} 
            style={{ width: `${shotsPercent}%` }}
          ></div>
        </div>

        {onAdjustShots && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {/* Controles de Subtração */}
              <div className="flex-1 flex gap-2">
                <button 
                  onClick={() => onAdjustShots(-6)}
                  className="flex-1 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 font-black text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 flex flex-col items-center justify-center"
                >
                  -6
                </button>
                <button 
                  onClick={() => onAdjustShots(-1)}
                  className="flex-1 h-14 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 font-black text-[10px] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 flex flex-col items-center justify-center"
                >
                  <Minus size={16} />
                </button>
              </div>

              {/* Controles de Adição */}
              <div className="flex-[1.5] flex gap-2">
                <button 
                  onClick={() => onAdjustShots(1)}
                  className="flex-1 h-14 rounded-2xl bg-acamp-light border border-acamp-blue/10 text-acamp-blue font-black text-[10px] hover:bg-acamp-blue hover:text-white transition-all active:scale-95 flex flex-col items-center justify-center"
                >
                  <Plus size={16} />
                </button>
                <button 
                  onClick={() => onAdjustShots(6)}
                  className="flex-1 h-14 rounded-2xl bg-acamp-blue text-white font-black text-[10px] shadow-lg shadow-acamp-blue/20 hover:bg-acamp-dark transition-all active:scale-95 flex flex-col items-center justify-center border-b-4 border-acamp-dark"
                >
                  +6
                  <span className="text-[8px] opacity-60 uppercase tracking-tighter">Série</span>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <p className={`text-[10px] font-black uppercase tracking-widest text-center ${isShotsGoalMet ? 'text-green-600' : 'text-gray-400'}`}>
                {isShotsGoalMet ? '🔥 Excelente! Você atingiu o volume planejado.' : `Ainda faltam ${goals.daily_shots_target - progress.today_shots} flechas`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="bg-green-50 text-green-600 p-2.5 rounded-2xl w-fit">
            <ICONS.Trend.type size={20} />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Média Semanal</span>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{weeklyAvg} <span className="text-xs opacity-30">pts</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl w-fit">
            <ICONS.Calendar.type size={20} />
          </div>
          <div>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] block mb-1">Frequência</span>
            <p className="text-2xl font-black text-gray-900 tracking-tighter">{progress.week_attendance} <span className="text-xs opacity-30">/ {goals.weekly_attendance_target}</span></p>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-wider">Evolução da Semana</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Histórico de pontuação</p>
          </div>
          <span className="bg-acamp-light text-acamp-blue text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border border-acamp-blue/5">7 dias</span>
        </div>
        <div className="h-48 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#004A99" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#004A99', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-50 rounded-[2rem]">
              <div className="opacity-20 mb-2">{ICONS.Target}</div>
              <span className="text-[10px] font-black uppercase tracking-widest">Sem treinos registrados</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;
