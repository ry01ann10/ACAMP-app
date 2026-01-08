
import React from 'react';
import { ICONS } from '../constants';
import { AthleteData, GlobalGoals } from '../types';

interface GoalsPageProps {
  user: AthleteData;
  goals: GlobalGoals;
  progress: {
    today_shots: number;
    today_best_score: number;
    week_attendance: number;
  };
  onRedeem: (goalId: string, amount: number) => void;
}

const GoalsPage: React.FC<GoalsPageProps> = ({ user, goals, progress, onRedeem }) => {
  const isGoalRedeemedToday = (goalId: string) => {
    const lastRedemption = user.last_redemptions?.[goalId];
    if (!lastRedemption) return false;
    
    const lastDate = new Date(lastRedemption);
    const today = new Date();
    
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  };

  const isWeeklyGoalRedeemedThisWeek = (goalId: string) => {
    const lastRedemption = user.last_redemptions?.[goalId];
    if (!lastRedemption) return false;
    
    const lastDate = new Date(lastRedemption);
    const today = new Date();
    
    // Check if it's the same Monday-Sunday week
    // Get start of week (Monday) for last redemption
    const getMonday = (d: Date) => {
      const day = d.getDay() || 7;
      if(day !== 1) d.setHours(-24 * (day - 1));
      d.setHours(0,0,0,0);
      return d;
    };
    
    const lastMonday = getMonday(new Date(lastDate));
    const currentMonday = getMonday(new Date(today));
    
    return lastMonday.getTime() === currentMonday.getTime();
  };

  const dynamicGoals = [
    {
      id: 'score_goal',
      title: 'Meta de Pontuação Diária',
      description: 'Atingir a pontuação definida pelo técnico em uma sessão.',
      target: goals.daily_score_target,
      current: progress.today_best_score,
      reward: 50,
      type: 'score',
      resetType: 'Diário'
    },
    {
      id: 'shots_goal',
      title: 'Volume de Tiros Diários',
      description: 'Completar a quantidade de flechas sugerida para hoje.',
      target: goals.daily_shots_target,
      current: progress.today_shots,
      reward: 20,
      type: 'shots',
      resetType: 'Diário'
    },
    {
      id: 'attendance_goal',
      title: 'Disciplina Semanal',
      description: 'Manter a frequência mínima exigida na semana.',
      target: goals.weekly_attendance_target,
      current: progress.week_attendance,
      reward: 100,
      type: 'attendance',
      resetType: 'Segunda-feira'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Metas e Prêmios</h1>
        <div className="flex items-center gap-2 bg-acamp-yellow/20 px-3 py-1 rounded-full border border-acamp-yellow/30">
          <span className="text-xs font-bold text-acamp-blue">Saldo: {user.brotocoin_balance} BORTOCOINS</span>
          <span className="text-acamp-yellow">{ICONS.Coins}</span>
        </div>
      </div>

      <div className="space-y-4">
        {dynamicGoals.map(goal => {
          const isCompleted = goal.current >= goal.target;
          const isRedeemed = goal.type === 'attendance' 
            ? isWeeklyGoalRedeemedThisWeek(goal.id) 
            : isGoalRedeemedToday(goal.id);
          
          const progressPercent = Math.min((goal.current / goal.target) * 100, 100);
          
          return (
            <div key={goal.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${isCompleted ? 'border-green-200 bg-green-50/20' : 'border-gray-100'} ${isRedeemed ? 'opacity-70' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-acamp-light text-acamp-blue'}`}>
                    {goal.type === 'attendance' ? ICONS.Calendar : goal.type === 'score' ? ICONS.Target : ICONS.Trend}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{goal.title}</h3>
                    <p className="text-[10px] font-bold text-acamp-blue uppercase tracking-wider mb-1">Reseta: {goal.resetType}</p>
                    <p className="text-xs text-gray-500">{goal.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-acamp-yellow/10 px-2 py-1 rounded-lg">
                  <span className="text-xs font-bold text-acamp-blue">+{goal.reward}</span>
                  <span className="text-acamp-yellow scale-75">{ICONS.Coins}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-gray-400">Progresso</span>
                  <span className={isCompleted ? 'text-green-600' : 'text-acamp-blue'}>
                    {goal.current} / {goal.target}
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${isCompleted ? 'bg-green-500' : 'bg-acamp-blue'}`} 
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {isCompleted && !isRedeemed && (
                <button 
                  onClick={() => onRedeem(goal.id, goal.reward)}
                  className="mt-4 w-full bg-acamp-yellow text-acamp-blue py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all border border-yellow-400"
                >
                  Resgatar {goal.reward} BORTOCOINS
                </button>
              )}

              {isRedeemed && (
                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase bg-gray-50 py-3 rounded-2xl border border-gray-100">
                  {ICONS.Check} Já Resgatado
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico Simulado */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Como ganhar BORTOCOINS?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-acamp-yellow mt-0.5">{ICONS.Check}</div>
            <p className="text-xs text-gray-500">Marque presença no treino: <span className="font-bold text-acamp-blue">+5 BORTOCOINS</span> (Auto)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-acamp-yellow mt-0.5">{ICONS.Check}</div>
            <p className="text-xs text-gray-500">Conclua uma série de tiros: <span className="font-bold text-acamp-blue">+15 BORTOCOINS</span> (Auto)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-acamp-yellow mt-0.5">{ICONS.Check}</div>
            <p className="text-xs text-gray-500">Bata metas definidas e resgate aqui: <span className="font-bold text-acamp-blue">Variável</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
