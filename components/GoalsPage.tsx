
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { AthleteData, GlobalGoals } from '../types';
import { ShoppingBag, Star, Zap, History, ChevronRight } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'goals' | 'shop'>('goals');

  const isGoalRedeemedToday = (goalId: string) => {
    const lastRedemption = user.last_redemptions?.[goalId];
    if (!lastRedemption) return false;
    const lastDate = new Date(lastRedemption);
    const today = new Date();
    return lastDate.toDateString() === today.toDateString();
  };

  const isWeeklyGoalRedeemedThisWeek = (goalId: string) => {
    const lastRedemption = user.last_redemptions?.[goalId];
    if (!lastRedemption) return false;
    const lastDate = new Date(lastRedemption);
    const today = new Date();
    const getMonday = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay() || 7;
      date.setDate(date.getDate() - (day - 1));
      date.setHours(0,0,0,0);
      return date;
    };
    return getMonday(lastDate).getTime() === getMonday(today).getTime();
  };

  const dynamicGoals = [
    {
      id: 'score_goal',
      title: 'Precisão de Elite',
      description: 'Atingir o score alvo em uma sessão.',
      target: goals.daily_score_target,
      current: progress.today_best_score,
      reward: 50,
      icon: <Star size={20} />,
      reset: 'Diário',
      type: 'daily'
    },
    {
      id: 'shots_goal',
      title: 'Máquina de Tiros',
      description: 'Completar o volume de flechas do dia.',
      target: goals.daily_shots_target,
      current: progress.today_shots,
      reward: 20,
      icon: <Zap size={20} />,
      reset: 'Diário',
      type: 'daily'
    },
    {
      id: 'attendance_goal',
      title: 'Guerreiro Ávido',
      description: 'Comparecer aos treinos semanais.',
      target: goals.weekly_attendance_target,
      current: progress.week_attendance,
      reward: 100,
      icon: <History size={20} />,
      reset: 'Semanal',
      type: 'weekly'
    }
  ];

  const storeItems = [
    { id: 'music', title: 'DJ do Treino', desc: 'Escolha a playlist por 30 min.', price: 250, icon: '🎵' },
    { id: 'feedback', title: 'Feedback Extra', desc: 'Análise em vídeo com o técnico.', price: 500, icon: '📹' },
    { id: 'rest', title: 'Pausa VIP', desc: 'Pausa de 10 min extra com café.', price: 150, icon: '☕' },
    { id: 'badge', title: 'Moldura Dourada', desc: 'Destaque no seu perfil por 1 mês.', price: 1000, icon: '🏆' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Central de Recompensas */}
      <div className="bg-acamp-blue rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-acamp-yellow mb-2">Seu Patrimônio</p>
          <div className="flex items-end gap-3">
             <h1 className="text-5xl font-black tracking-tighter">{user.brotocoin_balance}</h1>
             <span className="text-acamp-yellow font-black uppercase text-sm mb-1.5 tracking-widest">Bortocoins</span>
          </div>
          <div className="mt-6 flex gap-2">
             <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                <span className="text-[10px] font-bold block opacity-60 uppercase">Nível Equipe</span>
                <span className="text-xs font-black">Arqueiro Iniciado</span>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <button 
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'goals' ? 'bg-acamp-blue text-white shadow-lg' : 'text-gray-400'}`}
        >
          {ICONS.Trophy} Missões
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'shop' ? 'bg-acamp-blue text-white shadow-lg' : 'text-gray-400'}`}
        >
          <ShoppingBag size={14} /> Loja ACAMP
        </button>
      </div>

      {activeTab === 'goals' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {dynamicGoals.map(goal => {
            const isCompleted = goal.current >= goal.target;
            const isRedeemed = goal.type === 'weekly' ? isWeeklyGoalRedeemedThisWeek(goal.id) : isGoalRedeemedToday(goal.id);
            const percent = Math.min((goal.current / goal.target) * 100, 100);

            return (
              <div key={goal.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all ${isCompleted && !isRedeemed ? 'border-acamp-yellow bg-yellow-50/10 shadow-lg scale-[1.02]' : 'border-gray-100'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${isCompleted ? 'bg-acamp-yellow text-acamp-blue border-acamp-yellow' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                      {goal.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-800 uppercase text-xs tracking-wider">{goal.title}</h3>
                      <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-[180px]">{goal.description}</p>
                    </div>
                  </div>
                  <div className="bg-acamp-light px-3 py-1.5 rounded-xl border border-acamp-blue/5">
                    <span className="text-[10px] font-black text-acamp-blue">+{goal.reward} BTC</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Progresso</span>
                    <span className={isCompleted ? 'text-green-600' : 'text-acamp-blue'}>{goal.current} / {goal.target}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out rounded-full ${isCompleted ? 'bg-green-500' : 'bg-acamp-blue'}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {isCompleted && !isRedeemed && (
                  <button 
                    onClick={() => onRedeem(goal.id, goal.reward)}
                    className="mt-6 w-full bg-acamp-yellow text-acamp-blue py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all border-b-4 border-yellow-600"
                  >
                    Resgatar Prêmio 🏹
                  </button>
                )}

                {isRedeemed && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 py-4 rounded-2xl border border-gray-100">
                    {ICONS.Check} Coletado ({goal.reset})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {storeItems.map(item => (
            <button 
              key={item.id}
              className="bg-white p-6 rounded-[2rem] border-2 border-gray-100 text-left hover:border-acamp-blue hover:shadow-lg transition-all active:scale-95 group"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h4 className="font-black text-gray-800 text-[11px] uppercase tracking-widest mb-1">{item.title}</h4>
              <p className="text-[9px] text-gray-400 font-medium mb-4 leading-tight">{item.desc}</p>
              <div className="flex items-center gap-1.5 bg-acamp-light px-3 py-1.5 rounded-xl w-fit">
                <span className="text-[10px] font-black text-acamp-blue">{item.price} BTC</span>
              </div>
            </button>
          ))}
          <div className="col-span-2 bg-acamp-light/50 p-6 rounded-[2.5rem] text-center border border-dashed border-acamp-blue/10">
             <p className="text-[10px] font-bold text-acamp-blue uppercase tracking-widest">Em breve: Mais itens na loja</p>
          </div>
        </div>
      )}

      {/* Regras de Ganho Rápido */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
           <Zap size={14} className="text-acamp-yellow" /> Ganhe moedas agora
        </h3>
        <div className="grid gap-4">
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-xl text-acamp-blue shadow-sm">{ICONS.Calendar}</div>
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Presença Diária</span>
              </div>
              <span className="text-xs font-black text-acamp-blue">+5 BTC</span>
           </div>
           <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-3">
                 <div className="bg-white p-2 rounded-xl text-acamp-blue shadow-sm">{ICONS.Target}</div>
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Sessão Técnica</span>
              </div>
              <span className="text-xs font-black text-acamp-blue">+15 BTC</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
