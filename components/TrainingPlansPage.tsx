
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Profile, TrainingPlan, Role, AthleteData } from '../types';
import { Plus, Dumbbell, Trash2, Clock, Zap, CheckCircle2, Circle, Check, X } from 'lucide-react';

interface TrainingPlansPageProps {
  user: Profile;
  athletes?: AthleteData[];
  plans: TrainingPlan[];
  onToggle?: (id: string) => void;
  onRemove?: (id: string) => void;
  onAdd?: (plan: Omit<TrainingPlan, 'id' | 'completed' | 'created_at'>) => void;
}

const TrainingPlansPage: React.FC<TrainingPlansPageProps> = ({ user, athletes = [], plans, onToggle, onRemove, onAdd }) => {
  const isCoach = user.role === Role.TECNICO;
  const todayStr = new Date().toISOString().split('T')[0];
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    intensity: 'Média' as const,
    duration: '30 min'
  });
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(['all']);

  const toggleRecipient = (id: string) => {
    if (id === 'all') {
      setSelectedRecipientIds(['all']);
    } else {
      const withoutAll = selectedRecipientIds.filter(i => i !== 'all');
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter(i => i !== id);
        setSelectedRecipientIds(next.length === 0 ? ['all'] : next);
      } else {
        setSelectedRecipientIds([...withoutAll, id]);
      }
    }
  };

  const handleCreateTraining = () => {
    if (!newTraining.title || !newTraining.description) {
      alert("Título e descrição são obrigatórios.");
      return;
    }

    if (onAdd) {
      selectedRecipientIds.forEach(recipientId => {
        onAdd({
          ...newTraining,
          athlete_id: recipientId
        });
      });
    }

    setShowAddModal(false);
    setNewTraining({ title: '', description: '', intensity: 'Média', duration: '30 min' });
    setSelectedRecipientIds(['all']);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Treino Físico</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {isCoach ? 'Central de prescrições técnicas' : 'Rotina diária de fortalecimento'}
          </p>
        </div>
        {isCoach && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-acamp-yellow text-acamp-blue p-3 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Novo Treino</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
             <div className="text-gray-200 mb-4 flex justify-center opacity-30"><Dumbbell size={48} /></div>
             <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Sem treinos prescritos</p>
          </div>
        ) : (
          plans.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(plan => {
            const isCompletedToday = plan.completed && plan.last_completed_at?.startsWith(todayStr);

            return (
              <div key={plan.id} className="bg-white rounded-[2.2rem] p-7 shadow-sm border border-gray-100 relative group overflow-hidden transition-all hover:shadow-md">
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${plan.intensity === 'Alta' ? 'bg-red-500' : plan.intensity === 'Média' ? 'bg-acamp-yellow' : 'bg-green-500'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`p-3.5 rounded-2xl transition-colors ${isCompletedToday ? 'bg-green-100 text-green-600' : 'bg-acamp-light text-acamp-blue'}`}>
                      <Zap size={22} fill={isCompletedToday ? "currentColor" : "none"} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tighter leading-none mb-1">{plan.title}</h3>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase">
                          <Clock size={12} /> {plan.duration}
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${plan.athlete_id === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {plan.athlete_id === 'all' ? 'EQUIPE' : 'INDIVIDUAL'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {isCoach && onRemove && (
                    <button onClick={() => onRemove(plan.id)} className="text-gray-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 mb-4">
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">
                    {plan.description}
                  </p>
                </div>

                {!isCoach && (
                  <button 
                    onClick={() => onToggle?.(plan.id)}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all ${isCompletedToday ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-acamp-blue text-white shadow-lg shadow-acamp-blue/10 active:scale-95'}`}
                  >
                    {isCompletedToday ? (
                      <><CheckCircle2 size={16} /> Treino Concluído Hoje</>
                    ) : (
                      <><Circle size={16} /> Marcar como Feito</>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PARA ADICIONAR TREINO (TÉCNICO) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">Nova Prescrição</h3>
              <button onClick={() => setShowAddModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-4 overflow-y-auto no-scrollbar">
              <input 
                placeholder="Título do Treino" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" 
                value={newTraining.title} 
                onChange={e => setNewTraining({...newTraining, title: e.target.value})} 
              />
              <textarea 
                placeholder="Instruções..." 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 font-medium text-sm outline-none" 
                value={newTraining.description} 
                onChange={e => setNewTraining({...newTraining, description: e.target.value})} 
              />
              
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Público</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  <button onClick={() => toggleRecipient('all')} className={`flex items-center justify-between p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${selectedRecipientIds.includes('all') ? 'bg-acamp-blue text-white border-acamp-blue' : 'bg-white border-gray-100 text-gray-400'}`}>
                    Equipe Inteira {selectedRecipientIds.includes('all') && <Check size={14} />}
                  </button>
                  {athletes.map(a => (
                    <button key={a.id} onClick={() => toggleRecipient(a.id)} className={`flex items-center justify-between p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${selectedRecipientIds.includes(a.id) ? 'bg-acamp-blue text-white border-acamp-blue' : 'bg-white border-gray-100 text-gray-400'}`}>
                      {a.name} {selectedRecipientIds.includes(a.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Duração" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={newTraining.duration} onChange={e => setNewTraining({...newTraining, duration: e.target.value})} />
                <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={newTraining.intensity} onChange={e => setNewTraining({...newTraining, intensity: e.target.value as any})}>
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
              </div>
              <button 
                onClick={handleCreateTraining} 
                className="w-full bg-acamp-yellow text-acamp-blue py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl mt-2 active:scale-95 transition-all"
              >
                Publicar Treinamento
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!isCoach && plans.some(p => p.completed && p.last_completed_at?.startsWith(todayStr)) && (
        <div className="text-center p-4">
           <p className="text-[10px] font-black text-green-600 uppercase tracking-widest animate-bounce">🔥 Você está em dia com seu físico!</p>
        </div>
      )}
    </div>
  );
};

export default TrainingPlansPage;
