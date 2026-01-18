
import React from 'react';
import { AthleteData, GlobalGoals } from '../types';
import { History, Star, Zap, Target } from 'lucide-react';

interface GoalsPageProps {
  user: AthleteData;
  goals: GlobalGoals;
  progress: {
    today_shots: number;
    today_best_score: number;
    week_attendance: number;
  };
}

const GoalsPage: React.FC<GoalsPageProps> = ({ goals, progress }) => {
  const dynamicGoals = [
    {
      id: 'score_goal',
      title: 'Precisão Técnica',
      description: 'Atingir o score alvo em uma sessão do dia.',
      target: goals.daily_score_target,
      current: progress.today_best_score,
      icon: <Star size={20} />,
      unit: 'pts'
    },
    {
      id: 'shots_goal',
      title: 'Volume de Treino',
      description: 'Completar o volume total de flechas planejado.',
      target: goals.daily_shots_target,
      current: progress.today_shots,
      icon: <Zap size={20} />,
      unit: 'flechas'
    },
    {
      id: 'attendance_goal',
      title: 'Consistência Semanal',
      description: 'Frequência mínima de treinos presenciais.',
      target: goals.weekly_attendance_target,
      current: progress.week_attendance,
      icon: <History size={20} />,
      unit: 'dias'
    }
  ];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="bg-acamp-blue rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <Target size={120} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-acamp-yellow mb-2">Performance Técnica</p>
          <h1 className="text-4xl font-black tracking-tighter">Metas de Treino</h1>
          <p className="text-blue-200 text-xs mt-4 leading-relaxed max-w-xs font-medium uppercase tracking-widest">Acompanhe seu progresso e atinja os objetivos definidos pela equipe técnica.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2">
        <div className="w-1.5 h-1.5 bg-acamp-yellow rounded-full"></div>
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Objetivos Ativos</h2>
      </div>

      <div className="space-y-4">
        {dynamicGoals.map(goal => {
          const isCompleted = goal.current >= goal.target;
          const percent = Math.min((goal.current / goal.target) * 100, 100);

          return (
            <div key={goal.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all duration-500 ${isCompleted ? 'border-green-400 shadow-md scale-[1.01]' : 'border-gray-100 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                    {goal.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 uppercase text-xs tracking-wider">{goal.title}</h3>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-[180px]">{goal.description}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Progresso Atual</span>
                  <span className={isCompleted ? 'text-green-600' : 'text-acamp-blue'}>{goal.current} / {goal.target} {goal.unit}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${isCompleted ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-acamp-blue'}`} 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                {isCompleted && (
                  <p className="text-[9px] font-black text-green-600 uppercase tracking-widest text-right mt-1">✓ Meta Atingida</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsPage;
