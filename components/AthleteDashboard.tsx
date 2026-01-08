
import React, { useEffect, useRef } from 'react';
import { AthleteData, GlobalGoals } from '../types';
import { ICONS } from '../constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Helper para obter o início da semana (segunda-feira)
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay() || 7; // Domingo vira 7
    if (day !== 1) now.setHours(-24 * (day - 1));
    now.setHours(0, 0, 0, 0);
    return now;
  };

  const startOfWeek = getStartOfWeek();

  // Filtrar histórico apenas para a SEMANA ATUAL para média e gráfico
  const weeklyHistory = user.history.filter(h => new Date(h.date).getTime() >= startOfWeek.getTime());

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
          <h1 className="text-2xl font-bold text-gray-900">Olá, {user.name.split(' ')[0]}!</h1>
          <p className="text-gray-500">Pronto para o treino de hoje?</p>
        </div>
        <div className="bg-acamp-light p-3 rounded-2xl border border-acamp-blue/10 text-right">
          <span className="text-xs font-bold text-acamp-blue uppercase block mb-1">Categoria</span>
          <span className="font-semibold text-acamp-blue">{user.category}</span>
        </div>
      </div>

      <div className={`bg-gradient-to-br from-acamp-blue to-acamp-dark rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500 ${isScoreGoalMet ? 'ring-4 ring-acamp-yellow ring-opacity-50' : ''}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          {ICONS.Target}
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-acamp-yellow font-bold text-sm uppercase tracking-widest">Meta de Pontuação</h3>
          {isScoreGoalMet && (
            <div className="bg-acamp-yellow text-acamp-blue text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-bounce">
              Meta Batida!
            </div>
          )}
        </div>
        <div className="flex items-end justify-between mb-2">
          <span className="text-3xl font-extrabold">{progress.today_best_score} / {goals.daily_score_target}</span>
          <span className="text-acamp-yellow text-sm font-medium">{scorePercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2.5 mb-6">
          <div className="bg-acamp-yellow h-2.5 rounded-full transition-all duration-700" style={{ width: `${scorePercent}%` }}></div>
        </div>
        <div className="flex items-center gap-2 text-xs text-blue-100">
          <div className="bg-white/10 p-1.5 rounded-lg">{ICONS.Check}</div>
          {isScoreGoalMet ? 'Meta batida! Excelente desempenho!' : `Faltam ${goals.daily_score_target - progress.today_best_score} pontos para bater a meta.`}
        </div>
      </div>

      <div className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${isShotsGoalMet ? 'border-acamp-yellow bg-yellow-50/20' : 'border-gray-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isShotsGoalMet ? 'bg-acamp-yellow text-acamp-blue' : 'bg-acamp-light text-acamp-blue'}`}>
              {ICONS.Target}
            </div>
            <h3 className="font-bold text-gray-800">Tiros do Dia</h3>
          </div>
          <div className="flex items-center gap-3">
            {onAdjustShots && (
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                <button 
                  onClick={() => onAdjustShots(-1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-gray-400 hover:text-red-500 shadow-sm transition-colors active:scale-90"
                >
                  -
                </button>
                <button 
                  onClick={() => onAdjustShots(1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-gray-400 hover:text-acamp-blue shadow-sm transition-colors active:scale-90"
                >
                  +
                </button>
              </div>
            )}
            <span className={`font-bold text-sm ${isShotsGoalMet ? 'text-acamp-blue' : 'text-acamp-blue'}`}>
              {progress.today_shots} / {goals.daily_shots_target}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-100 h-4 rounded-full mb-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${isShotsGoalMet ? 'bg-acamp-yellow' : 'bg-acamp-blue'}`} 
            style={{ width: `${shotsPercent}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between">
          <p className={`text-[10px] font-bold uppercase tracking-widest ${isShotsGoalMet ? 'text-acamp-blue' : 'text-gray-400'}`}>
            {isShotsGoalMet ? 'Volume diário concluído! Resgate seus prêmios.' : `Faltam ${goals.daily_shots_target - progress.today_shots} flechas hoje`}
          </p>
          {isShotsGoalMet && <div className="text-acamp-yellow animate-pulse">{ICONS.Trophy}</div>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="bg-green-50 text-green-600 p-2 rounded-xl w-fit">
            {ICONS.Trend}
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Média Semanal</span>
            <p className="text-xl font-bold">{weeklyAvg} pts</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl w-fit">
            {ICONS.Calendar}
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Presença Semanal</span>
            <p className="text-xl font-bold">{progress.week_attendance} / {goals.weekly_attendance_target}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800">Evolução da Semana</h3>
          <span className="bg-acamp-light text-acamp-blue text-[9px] font-black uppercase px-2 py-1 rounded-lg">Filtro: Semanal</span>
        </div>
        <div className="h-48 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#004A99" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#004A99', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-50 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-widest">Sem treinos registrados na semana</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AthleteDashboard;
