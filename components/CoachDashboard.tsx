
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { GlobalGoals, AthleteData, TrainingPlan, Role } from '../types';
import { ChevronRight, X, Target, Dumbbell, CheckCircle2, Search, Save, Plus, Users, Check, Activity, TrendingUp, Users2, Zap, ArrowRight } from 'lucide-react';

interface CoachDashboardProps {
  athletes: AthleteData[];
  onUpdateGoals: (goals: Partial<GlobalGoals>) => void;
  onUpdateIndividualGoals: (athleteId: string, goals: AthleteData['individual_goals']) => void;
  onAddTraining: (plan: any) => void;
  currentGoals: GlobalGoals;
}

const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  athletes, 
  onUpdateGoals, 
  onUpdateIndividualGoals,
  onAddTraining, 
  currentGoals 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<'meta_picker' | 'training' | 'athlete_list' | null>(null);

  // Estados para Metas
  const [targetType, setTargetType] = useState<'global' | string>('global');
  const [tempGoals, setTempGoals] = useState({
    daily_score: currentGoals.daily_score_target,
    daily_shots: currentGoals.daily_shots_target,
    weekly_attendance: currentGoals.weekly_attendance_target
  });

  // Estados para Novo Treino
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    intensity: 'Média' as const,
    duration: '30 min'
  });
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>(['all']);

  useEffect(() => {
    if (targetType === 'global') {
      setTempGoals({
        daily_score: currentGoals.daily_score_target,
        daily_shots: currentGoals.daily_shots_target,
        weekly_attendance: currentGoals.weekly_attendance_target
      });
    } else {
      const athlete = athletes.find(a => a.id === targetType);
      if (athlete?.individual_goals) {
        setTempGoals({
          daily_score: athlete.individual_goals.daily_score || currentGoals.daily_score_target,
          daily_shots: athlete.individual_goals.daily_shots || currentGoals.daily_shots_target,
          weekly_attendance: athlete.individual_goals.weekly_attendance || currentGoals.weekly_attendance_target
        });
      }
    }
  }, [targetType, athletes, currentGoals]);

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

  const handleSaveGoals = () => {
    if (targetType === 'global') {
      onUpdateGoals({
        daily_score_target: tempGoals.daily_score,
        daily_shots_target: tempGoals.daily_shots,
        weekly_attendance_target: tempGoals.weekly_attendance
      });
    } else {
      onUpdateIndividualGoals(targetType, {
        daily_score: tempGoals.daily_score,
        daily_shots: tempGoals.daily_shots,
        weekly_attendance: tempGoals.weekly_attendance
      });
    }
    setActiveModal(null);
  };

  const handleCreateTraining = () => {
    if (!newTraining.title || !newTraining.description) {
      alert("Título e descrição são obrigatórios.");
      return;
    }

    // Se "Equipe Inteira" estiver selecionada, criamos um registro para cada atleta individualmente
    // Isso garante que cada atleta possa marcar seu treino como concluído sem afetar os demais.
    if (selectedRecipientIds.includes('all')) {
      const batchPlans = athletes
        .filter(a => a.role === Role.ATLETA) // Filtra para enviar apenas para atletas
        .map(athlete => ({
          ...newTraining,
          athlete_id: athlete.id
        }));
      
      onAddTraining(batchPlans);
    } else {
      // Caso contrário, enviamos apenas para os selecionados
      const individualPlans = selectedRecipientIds.map(recipientId => ({
        ...newTraining,
        athlete_id: recipientId
      }));
      onAddTraining(individualPlans);
    }

    setActiveModal(null);
    setNewTraining({ title: '', description: '', intensity: 'Média', duration: '30 min' });
    setSelectedRecipientIds(['all']);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const presentAthletes = athletes.filter(a => a.attendance_history.includes(todayStr));
  
  const recentSessions = athletes
    .flatMap(a => a.history.map(h => ({ ...h, athleteName: a.name })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Painel Técnico</h1>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Equipe em Monitoramento</p>
        </div>
      </div>

      {/* METRICAS CHAVE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveModal('athlete_list')}
          className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 text-left hover:border-acamp-blue transition-all active:scale-95 group"
        >
          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1 group-hover:text-acamp-blue">Squad Arqueiros</p>
          <div className="flex items-center gap-2">
             <Users2 size={16} className="text-acamp-blue" />
             <p className="text-2xl font-black text-gray-900">{athletes.length}</p>
             <ArrowRight size={14} className="text-gray-200 ml-auto" />
          </div>
        </button>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-1">Presença Hoje</p>
          <div className="flex items-center gap-2">
             <CheckCircle2 size={16} className="text-green-500" />
             <p className="text-2xl font-black text-gray-900">{presentAthletes.length}</p>
          </div>
        </div>
      </div>

      {/* MONITORAMENTO DE VOLUME (REAL-TIME) */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} className="text-acamp-blue" /> Volume Diário do Squad
          </h3>
        </div>
        <div className="space-y-4">
          {athletes.slice(0, 4).map(athlete => {
            const target = athlete.individual_goals?.daily_shots || currentGoals.daily_shots_target;
            const progress = Math.min((athlete.today_shots / target) * 100, 100);
            return (
              <div key={athlete.id} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-gray-700">{athlete.name}</span>
                  <span className={progress >= 100 ? 'text-green-500' : 'text-acamp-blue'}>
                    {athlete.today_shots} / {target}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-acamp-blue'}`} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AÇÕES DE GESTÃO */}
      <div className="bg-acamp-blue text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none rotate-12">
          <Activity size={120} />
        </div>
        <h2 className="text-lg font-black mb-6 uppercase tracking-widest">Gestão Técnica</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setActiveModal('meta_picker')} className="bg-white/10 hover:bg-white/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-4 rounded-2xl shadow-lg"><Target size={28} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Ajustar Metas</span>
          </button>
          <button onClick={() => setActiveModal('training')} className="bg-white/10 hover:bg-white/20 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-4 rounded-2xl shadow-lg"><Dumbbell size={28} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Prescrever</span>
          </button>
        </div>
      </div>

      {/* FEED DE ATIVIDADE */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-acamp-blue" /> Atividade Recente
        </h3>
        <div className="space-y-4">
          {recentSessions.map((session, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 hover:border-acamp-blue/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-black text-acamp-blue text-xs border border-gray-100 uppercase">
                  {session.athleteName.charAt(0)}
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-800">{session.athleteName}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{session.distance}m • {new Date(session.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-acamp-blue leading-none">{session.score}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL LISTA DE ATLETAS */}
      {activeModal === 'athlete_list' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">Squad ACAMP</h3>
              <button onClick={() => setActiveModal(null)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-6 border-b border-gray-50 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar pelo nome..." 
                  className="w-full bg-gray-50 p-4 pl-12 rounded-2xl font-bold text-xs outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar space-y-3">
              {filteredAthletes.map(athlete => {
                const target = athlete.individual_goals?.daily_shots || currentGoals.daily_shots_target;
                const progress = Math.min((athlete.today_shots / target) * 100, 100);
                return (
                  <div key={athlete.id} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:border-acamp-blue/30 transition-all">
                    <div className="flex items-center gap-4">
                      <img src={athlete.avatar_url || `https://ui-avatars.com/api/?name=${athlete.name}`} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" alt={athlete.name} />
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{athlete.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">{athlete.category}</p>
                      </div>
                    </div>
                    <div className="text-right min-w-[120px]">
                      <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Volume Hoje</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`text-lg font-black ${progress >= 100 ? 'text-green-500' : 'text-acamp-blue'}`}>{athlete.today_shots}</span>
                        <span className="text-xs text-gray-300 font-bold">/ {target}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mt-1">
                        <div className={`h-full transition-all duration-700 ${progress >= 100 ? 'bg-green-500' : 'bg-acamp-blue'}`} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL METAS */}
      {activeModal === 'meta_picker' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">Metas e Frequência</h3>
              <button onClick={() => setActiveModal(null)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Público da Meta</label>
                <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={targetType} onChange={e => setTargetType(e.target.value)}>
                  <option value="global">Equipe (Meta Geral)</option>
                  <optgroup label="Metas Individuais">
                    {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </optgroup>
                </select>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Score de Ouro (Diário)</label>
                   <input type="number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-lg outline-none" value={tempGoals.daily_score} onChange={e => setTempGoals({...tempGoals, daily_score: Number(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Volume (Flechas)</label>
                    <input type="number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-lg outline-none" value={tempGoals.daily_shots} onChange={e => setTempGoals({...tempGoals, daily_shots: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Frequência (Dias)</label>
                    <input type="number" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black text-lg outline-none" value={tempGoals.weekly_attendance} onChange={e => setTempGoals({...tempGoals, weekly_attendance: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <button onClick={handleSaveGoals} className="w-full bg-acamp-blue text-white py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-acamp-dark transition-all active:scale-95 flex items-center justify-center gap-2">
                <Save size={16} /> Salvar Prescrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TREINO */}
      {activeModal === 'training' && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-8 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">Nova Prescrição</h3>
              <button onClick={() => setActiveModal(null)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-4 overflow-y-auto no-scrollbar">
              <input placeholder="Título do Treino" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={newTraining.title} onChange={e => setNewTraining({...newTraining, title: e.target.value})} />
              <textarea placeholder="Instruções..." className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-24 font-medium text-sm outline-none" value={newTraining.description} onChange={e => setNewTraining({...newTraining, description: e.target.value})} />
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Destinatários</label>
                <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  <button onClick={() => toggleRecipient('all')} className={`flex items-center justify-between p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${selectedRecipientIds.includes('all') ? 'bg-acamp-blue text-white border-acamp-blue' : 'bg-white border-gray-100 text-gray-400'}`}>
                    Toda a Equipe {selectedRecipientIds.includes('all') && <Check size={14} />}
                  </button>
                  {athletes.map(a => (
                    <button key={a.id} onClick={() => toggleRecipient(a.id)} className={`flex items-center justify-between p-3 rounded-xl border font-black text-[10px] uppercase transition-all ${selectedRecipientIds.includes(a.id) ? 'bg-acamp-blue text-white border-acamp-blue' : 'bg-white border-gray-100 text-gray-400'}`}>
                      {a.name} {selectedRecipientIds.includes(a.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Duração" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm" value={newTraining.duration} onChange={e => setNewTraining({...newTraining, duration: e.target.value})} />
                <select className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={newTraining.intensity} onChange={e => setNewTraining({...newTraining, intensity: e.target.value as any})}>
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                </select>
              </div>
              <button onClick={handleCreateTraining} className="w-full bg-acamp-yellow text-acamp-blue py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl mt-2">Publicar Treino</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
