
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Category, GlobalGoals, AthleteData, TrainingPlan } from '../types';
import { ChevronLeft, ChevronRight, X, Trophy, Target, Coins, Dumbbell, Calendar, Info, CheckCircle2, UserPlus, Send } from 'lucide-react';
// Fix: Added missing import for Logo component
import Logo from './Logo';

interface CoachDashboardProps {
  athletes: AthleteData[];
  onUpdateGoals: (goals: Partial<GlobalGoals>) => void;
  onUpdateIndividualGoals: (athleteId: string, goals: AthleteData['individual_goals']) => void;
  onAwardCoins: (athleteId: string | 'all', amount: number) => void;
  onAddTraining: (plan: Omit<TrainingPlan, 'id' | 'completed' | 'created_at'>) => void;
  currentGoals: GlobalGoals;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  athletes, 
  onUpdateGoals, 
  onUpdateIndividualGoals,
  onAwardCoins, 
  onAddTraining, 
  currentGoals 
}) => {
  const [filter, setFilter] = useState<string>('');
  const [activeModal, setActiveModal] = useState<'meta_picker' | 'award' | 'training' | 'ranking' | 'athlete_detail' | 'attendance_today' | null>(null);
  const [viewingAthlete, setViewingAthlete] = useState<AthleteData | null>(null);

  // Estados para formulários
  const [awardAmount, setAwardAmount] = useState<number>(10);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | 'all'>('all');
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    athlete_id: 'all',
    intensity: 'Média' as const,
    duration: '30 min'
  });

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const sortedByCoins = [...athletes].sort((a, b) => b.brotocoin_balance - a.brotocoin_balance);
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentAthletes = athletes.filter(a => 
    a.attendance_history.some(d => d === todayStr)
  );

  const handleAward = () => {
    onAwardCoins(selectedAthleteId, awardAmount);
    setActiveModal(null);
    const targetName = selectedAthleteId === 'all' ? 'toda a equipe' : athletes.find(a => a.id === selectedAthleteId)?.name;
    // Feedback via App.tsx awardCoins
  };

  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.description) {
      alert("Preencha título e descrição.");
      return;
    }
    onAddTraining(newTraining);
    setActiveModal(null);
    setNewTraining({ title: '', description: '', athlete_id: 'all', intensity: 'Média', duration: '30 min' });
  };

  const openAthleteDetail = (athlete: AthleteData) => {
    setViewingAthlete(athlete);
    setActiveModal('athlete_detail');
  };

  const updateAthleteGoal = (athleteId: string, field: string, value: number) => {
    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return;
    const currentGoals = athlete.individual_goals || {};
    onUpdateIndividualGoals(athleteId, { ...currentGoals, [field]: value });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Painel Técnico</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Equipe Total</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-acamp-blue leading-none">{athletes.length}</p>
              <span className="text-gray-400 text-[10px] font-bold pb-0.5">Atletas</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('attendance_today')}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 text-left hover:bg-acamp-light/30 transition-all active:scale-95 group"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">No Clube Hoje</p>
              <div className="text-acamp-blue scale-75 group-hover:translate-x-1 transition-transform">{ICONS.ChevronRight}</div>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black text-green-600 leading-none">{presentAthletes.length}</p>
              <span className="text-gray-400 text-[10px] font-bold pb-0.5">Presentes</span>
            </div>
          </button>
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase font-black mb-1 tracking-widest">Top Arqueiro</p>
            <p className="text-xl font-black text-acamp-blue truncate leading-tight">
              {sortedByCoins[0]?.name?.split(' ')[0] || '---'}
              <span className="text-[10px] text-acamp-yellow ml-2">{sortedByCoins[0]?.brotocoin_balance} BTC</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-acamp-blue text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Logo size="lg" showText={false} />
        </div>
        <h2 className="text-xl font-black mb-6 uppercase tracking-widest">Ações Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => setActiveModal('meta_picker')} className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex flex-col items-center gap-3 border border-white/10 transition-all active:scale-95 group">
            <div className="bg-acamp-yellow text-acamp-blue p-3 rounded-xl group-hover:rotate-12 transition-transform"><Target size={24} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Metas</span>
          </button>
          <button onClick={() => setActiveModal('award')} className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex flex-col items-center gap-3 border border-white/10 transition-all active:scale-95 group">
            <div className="bg-acamp-yellow text-acamp-blue p-3 rounded-xl group-hover:scale-110 transition-transform"><Coins size={24} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Premiar</span>
          </button>
          <button onClick={() => setActiveModal('training')} className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex flex-col items-center gap-3 border border-white/10 transition-all active:scale-95 group">
            <div className="bg-acamp-yellow text-acamp-blue p-3 rounded-xl group-hover:-rotate-12 transition-transform"><Dumbbell size={24} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Treinos</span>
          </button>
          <button onClick={() => setActiveModal('ranking')} className="bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex flex-col items-center gap-3 border border-white/10 transition-all active:scale-95 group">
            <div className="bg-acamp-yellow text-acamp-blue p-3 rounded-xl group-hover:translate-y-[-4px] transition-transform"><Trophy size={24} /></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Ranking</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tighter uppercase">Gestão da Equipe</h3>
            <p className="text-xs text-gray-400 font-medium">Filtre e gerencie o progresso dos seus arqueiros</p>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full sm:w-64 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-xs font-bold focus:ring-2 focus:ring-acamp-blue outline-none transition-all" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase text-gray-400 font-black tracking-[0.2em]">
                <th className="px-8 py-5">Nome do Arqueiro</th>
                <th className="px-8 py-5">Volume Hoje</th>
                <th className="px-8 py-5 text-center">Saldo BTC</th>
                <th className="px-8 py-5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAthletes.map(athlete => (
                <tr key={athlete.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-acamp-blue/5 flex items-center justify-center text-acamp-blue font-black text-sm border border-acamp-blue/5">
                        {(athlete.name || 'A').charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-black text-gray-800 block leading-tight">{athlete.name || 'Sem nome'}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{athlete.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-acamp-blue">{athlete.today_shots || 0} <span className="text-[10px] opacity-50 ml-0.5">fl</span></span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-acamp-yellow/10 px-3 py-1 rounded-full border border-acamp-yellow/20">
                      <span className="text-xs font-black text-acamp-blue">{athlete.brotocoin_balance}</span>
                      <Coins size={10} className="text-acamp-yellow" />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => openAthleteDetail(athlete)} 
                      className="bg-acamp-light text-acamp-blue text-[9px] font-black uppercase px-4 py-2 rounded-xl border border-acamp-blue/10 hover:bg-acamp-blue hover:text-white transition-all active:scale-95"
                    >
                      Histórico
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PREMIAR */}
      {activeModal === 'award' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Coins size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">Enviar Prêmios</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Destinatário</label>
                <select 
                  className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                >
                  <option value="all">Toda a Equipe</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="text-center space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor do Bônus</label>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setAwardAmount(Math.max(1, awardAmount - 5))} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black active:scale-90">-</button>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-acamp-blue tracking-tighter">{awardAmount}</span>
                    <span className="text-[8px] font-black text-acamp-yellow uppercase tracking-[0.2em]">BTC</span>
                  </div>
                  <button onClick={() => setAwardAmount(awardAmount + 5)} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black active:scale-90">+</button>
                </div>
              </div>

              <button 
                onClick={handleAward} 
                className="w-full bg-acamp-yellow text-acamp-blue py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} /> Confirmar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: METAS INDIVIDUAIS */}
      {activeModal === 'meta_picker' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Target size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">Metas Individuais</h3>
              </div>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-4">
              <p className="text-xs text-gray-400 font-medium mb-6">Ajuste as metas para desafiar cada arqueiro. As metas são salvas ao sair do campo.</p>
              {athletes.map(a => (
                <div key={a.id} className="p-6 border border-gray-100 rounded-[2rem] bg-gray-50/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-xs text-acamp-blue">{(a.name || 'A').charAt(0)}</div>
                    <p className="font-black text-gray-800 text-sm">{a.name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Score Meta</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-black text-acamp-blue focus:ring-2 focus:ring-acamp-blue outline-none"
                        defaultValue={a.individual_goals?.daily_score || currentGoals.daily_score_target}
                        onBlur={(e) => updateAthleteGoal(a.id, 'daily_score', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Tiros Meta</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-black text-acamp-blue focus:ring-2 focus:ring-acamp-blue outline-none"
                        defaultValue={a.individual_goals?.daily_shots || currentGoals.daily_shots_target}
                        onBlur={(e) => updateAthleteGoal(a.id, 'daily_shots', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Frequência</label>
                      <input 
                        type="number" 
                        className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-black text-acamp-blue focus:ring-2 focus:ring-acamp-blue outline-none"
                        defaultValue={a.individual_goals?.weekly_attendance || currentGoals.weekly_attendance_target}
                        onBlur={(e) => updateAthleteGoal(a.id, 'weekly_attendance', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-gray-50 text-center">
              <button onClick={() => setActiveModal(null)} className="bg-acamp-blue text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">Finalizar Edição</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RANKING */}
      {activeModal === 'ranking' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Trophy size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">Arqueiros de Elite</h3>
              </div>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {sortedByCoins.map((a, idx) => (
                <div key={a.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${idx === 0 ? 'bg-yellow-50 border-acamp-yellow shadow-sm' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-black ${idx === 0 ? 'text-acamp-yellow' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>{idx + 1}º</span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100">
                      <img src={a.avatar_url || `https://ui-avatars.com/api/?name=${a.name}&background=random`} alt={a.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-black text-gray-800 text-sm">{a.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-acamp-blue">{a.brotocoin_balance}</span>
                    <Coins size={12} className="text-acamp-yellow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO TREINO */}
      {activeModal === 'training' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Dumbbell size={20} /></div>
                <h3 className="font-black uppercase tracking-widest text-sm">Novo Treino Físico</h3>
              </div>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-8 space-y-4">
              <input 
                placeholder="Título do Treino" 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                value={newTraining.title}
                onChange={e => setNewTraining({...newTraining, title: e.target.value})}
              />
              <textarea 
                placeholder="Descreva os exercícios e repetições..." 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-32 font-medium text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                value={newTraining.description}
                onChange={e => setNewTraining({...newTraining, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={newTraining.intensity}
                  onChange={e => setNewTraining({...newTraining, intensity: e.target.value as any})}
                >
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
                <input 
                  placeholder="Ex: 45 min" 
                  className="p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={newTraining.duration}
                  onChange={e => setNewTraining({...newTraining, duration: e.target.value})}
                />
              </div>
              <select 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-acamp-blue"
                value={newTraining.athlete_id}
                onChange={e => setNewTraining({...newTraining, athlete_id: e.target.value})}
              >
                <option value="all">Toda a Equipe</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button 
                onClick={handleAddTraining} 
                className="w-full bg-acamp-blue text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all mt-4"
              >
                Publicar Treino
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO ATLETA */}
      {activeModal === 'athlete_detail' && viewingAthlete && (
        <div className="fixed inset-0 bg-acamp-blue/95 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black border border-white/20">{(viewingAthlete.name || 'A').charAt(0)}</div>
                 <div>
                   <h3 className="font-black text-xl tracking-tighter uppercase">{viewingAthlete.name}</h3>
                   <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">{viewingAthlete.category}</span>
                 </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={28} /></button>
            </div>
            <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] no-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-gray-50 p-6 rounded-[2rem] text-center border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Saldo</p>
                    <p className="text-2xl font-black text-acamp-blue">{viewingAthlete.brotocoin_balance}</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-[2rem] text-center border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Tiros Hoje</p>
                    <p className="text-2xl font-black text-acamp-blue">{viewingAthlete.today_shots}</p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-[2rem] text-center border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Presença</p>
                    <p className="text-2xl font-black text-acamp-blue">{viewingAthlete.monthly_attendance}</p>
                 </div>
              </div>

              <div>
                 <h4 className="font-black text-gray-800 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Calendar size={14} className="text-acamp-blue" /> Histórico de Presença
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {viewingAthlete.attendance_history.slice(-20).map((date, idx) => (
                       <div key={idx} className="bg-acamp-blue/5 text-acamp-blue text-[9px] px-3 py-1.5 rounded-xl font-black border border-acamp-blue/10">
                          {new Date(date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                       </div>
                    ))}
                    {viewingAthlete.attendance_history.length === 0 && <p className="text-gray-400 text-xs italic">Nenhuma presença registrada.</p>}
                 </div>
              </div>

              <div>
                 <h4 className="font-black text-gray-800 text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Target size={14} className="text-acamp-blue" /> Últimos Treinos Técnicos
                 </h4>
                 <div className="space-y-3">
                    {viewingAthlete.history.slice(0, 5).map((h, idx) => (
                       <div key={idx} className="flex justify-between items-center p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 group hover:border-acamp-blue transition-all">
                          <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase block mb-0.5">{h.date}</span>
                            <span className="text-sm font-black text-gray-800">{h.distance} Metros</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-black text-acamp-blue tracking-tighter">{h.score} <span className="text-[10px] font-bold opacity-30">PTS</span></span>
                          </div>
                       </div>
                    ))}
                    {viewingAthlete.history.length === 0 && <p className="text-gray-400 text-xs italic">Sem histórico de tiros.</p>}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PRESENTES HOJE */}
      {activeModal === 'attendance_today' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">Presentes Agora</h3>
              <button onClick={() => setActiveModal(null)}><X size={24} /></button>
            </div>
            <div className="p-8 space-y-4">
              {presentAthletes.map(a => (
                <div key={a.id} className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700">
                  <div className="bg-green-100 p-2 rounded-xl"><CheckCircle2 size={16} /></div>
                  <span className="font-black text-sm">{a.name}</span>
                </div>
              ))}
              {presentAthletes.length === 0 && (
                <div className="text-center py-12">
                   <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Ninguém assinou a presença</p>
                   <p className="text-gray-300 text-[10px] mt-1">Os arqueiros aparecem aqui após confirmarem presença.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
