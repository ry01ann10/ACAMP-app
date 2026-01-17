
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Profile, TrainingPlan, Role, AthleteData } from '../types';
import { Plus, Dumbbell, Trash2, User, Users, Clock, Zap } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    athlete_id: 'all',
    intensity: 'Média' as const,
    duration: '30 min'
  });

  const getAthleteName = (id: string) => {
    if (id === 'all') return 'Toda a Equipe';
    const athlete = athletes.find(a => a.id === id);
    return athlete ? athlete.name : 'Atleta Desconhecido';
  };

  const handleAdd = () => {
    if (onAdd && newTraining.title && newTraining.description) {
      onAdd(newTraining);
      setShowAddModal(false);
      setNewTraining({ title: '', description: '', athlete_id: 'all', intensity: 'Média', duration: '30 min' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Treinos Físicos</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {isCoach ? 'Gestão de Prescrição Técnica' : 'Sua rotina de fortalecimento'}
          </p>
        </div>
        {isCoach && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-acamp-blue text-white p-3 rounded-2xl shadow-lg shadow-acamp-blue/20 active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100">
             <div className="text-gray-200 mb-4 flex justify-center opacity-30"><Dumbbell size={48} /></div>
             <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Nenhum treino ativo</p>
             {isCoach && <p className="text-[10px] text-gray-300 mt-1">Clique no + para prescrever o primeiro treino.</p>}
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 group hover:border-acamp-blue/20 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-acamp-light p-3 rounded-2xl text-acamp-blue">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight">{plan.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase bg-gray-50 px-2 py-0.5 rounded-lg">
                        <Clock size={10} /> {plan.duration}
                      </span>
                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${plan.athlete_id === 'all' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {plan.athlete_id === 'all' ? <Users size={10} /> : <User size={10} />}
                        {getAthleteName(plan.athlete_id)}
                      </span>
                    </div>
                  </div>
                </div>
                {isCoach && onRemove && (
                  <button 
                    onClick={() => onRemove(plan.id)}
                    className="text-gray-300 hover:text-red-500 p-2 transition-colors active:scale-90"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-500 leading-relaxed mt-4 bg-gray-50/50 p-4 rounded-xl border border-gray-50">
                {plan.description}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Treino */}
      {showAddModal && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Dumbbell size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">Prescrever Treino</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="opacity-50 hover:opacity-100 transition-opacity">✕</button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Título</label>
                <input 
                  placeholder="Ex: Fortalecimento de Ombros" 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={newTraining.title}
                  onChange={e => setNewTraining({...newTraining, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Descrição</label>
                <textarea 
                  placeholder="3x15 Elástico, etc..." 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 font-medium text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={newTraining.description}
                  onChange={e => setNewTraining({...newTraining, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Tempo</label>
                  <input 
                    placeholder="30 min" 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                    value={newTraining.duration}
                    onChange={e => setNewTraining({...newTraining, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Atribuir a</label>
                  <select 
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                    value={newTraining.athlete_id}
                    onChange={e => setNewTraining({...newTraining, athlete_id: e.target.value})}
                  >
                    <option value="all">Toda a Equipe</option>
                    {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAdd} 
                className="w-full bg-acamp-blue text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4"
              >
                Publicar Treino
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlansPage;
