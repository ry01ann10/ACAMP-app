
import React from 'react';
import { ICONS } from '../constants';
import { Profile, TrainingPlan, Role } from '../types';

interface TrainingPlansPageProps {
  user: Profile;
  plans: TrainingPlan[];
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
}

const TrainingPlansPage: React.FC<TrainingPlansPageProps> = ({ user, plans, onToggle, onRemove }) => {
  const isCoach = user.role === Role.TECNICO;
  const today = new Date().toLocaleDateString();
  
  const visiblePlans = isCoach 
    ? plans 
    : plans.filter(p => p.athlete_id === 'all' || p.athlete_id === user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Treinos {isCoach ? 'Atribuídos' : 'Físicos'}</h1>
        <div className="bg-acamp-yellow text-acamp-blue px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Total: {visiblePlans.length}</div>
      </div>

      {visiblePlans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
           <div className="text-gray-200 mb-4 flex justify-center">{ICONS.Dumbbell}</div>
           <p className="text-gray-400 font-medium">Nenhum treino disponível para você hoje.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visiblePlans.map(plan => {
            const isDoneToday = plan.completed && plan.last_completed_at === today;
            
            return (
              <div key={plan.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${isDoneToday ? 'border-green-200 bg-green-50/20' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${isDoneToday ? 'bg-green-100 text-green-600' : 'bg-acamp-light text-acamp-blue'}`}>
                      {ICONS.Dumbbell}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{plan.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-500 uppercase">{plan.duration}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${plan.athlete_id === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {plan.athlete_id === 'all' ? 'Para Todos' : 'Individual'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isCoach && onRemove && (
                    <button onClick={() => onRemove(plan.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">✕</button>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  {plan.description}
                </p>

                {!isCoach && (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => onToggle && onToggle(plan.id)}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isDoneToday ? 'bg-green-600 text-white shadow-md' : 'bg-acamp-blue text-white shadow-md active:scale-95'}`}
                    >
                      {isDoneToday ? (
                        <> {ICONS.Check} Treino do dia concluído! </>
                      ) : (
                        'Concluir Treino de Hoje'
                      )}
                    </button>
                    {plan.athlete_id !== 'all' && !isDoneToday && (
                      <p className="text-[9px] text-gray-400 italic text-center uppercase tracking-tight font-bold">
                        Treinos individuais não geram BORTOCOINS, mas são essenciais para seu progresso.
                      </p>
                    )}
                  </div>
                )}
                
                {!isCoach && isDoneToday && (
                  <p className="mt-3 text-[10px] text-green-600 font-bold uppercase tracking-widest text-center">
                    Você poderá realizar este treino novamente amanhã
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainingPlansPage;
