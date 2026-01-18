
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Profile, Role, Category, GlobalGoals, AthleteData, TrainingPlan, ShotHistoryItem } from './types';
import { supabase } from './lib/supabase';
import AthleteDashboard from './components/AthleteDashboard';
import CoachDashboard from './components/CoachDashboard';
import AttendancePage from './components/AttendancePage';
import ShotLogger from './components/ShotLogger';
import TrainingPlansPage from './components/TrainingPlansPage';
import GoalsPage from './components/GoalsPage';
import Navbar from './components/Navbar';
import Header from './components/Header';
import ProfilePage from './components/ProfilePage';
import Logo from './components/Logo';
import { ShieldCheck, Target, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [athletes, setAthletes] = useState<AthleteData[]>([]);
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [globalGoals, setGlobalGoals] = useState<GlobalGoals>({
    daily_score_target: 280,
    daily_shots_target: 60,
    weekly_attendance_target: 3
  });

  const isUpdatingVolume = useRef(false);

  const fetchTrainingPlans = useCallback(async (userId: string, role: Role) => {
    const { data } = await supabase.from('training_plans').select('*');
    if (data) {
      if (role === Role.TECNICO) {
        setTrainingPlans(data);
      } else {
        setTrainingPlans(data.filter(p => p.athlete_id === 'all' || p.athlete_id === userId));
      }
    }
  }, []);

  const enrichAthleteData = useCallback(async (profile: any): Promise<AthleteData> => {
    const { data: attendance } = await supabase.from('attendance').select('date').eq('athlete_id', profile.id);
    const { data: history } = await supabase.from('shot_sessions').select('*').eq('athlete_id', profile.id).order('date', { ascending: false });
    
    const attDates = (attendance || []).map(a => a.date);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let currentTodayShots = profile.today_shots || 0;
    const lastUpdate = profile.updated_at ? profile.updated_at.split('T')[0] : '';
    
    if (lastUpdate && lastUpdate !== todayStr && !isUpdatingVolume.current) {
      await supabase.from('profiles').update({ today_shots: 0, updated_at: now.toISOString() }).eq('id', profile.id);
      currentTodayShots = 0;
    }

    const todaySessions = (history || []).filter(h => h.date.startsWith(todayStr));
    const todayBestScore = todaySessions.length > 0 ? Math.max(...todaySessions.map(s => s.score)) : 0;

    return {
      ...profile,
      role: profile.role || Role.ATLETA,
      attendance_history: attDates,
      weekly_attendance: attDates.filter(d => {
        const dObj = new Date(d);
        const day = now.getDay() || 7;
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - day + 1);
        startOfWeek.setHours(0,0,0,0);
        return dObj >= startOfWeek;
      }).length,
      monthly_attendance: attDates.filter(d => {
        const dObj = new Date(d);
        return dObj.getMonth() === now.getMonth() && dObj.getFullYear() === now.getFullYear();
      }).length,
      history: history || [],
      today_shots: currentTodayShots,
      today_best_score: todayBestScore,
      individual_goals: profile.individual_goals || {}
    };
  }, []);

  const fetchFullEquipeData = useCallback(async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles) {
      const enriched = await Promise.all(profiles.map(p => enrichAthleteData(p)));
      setAthletes(enriched);
    }
  }, [enrichAthleteData]);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const athleteData = await enrichAthleteData(profile);
        setUser(athleteData);
        if (profile.role === Role.TECNICO) await fetchFullEquipeData();
        await fetchTrainingPlans(userId, profile.role);
      }
    } catch (err) {
      console.error("Erro ao sincronizar perfil:", err);
    }
  }, [enrichAthleteData, fetchFullEquipeData, fetchTrainingPlans]);

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };
    initSession();
  }, [fetchProfile]);

  const handleAdjustShots = async (amount: number) => {
    if (!user) return;
    isUpdatingVolume.current = true;
    const currentShots = (user as AthleteData).today_shots || 0;
    const newShots = Math.max(0, currentShots + amount);
    setUser(prev => prev ? { ...prev, today_shots: newShots } as AthleteData : null);
    await supabase.from('profiles').update({ today_shots: newShots, updated_at: new Date().toISOString() }).eq('id', user.id);
    setTimeout(() => {
      isUpdatingVolume.current = false;
      if (user.role === Role.TECNICO) fetchFullEquipeData();
    }, 800);
  };

  const completeShotSession = async (totalShots: number, bestScore: number, endScores: any) => {
    if (!user) return;
    isUpdatingVolume.current = true;
    const { error: sessionError } = await supabase.from('shot_sessions').insert({
      athlete_id: user.id,
      date: new Date().toISOString(),
      score: bestScore,
      distance: 18,
      end_scores: endScores
    });
    if (!sessionError) {
      const currentShots = (user as AthleteData).today_shots || 0;
      await supabase.from('profiles').update({ today_shots: currentShots + totalShots, updated_at: new Date().toISOString() }).eq('id', user.id);
      await fetchProfile(user.id);
    }
    isUpdatingVolume.current = false;
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    
    // Se estiver mudando de papel, ativa o overlay de transição
    const isChangingRole = updates.role !== undefined && updates.role !== user.role;
    if (isChangingRole) setIsSwitching(true);

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    
    if (!error) {
      if (isChangingRole) {
        // Delay para garantir que a animação seja apreciada e os dados busquem corretamente
        setTimeout(async () => {
          await fetchProfile(user.id);
          setIsSwitching(false);
        }, 1800);
      } else {
        await fetchProfile(user.id);
      }
    } else {
      setIsSwitching(false);
      throw error;
    }
  };

  const handleUpdateIndividualGoals = async (athleteId: string, goals: any) => {
    const { error } = await supabase.from('profiles').update({ individual_goals: goals }).eq('id', athleteId);
    if (!error && user?.role === Role.TECNICO) fetchFullEquipeData();
  };

  const handleRegisterAttendance = async (athleteId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('attendance').insert({ athlete_id: athleteId, date: today });
    if (!error) {
      await fetchProfile(user!.id);
      if (user?.role === Role.TECNICO) fetchFullEquipeData();
    }
  };

  const handleAddTraining = async (plan: any) => {
    if (!user) return;
    const { error } = await supabase.from('training_plans').insert(plan);
    if (!error) await fetchTrainingPlans(user.id, user.role);
  };

  const handleRemoveTraining = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('training_plans').delete().eq('id', id);
    if (!error) await fetchTrainingPlans(user.id, user.role);
  };

  const handleToggleTraining = async (id: string) => {
    if (!user) return;
    const plan = trainingPlans.find(p => p.id === id);
    if (plan) {
      const todayStr = new Date().toISOString().split('T')[0];
      const isCompletedToday = plan.completed && plan.last_completed_at?.startsWith(todayStr);
      await supabase.from('training_plans').update({ completed: !isCompletedToday, last_completed_at: !isCompletedToday ? new Date().toISOString() : plan.last_completed_at }).eq('id', id);
      await fetchTrainingPlans(user.id, user.role);
    }
  };

  if (loading && !user) return <div className="flex items-center justify-center h-screen bg-acamp-blue"><Logo size="lg" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-acamp-blue flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-500">
          <div className="mb-6 flex justify-center"><Logo size="lg" /></div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const handleAuth = async () => {
              setLoading(true);
              if (authMode === 'signup') {
                const { data: authData, error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
                if (!authError && authData.user) {
                  await supabase.from('profiles').insert({ id: authData.user.id, name, email, role: Role.ATLETA, category: Category.RECURVO, today_shots: 0 });
                  alert("Conta criada!"); setAuthMode('login');
                } else if (authError) alert(authError.message);
              } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message);
              }
              setLoading(false);
            };
            handleAuth();
          }} className="space-y-4">
            {authMode === 'signup' && <input type="text" placeholder="Nome" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" value={name} onChange={e => setName(e.target.value)} required />}
            <input type="email" placeholder="E-mail" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Senha" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full bg-acamp-blue text-white font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">{loading ? '...' : authMode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-8 w-full text-acamp-blue text-[10px] font-black uppercase text-center">{authMode === 'login' ? 'Criar conta' : 'Já sou membro'}</button>
        </div>
      </div>
    );
  }

  const isCoach = user.role === Role.TECNICO;
  const currentAthleteData = user as AthleteData;
  const effectiveGoals = {
    daily_score_target: currentAthleteData.individual_goals?.daily_score || globalGoals.daily_score_target,
    daily_shots_target: currentAthleteData.individual_goals?.daily_shots || globalGoals.daily_shots_target,
    weekly_attendance_target: currentAthleteData.individual_goals?.weekly_attendance || globalGoals.weekly_attendance_target,
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-24 relative">
        {/* Overlay de Transição de Papel */}
        {isSwitching && (
          <div className="fixed inset-0 z-[200] bg-acamp-blue flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
            <div className="bg-white/10 p-12 rounded-[3.5rem] border border-white/20 shadow-2xl flex flex-col items-center gap-8 animate-in zoom-in duration-700">
               <div className="relative">
                  <div className="absolute inset-0 bg-acamp-yellow blur-2xl opacity-20 animate-pulse"></div>
                  {user.role === Role.TECNICO ? <Target size={80} className="text-acamp-yellow" /> : <ShieldCheck size={80} className="text-acamp-yellow" />}
               </div>
               <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">
                    {user.role === Role.TECNICO ? "Ativando Modo Atleta" : "Habilitando Painel Técnico"}
                  </h2>
                  <p className="text-xs text-blue-200 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Sincronizando permissões...
                  </p>
               </div>
            </div>
          </div>
        )}

        <Header user={user} onLogout={() => supabase.auth.signOut()} />
        <main className="max-w-4xl mx-auto px-4 pt-4">
          <Routes>
            <Route path="/" element={isCoach ? <CoachDashboard athletes={athletes} onUpdateGoals={g => setGlobalGoals({...globalGoals, ...g})} onUpdateIndividualGoals={handleUpdateIndividualGoals} onAddTraining={handleAddTraining} currentGoals={globalGoals} /> : <AthleteDashboard user={currentAthleteData} goals={effectiveGoals} progress={{ today_shots: currentAthleteData.today_shots, today_best_score: currentAthleteData.today_best_score, week_attendance: currentAthleteData.weekly_attendance }} onAdjustShots={handleAdjustShots} />} />
            <Route path="/attendance" element={<AttendancePage user={currentAthleteData} athletes={athletes} onCheckIn={handleRegisterAttendance} />} />
            <Route path="/shots" element={<ShotLogger user={currentAthleteData} onComplete={completeShotSession} />} />
            <Route path="/training" element={<TrainingPlansPage user={user} athletes={athletes} plans={trainingPlans} onRemove={handleRemoveTraining} onToggle={handleToggleTraining} onAdd={handleAddTraining} />} />
            <Route path="/goals" element={<GoalsPage user={currentAthleteData} goals={effectiveGoals} progress={{ today_shots: currentAthleteData.today_shots, today_best_score: currentAthleteData.today_best_score, week_attendance: currentAthleteData.weekly_attendance }} />} />
            <Route path="/profile" element={<ProfilePage user={user} onRoleSwitch={r => handleUpdateProfile({ role: r })} onUpdateProfile={handleUpdateProfile} onLogout={() => supabase.auth.signOut()} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Navbar isCoach={isCoach} />
      </div>
    </HashRouter>
  );
};

export default App;
