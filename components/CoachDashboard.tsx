
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Category, GlobalGoals, AthleteData, TrainingPlan } from '../types';
// Fixed: Added 'Calendar' to the imports from 'lucide-react'
import { ChevronLeft, ChevronRight, X, Trophy, Target, Coins, Dumbbell, Calendar } from 'lucide-react';

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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<'meta_picker' | 'award' | 'training' | 'ranking' | 'athlete_detail' | 'attendance_today' | null>(null);
  const [coachViewDate, setCoachViewDate] = useState(new Date());

  // States para os formulários de ações rápidas
  const [awardAmount, setAwardAmount] = useState<number>(10);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | 'all'>('all');
  
  const [newTraining, setNewTraining] = useState({
    title: '',
    description: '',
    athlete_id: 'all',
    intensity: 'Média' as const,
    duration: '30 min'
  });

  const [viewingAthlete, setViewingAthlete] = useState<AthleteData | null>(null);

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(filter.toLowerCase()) && 
    (categoryFilter === 'all' || a.category === categoryFilter)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const sortedByCoins = [...athletes].sort((a, b) => b.brotocoin_balance - a.brotocoin_balance);
  
  const today = new Date();
  const presentAthletes = athletes.filter(a => 
    a.attendance_history.some(d => new Date(d).toDateString() === today.toDateString())
  );

  const handleSaveIndividualGoals = () => {
    if (viewingAthlete) {
      onUpdateIndividualGoals(viewingAthlete.id, viewingAthlete.individual_goals);
      setActiveModal(null);
      alert(`Metas para ${viewingAthlete.name.split(' ')[0]} atualizadas com sucesso!`);
    }
  };

  const handleAward = () => {
    onAwardCoins(selectedAthleteId, awardAmount);
    setActiveModal(null);
    const targetName = selectedAthleteId === 'all' ? 'toda a equipe' : athletes.find(a => a.id === selectedAthleteId)?.name;
    alert(`Prêmio de ${awardAmount} BORTOCOINS enviado para ${targetName}!`);
  };

  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.description) {
      alert("Por favor, preencha o título e a descrição.");
      return;
    }
    onAddTraining(newTraining);
    setActiveModal(null);
    alert('Treino atribuído com sucesso!');
    setNewTraining({ title: '', description: '', athlete_id: 'all', intensity: 'Média', duration: '30 min' });
  };

  const openAthleteDetail = (athlete: AthleteData) => {
    setViewingAthlete({
      ...athlete,
      individual_goals: athlete.individual_goals || {
        daily_score: currentGoals.daily_score_target,
        daily_shots: currentGoals.daily_shots_target,
        weekly_attendance: currentGoals.weekly_attendance_target
      }
    });
    setCoachViewDate(new Date());
    setActiveModal('athlete_detail');
  };

  const renderAttendanceMiniCalendar = (history: string[]) => {
    const month = coachViewDate.getMonth();
    const year = coachViewDate.getFullYear();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const calendar = [];
    for(let i = 0; i < firstDay; i++) calendar.push(null);
    for(let i = 1; i <= totalDays; i++) calendar.push(i);

    const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(coachViewDate);

    return (
      <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCoachViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-200 rounded-full text-gray-400">
            <ChevronLeft size={14} />
          </button>
          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center capitalize">
            {monthName} {year}
          </h5>
          <button onClick={() => setCoachViewDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-200 rounded-full text-gray-400">
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="text-[8px] font-black text-gray-300 text-center">{d}</div>)}
          {calendar.map((d, i) => {
            if (!d) return <div key={i}></div>;
            const hasAtt = history.some(att => {
              const date = new Date(att);
              return date.getDate() === d && date.getMonth() === month && date.getFullYear() === year;
            });
            return (
              <div key={i} className={`h-6 flex items-center justify-center text-[9px] font-black rounded-lg ${hasAtt ? 'bg-acamp-blue text-white shadow-sm' : 'text-gray-200'}`}>
                {d}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Painel do Técnico</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Total Atletas</p>
            <p className="text-2xl font-bold text-acamp-blue">{athletes.length}</p>
          </div>
          <button 
            onClick={() => setActiveModal('attendance_today')}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-left hover:bg-gray-50 transition-colors active:scale-95"
          >
            <div className="flex justify-between items-start">
              <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Presença Hoje</p>
              <div className="text-acamp-blue scale-75">{ICONS.ChevronRight}</div>
            </div>
            <p className="text-2xl font-bold text-green-600">{presentAthletes.length}</p>
          </button>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 uppercase font-bold mb-1 tracking-wider">Líder Ranking</p>
            <p className="text-2xl font-bold text-acamp-yellow truncate">{sortedByCoins[0]?.name.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-acamp-blue text-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-xl font-bold mb-2">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button onClick={() => setActiveModal('meta_picker')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Target size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Metas Individuais</span>
          </button>
          <button onClick={() => setActiveModal('award')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Coins size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Premiar Atleta</span>
          </button>
          <button onClick={() => setActiveModal('training')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Dumbbell size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Atribuir Treino</span>
          </button>
          <button onClick={() => setActiveModal('ranking')} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/10 transition-all active:scale-95">
            <div className="bg-acamp-yellow text-acamp-blue p-2 rounded-xl"><Trophy size={20} /></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Ranking Global</span>
          </button>
        </div>
      </div>

      {/* Lista de Atletas */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-800">Atletas e Rendimento</h3>
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Clique no atleta para detalhes</div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Pesquisar atleta..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-acamp-blue outline-none" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
            />
            <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">Todas Categorias</option>
              <option value={Category.RECURVO}>Recurvo</option>
              <option value={Category.COMPOSTO}>Composto</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold tracking-widest">
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Freq. (Mês)</th>
                <th className="px-6 py-4 text-center">BORTOCOINS</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAthletes.map(athlete => {
                const isAttendanceLow = athlete.monthly_attendance < 8;
                return (
                  <tr key={athlete.id} onClick={() => openAthleteDetail(athlete)} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-acamp-blue/10 flex items-center justify-center text-acamp-blue font-bold text-xs">{athlete.name.charAt(0)}</div>
                        <div>
                          <span className="text-sm font-semibold block">{athlete.name}</span>
                          <span className="text-[10px] text-gray-400 uppercase font-bold">{athlete.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${isAttendanceLow ? 'text-red-500' : 'text-acamp-blue'}`}>
                          {athlete.monthly_attendance} d
                        </span>
                        {isAttendanceLow && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-acamp-blue font-bold text-sm bg-acamp-yellow/20 px-3 py-1 rounded-full border border-acamp-yellow/30">{athlete.brotocoin_balance}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-acamp-blue opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1 text-xs font-bold uppercase">
                        Ver Detalhes {ICONS.ChevronRight}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Atribuir Treino */}
      {activeModal === 'training' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><Dumbbell size={20} /> Novo Treino</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Título do Treino</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue"
                  placeholder="Ex: Reforço de Ombro"
                  value={newTraining.title}
                  onChange={e => setNewTraining({...newTraining, title: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Descrição / Instruções</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue h-24 resize-none"
                  placeholder="Instruções para o atleta..."
                  value={newTraining.description}
                  onChange={e => setNewTraining({...newTraining, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Intensidade</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none"
                    value={newTraining.intensity}
                    onChange={e => setNewTraining({...newTraining, intensity: e.target.value as any})}
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Duração Est.</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none"
                    placeholder="20 min"
                    value={newTraining.duration}
                    onChange={e => setNewTraining({...newTraining, duration: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Atribuir Para</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none"
                  value={newTraining.athlete_id}
                  onChange={e => setNewTraining({...newTraining, athlete_id: e.target.value})}
                >
                  <option value="all">Toda a Equipe</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <button 
                onClick={handleAddTraining}
                className="w-full bg-acamp-blue text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
              >
                Atribuir Treino Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Premiar Atleta */}
      {activeModal === 'award' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><Coins size={20} /> Premiar Atleta</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Selecione o Atleta</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue"
                  value={selectedAthleteId}
                  onChange={e => setSelectedAthleteId(e.target.value)}
                >
                  <option value="all">Equipe Inteira</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Valor da Recompensa</label>
                <div className="flex items-center justify-center gap-6">
                  <button onClick={() => setAwardAmount(prev => Math.max(-500, prev - 10))} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold">-</button>
                  <div className="flex flex-col items-center">
                    <span className={`text-4xl font-black tracking-tighter ${awardAmount >= 0 ? 'text-acamp-blue' : 'text-red-500'}`}>{awardAmount}</span>
                    <span className="text-[10px] font-bold text-acamp-yellow uppercase tracking-widest">BORTOCOINS</span>
                  </div>
                  <button onClick={() => setAwardAmount(prev => Math.min(1000, prev + 10))} className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-bold">+</button>
                </div>
              </div>
              <button 
                onClick={handleAward}
                className="w-full bg-acamp-yellow text-acamp-blue py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all mt-4"
              >
                Confirmar Lançamento
              </button>
              <p className="text-[9px] text-gray-400 text-center uppercase tracking-widest">Este lançamento ficará registrado no histórico do atleta.</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Metas Individuais (Seletor) */}
      {activeModal === 'meta_picker' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><Target size={20} /> Ajustar Metas</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selecione o atleta para editar</p>
              {athletes.map(a => (
                <button 
                  key={a.id} 
                  onClick={() => openAthleteDetail(a)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-acamp-blue/10 flex items-center justify-center text-acamp-blue font-bold text-xs">{a.name.charAt(0)}</div>
                    <div>
                      <span className="text-sm font-semibold block">{a.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{a.category}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe/Rendimento (Usado para metas e histórico individual) */}
      {activeModal === 'athlete_detail' && viewingAthlete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">{viewingAthlete.name.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold">{viewingAthlete.name}</h3>
                  <span className="text-[10px] font-bold uppercase text-blue-200">Rendimento Individual</span>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Calendário de Frequência
                  </h4>
                  {renderAttendanceMiniCalendar(viewingAthlete.attendance_history)}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-widest flex items-center gap-2">
                    <Target size={12} /> Últimos Treinos Técnicos
                  </h4>
                  <div className="space-y-2">
                    {viewingAthlete.history.slice(0, 4).map(h => (
                      <div key={h.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(h.date).toLocaleDateString()}</span>
                        <span className="text-sm font-black text-acamp-blue">{h.score} pts</span>
                      </div>
                    ))}
                    {viewingAthlete.history.length === 0 && <p className="text-[10px] text-gray-300 italic py-4 text-center">Sem registros de tiro</p>}
                  </div>
                </div>
              </div>
              
              <div className="bg-acamp-light/30 p-6 rounded-[2rem] border border-acamp-blue/5">
                <h4 className="text-[10px] font-bold uppercase text-acamp-blue mb-4 tracking-widest flex items-center gap-2">
                  <Target size={12} /> Ajustar Metas Individuais
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Pontos/Dia</label>
                      <input 
                        type="number" 
                        className="w-full bg-white p-4 rounded-2xl text-sm font-bold border border-gray-100 focus:ring-2 focus:ring-acamp-blue outline-none shadow-sm"
                        value={viewingAthlete.individual_goals?.daily_score}
                        onChange={(e) => setViewingAthlete({
                          ...viewingAthlete, 
                          individual_goals: { ...viewingAthlete.individual_goals, daily_score: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Flechas/Dia</label>
                      <input 
                        type="number" 
                        className="w-full bg-white p-4 rounded-2xl text-sm font-bold border border-gray-100 focus:ring-2 focus:ring-acamp-blue outline-none shadow-sm"
                        value={viewingAthlete.individual_goals?.daily_shots}
                        onChange={(e) => setViewingAthlete({
                          ...viewingAthlete, 
                          individual_goals: { ...viewingAthlete.individual_goals, daily_shots: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase ml-1">Freq/Semana</label>
                      <input 
                        type="number" 
                        className="w-full bg-white p-4 rounded-2xl text-sm font-bold border border-gray-100 focus:ring-2 focus:ring-acamp-blue outline-none shadow-sm"
                        value={viewingAthlete.individual_goals?.weekly_attendance}
                        onChange={(e) => setViewingAthlete({
                          ...viewingAthlete, 
                          individual_goals: { ...viewingAthlete.individual_goals, weekly_attendance: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSaveIndividualGoals}
                    className="w-full bg-acamp-blue text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                    Salvar Metas Pessoais
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ranking */}
      {activeModal === 'ranking' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><Trophy size={20} /> Ranking Global</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
              {sortedByCoins.map((athlete, idx) => (
                <div key={athlete.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`w-6 text-center font-bold ${idx === 0 ? 'text-acamp-yellow text-xl' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-orange-400' : 'text-gray-300'}`}>{idx + 1}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-acamp-blue/10 flex items-center justify-center font-bold text-xs">{athlete.name.charAt(0)}</div>
                      <span className="font-semibold text-gray-800 text-sm">{athlete.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-acamp-light px-3 py-1 rounded-full border border-acamp-blue/10">
                    <span className="text-acamp-blue font-bold text-sm">{athlete.brotocoin_balance}</span>
                    <span className="text-acamp-yellow scale-75"><Coins size={16} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Presença Hoje */}
      {activeModal === 'attendance_today' && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-acamp-blue p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2"><ChevronRight size={20} /> Presentes Hoje</h3>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar">
              {presentAthletes.length === 0 ? (
                <div className="text-center py-12 text-gray-300 font-bold uppercase tracking-widest italic">Nenhum atleta registrado ainda</div>
              ) : (
                presentAthletes.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-acamp-blue text-white flex items-center justify-center text-xs font-bold">{a.name.charAt(0)}</div>
                       <span className="font-bold text-sm">{a.name}</span>
                    </div>
                    <span className="text-[9px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded">Presente</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;
