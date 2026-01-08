import React, { useState } from 'react';
import { ICONS } from '../constants';
import { AthleteData, ShotHistoryItem } from '../types';

interface ShotLoggerProps {
  user: AthleteData;
  onComplete?: (totalShots: number, bestScore: number, endScores: Record<number, (string | number)[]>) => void;
}

const ShotLogger: React.FC<ShotLoggerProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [session, setSession] = useState({
    distance: 18,
    arrows_per_end: 3,
    num_ends: 10
  });

  const [currentEnd, setCurrentEnd] = useState(1);
  const [scores, setScores] = useState<Record<number, (string | number)[]>>({});
  const [viewingDetail, setViewingDetail] = useState<ShotHistoryItem | null>(null);

  const handleScoreInput = (score: string | number) => {
    const endScores = scores[currentEnd] || [];
    if (endScores.length < session.arrows_per_end) {
      setScores({
        ...scores,
        [currentEnd]: [...endScores, score]
      });
    }
  };

  const removeLastScore = () => {
    const endScores = scores[currentEnd] || [];
    if (endScores.length > 0) {
      setScores({
        ...scores,
        [currentEnd]: endScores.slice(0, -1)
      });
    }
  };

  const nextEnd = () => {
    if (currentEnd < session.num_ends) {
      setCurrentEnd(currentEnd + 1);
    } else {
      setStep(3); // Summary
      const scoreArrays = Object.values(scores) as (string | number)[][];
      const endTotals: number[] = scoreArrays.map((end): number => {
        return end.reduce<number>((acc, val) => {
          const numericVal = val === 'X' ? 10 : val === 'M' ? 0 : Number(val);
          return acc + numericVal;
        }, 0);
      });
      const totalScoreValue = endTotals.reduce((a: number, b: number): number => a + b, 0);
      if (onComplete) {
        onComplete(session.arrows_per_end * session.num_ends, totalScoreValue, scores);
      }
    }
  };

  const totalScore = (Object.values(scores) as (string | number)[][]).flat().reduce<number>((acc, val) => {
    const numericVal = val === 'X' ? 10 : val === 'M' ? 0 : Number(val);
    return acc + numericVal;
  }, 0);

  const getScoreColor = (val: string | number) => {
    const num = val === 'X' ? 10 : val === 'M' ? 0 : Number(val);
    if (num >= 9) return 'bg-acamp-yellow text-acamp-blue border-yellow-500'; // Gold
    if (num >= 7) return 'bg-red-500 text-white border-red-600'; // Red
    if (num >= 5) return 'bg-blue-500 text-white border-blue-600'; // Blue
    if (num >= 3) return 'bg-gray-900 text-white border-black'; // Black
    if (num >= 1) return 'bg-white text-gray-800 border-gray-300'; // White
    return 'bg-gray-400 text-white border-gray-500'; // Miss
  };

  if (step === 1) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <div className="bg-acamp-blue text-white p-2 rounded-xl">{ICONS.Target}</div>
            Novo Treino Técnico
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-gray-400 mb-2 block">Distância</label>
              <div className="grid grid-cols-4 gap-2">
                {[18, 20, 30, 50, 60, 70].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setSession({...session, distance: d})}
                    className={`py-3 rounded-xl font-bold transition-all text-sm ${session.distance === d ? 'bg-acamp-blue text-white shadow-md scale-105' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Flechas/Série</label>
                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 p-1">
                  <button onClick={() => setSession(s => ({...s, arrows_per_end: Math.max(1, s.arrows_per_end - 1)}))} className="w-10 h-10 flex items-center justify-center font-bold text-gray-400">-</button>
                  <span className="flex-1 text-center font-black text-acamp-blue">{session.arrows_per_end}</span>
                  <button onClick={() => setSession(s => ({...s, arrows_per_end: Math.min(12, s.arrows_per_end + 1)}))} className="w-10 h-10 flex items-center justify-center font-bold text-gray-400">+</button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Total Séries</label>
                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 p-1">
                  <button onClick={() => setSession(s => ({...s, num_ends: Math.max(1, s.num_ends - 1)}))} className="w-10 h-10 flex items-center justify-center font-bold text-gray-400">-</button>
                  <span className="flex-1 text-center font-black text-acamp-blue">{session.num_ends}</span>
                  <button onClick={() => setSession(s => ({...s, num_ends: Math.min(40, s.num_ends + 1)}))} className="w-10 h-10 flex items-center justify-center font-bold text-gray-400">+</button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-acamp-yellow text-acamp-blue font-black py-5 rounded-2xl shadow-xl mt-4 active:scale-95 transition-all uppercase tracking-[0.2em] text-xs"
            >
              Iniciar Sessão Artemis
            </button>
          </div>
        </div>

        {/* Histórico das Últimas 10 Sessões */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              {ICONS.Trend} Últimas 10 Sessões
            </h3>
            <span className="bg-acamp-light text-acamp-blue px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Histórico</span>
          </div>

          {user.history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="text-gray-200 mb-2 flex justify-center opacity-30">{ICONS.Target}</div>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Sem treinos recentes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {user.history.slice(0, 10).map((h) => {
                const totalArrows = h.end_scores ? Object.values(h.end_scores).flat().length : 30;
                const avg = (h.score / totalArrows).toFixed(1);

                return (
                  <button 
                    key={h.id} 
                    onClick={() => setViewingDetail(h)}
                    className="group relative w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-gray-100 hover:border-acamp-blue hover:shadow-lg transition-all active:scale-[0.98] text-left"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black text-acamp-blue uppercase tracking-widest">{h.distance}m</span>
                         <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                         <span className="text-[10px] font-bold text-gray-400">{h.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-gray-900 tracking-tighter">{h.score} pts</span>
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded text-[9px] font-black uppercase">Avg: {avg}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {/* Fix: Property 'slice' does not exist on type 'unknown' by casting Object.values results to (string | number)[][] */}
                        {h.end_scores && (Object.values(h.end_scores) as (string | number)[][])[0]?.slice(0, 3).map((s, i) => (
                           <div key={i} className={`w-3 h-3 rounded-full border border-white shadow-sm ${getScoreColor(s)}`}></div>
                        ))}
                      </div>
                      <div className="text-gray-300 group-hover:text-acamp-blue transition-colors">{ICONS.ChevronRight}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Detalhes Estilo Artemis */}
        {viewingDetail && (
          <div className="fixed inset-0 bg-acamp-blue/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
              <div className="bg-white border-b border-gray-100 p-8 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-acamp-blue tracking-tighter">Detalhes da Sessão</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{viewingDetail.date}</span>
                    <span className="text-[10px] font-black text-acamp-yellow bg-acamp-blue px-2 py-0.5 rounded uppercase tracking-widest">{viewingDetail.distance} Metros</span>
                  </div>
                </div>
                <button onClick={() => setViewingDetail(null)} className="bg-gray-50 p-3 rounded-2xl text-gray-400 hover:text-acamp-blue transition-colors">✕</button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar bg-gray-50/50">
                {viewingDetail.end_scores ? (
                  Object.entries(viewingDetail.end_scores).map(([num, arrows]) => {
                    const endSum = (arrows as (string | number)[]).reduce<number>((acc, val) => acc + (val === 'X' ? 10 : val === 'M' ? 0 : Number(val)), 0);
                    return (
                      <div key={num} className="flex items-center justify-between p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Série {num}</span>
                          <div className="flex gap-1.5">
                            {(arrows as (string | number)[]).map((a, i) => (
                              <div 
                                key={i} 
                                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border-2 shadow-sm transition-transform hover:scale-110 ${getScoreColor(a)}`}
                              >
                                {a}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-acamp-blue block leading-none">{endSum}</span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Soma</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-gray-400 py-12 italic">Dados das séries não encontrados.</p>
                )}
              </div>

              <div className="p-8 bg-white border-t border-gray-100 grid grid-cols-2 gap-6">
                <div className="bg-acamp-blue rounded-3xl p-5 text-white flex flex-col items-center">
                   <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Pontuação Final</span>
                   <span className="text-4xl font-black text-acamp-yellow tracking-tighter">{viewingDetail.score}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                      <span className="text-[8px] font-black text-gray-400 uppercase block">10s/Xs</span>
                      <span className="text-xl font-black text-acamp-blue">
                        {(Object.values(viewingDetail.end_scores || {}) as (string|number)[][]).flat().filter(v => v === 10 || v === 'X').length}
                      </span>
                   </div>
                   <div className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                      <span className="text-[8px] font-black text-gray-400 uppercase block">Misses</span>
                      <span className="text-xl font-black text-red-500">
                        {(Object.values(viewingDetail.end_scores || {}) as (string|number)[][]).flat().filter(v => v === 'M' || v === 0).length}
                      </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 2) {
    const currentEndScores = scores[currentEnd] || [];
    return (
      <div className="space-y-6 animate-in slide-in-from-right duration-500">
        <div className="flex items-center justify-between p-2 bg-acamp-blue rounded-3xl shadow-lg border border-acamp-dark/30">
          <button onClick={() => setStep(1)} className="text-blue-200 px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest">Abandonar</button>
          <div className="bg-white text-acamp-blue px-5 py-1.5 rounded-2xl font-black text-xs shadow-inner">
            SÉRIE {currentEnd} / {session.num_ends}
          </div>
          <div className="font-black text-acamp-yellow px-4 text-sm tracking-tighter">TOTAL: {totalScore}</div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            {ICONS.Target}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-10 min-h-[64px]">
            {Array.from({ length: session.arrows_per_end }).map((_, i) => (
              <div 
                key={i} 
                className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-xl font-black transition-all ${currentEndScores[i] !== undefined ? `${getScoreColor(currentEndScores[i])} scale-105 shadow-md` : 'border-dashed border-gray-100 bg-gray-50/50 text-gray-200'}`}
              >
                {currentEndScores[i] ?? ''}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {['X', 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'].map(val => (
              <button 
                key={val}
                disabled={currentEndScores.length >= session.arrows_per_end}
                onClick={() => handleScoreInput(val)}
                className={`h-16 rounded-2xl font-black text-xl active:scale-90 transition-all border-2 shadow-sm ${currentEndScores.length >= session.arrows_per_end ? 'opacity-30 grayscale' : 'hover:brightness-110'} ${getScoreColor(val)}`}
              >
                {val}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-10">
            <button onClick={removeLastScore} className="bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">Apagar Última</button>
            <button 
              onClick={nextEnd} 
              disabled={currentEndScores.length < session.arrows_per_end} 
              className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg transition-all ${currentEndScores.length < session.arrows_per_end ? 'bg-gray-100 text-gray-300' : 'bg-acamp-blue text-white active:scale-95'}`}
            >
              {currentEnd === session.num_ends ? 'Finalizar Treino' : 'Próxima Série'}
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dica: Pontue cada flecha individualmente conforme o impacto.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-lg">
        {ICONS.Check}
      </div>
      <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Sessão Concluída!</h2>
      <p className="text-gray-400 mb-10 text-sm font-medium">Parabéns pelo volume de tiros hoje. A constância é a chave da perfeição.</p>
      
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-acamp-light rounded-3xl p-6 border border-acamp-blue/5">
          <span className="text-[10px] text-acamp-blue font-black uppercase tracking-widest block mb-2 opacity-60">Total de Pontos</span>
          <span className="text-4xl font-black text-acamp-blue tracking-tighter">{totalScore}</span>
        </div>
        <div className="bg-yellow-50 rounded-3xl p-6 border border-acamp-yellow/10">
          <span className="text-[10px] text-acamp-blue font-black uppercase tracking-widest block mb-2 opacity-60">Total Flechas</span>
          <span className="text-4xl font-black text-acamp-blue tracking-tighter">{session.arrows_per_end * session.num_ends}</span>
        </div>
      </div>

      <button onClick={() => setStep(1)} className="w-full bg-acamp-blue text-white font-black py-5 rounded-3xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">Menu de Treinos</button>
    </div>
  );
};

export default ShotLogger;