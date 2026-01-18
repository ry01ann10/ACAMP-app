
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ShieldCheck, Target, Loader2, Sparkles } from 'lucide-react';

// Componente Wrapper para gerenciar transições de rota
const AnimatedRoutes: React.FC<{
  user: Profile;
  athletes: AthleteData[];
  trainingPlans: TrainingPlan[];
  globalGoals: GlobalGoals;
  handleUpdateGoals: (goals: Partial<GlobalGoals>) => void;
  handleUpdateIndividualGoals: (id: string, goals: any) => void;
  handleAddTraining: (plan: any) => void;
  handleRemoveTraining: (id: string) => void;
  handleToggleTraining: (id: string) => void;
  handleAdjustShots: (amount: number) => void;
  completeShotSession: (s: number, b: number, e: any) => void;
  handleRegisterAttendance: (id: string) => void;
  handleUpdateProfile: (updates: Partial<Profile>) => Promise<void>;
}> = (props) => {
  const location = useLocation();
  const isCoach = props.user.role === Role.TECNICO;
  const currentAthleteData = props.user as AthleteData;
  const effectiveGoals = {
    daily_score_target: currentAthleteData.individual_goals?.daily_score || props.globalGoals.daily_score_target,
    daily_shots_target: currentAthleteData.individual_goals?.daily_shots || props.globalGoals.daily_shots_target,
    weekly_attendance_target: currentAthleteData.individual_goals?.weekly_attendance || props.globalGoals.weekly_attendance_target,
  };

  // Scroll to top suave em cada mudança de rota
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition-enter">
      <Routes location={location}>
        <Route 
          path="/" 
          element={isCoach ? 
            <CoachDashboard 
              athletes={props.athletes} 
              onUpdateGoals={props.handleUpdateGoals} 
              onUpdateIndividualGoals={props.handleUpdateIndividualGoals} 
              onAddTraining={props.handleAddTraining} 
              currentGoals={props.globalGoals} 
            /> : 
            <AthleteDashboard 
              user={currentAthleteData} 
              goals={effectiveGoals} 
              progress={{ 
                today_shots: currentAthleteData.today_shots, 
                today_best_score: currentAthleteData.today_best_score, 
                week_attendance: currentAthleteData.weekly_attendance 
              }} 
              onAdjustShots={props.handleAdjustShots} 
            />} 
        />
        <Route path="/attendance" element={<AttendancePage user={currentAthleteData} athletes={props.athletes} onCheckIn={props.handleRegisterAttendance} />} />
        <Route path="/shots" element={<ShotLogger user={currentAthleteData} onComplete={props.completeShotSession} />} />
        <Route path="/training" element={<TrainingPlansPage user={props.user} athletes={props.athletes} plans={props.trainingPlans} onRemove={props.handleRemoveTraining} onToggle={props.handleToggleTraining} onAdd={props.handleAddTraining} />} />
        <Route path="/goals" element={<GoalsPage user={currentAthleteData} goals={effectiveGoals} progress={{ today_shots: currentAthleteData.today_shots, today_best_score: currentAthleteData.today_best_score, week_attendance: currentAthleteData.weekly_attendance }} />} />
        <Route path="/profile" element={<ProfilePage user={props.user} onRoleSwitch={r => props.handleUpdateProfile({ role: r })} onUpdateProfile={props.handleUpdateProfile} onLogout={() => supabase.auth.signOut()} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
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
    const isChangingRole = updates.role !== undefined && updates.role !== user.role;
    if (isChangingRole) setIsSwitching(true);

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
      if (isChangingRole) {
        setTimeout(async () => {
          await fetchProfile(user.id);
          setIsSwitching(false);
        }, 1200);
      } else {
        await fetchProfile(user.id);
      }
    } else {
      setIsSwitching(false);
      throw error;
    }
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-acamp-blue text-white gap-4">
        <Logo size="lg" className="animate-pulse" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Carregando Universo ACAMP...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-acamp-blue flex flex-col items-center justify-center p-6 transition-all duration-700">
        <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in duration-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-acamp-yellow"></div>
          <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
          
          <div className="flex p-1 bg-gray-50 rounded-2xl mb-8">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'login' ? 'bg-white text-acamp-blue shadow-sm' : 'text-gray-400'}`}>Login</button>
            <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${authMode === 'signup' ? 'bg-white text-acamp-blue shadow-sm' : 'text-gray-400'}`}>Cadastro</button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const handleAuth = async () => {
              setLoading(true);
              try {
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
              } catch (err) {
                console.error(err);
              } finally {
                setLoading(false);
              }
            };
            handleAuth();
          }} className="space-y-4">
            {authMode === 'signup' && <div className="group"><input type="text" placeholder="Nome Completo" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-acamp-blue transition-all" value={name} onChange={e => setName(e.target.value)} required /></div>}
            <div className="group"><input type="email" placeholder="E-mail" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-acamp-blue transition-all" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="group"><input type="password" placeholder="Sua Senha" className="w-full bg-gray-50 p-4 rounded-2xl font-bold outline-none border border-transparent focus:border-acamp-blue transition-all" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            
            <button type="submit" disabled={loading} className="w-full bg-acamp-blue text-white font-black py-5 rounded-[2rem] uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'login' ? 'Entrar no Clube' : 'Criar Perfil')}
            </button>
          </form>
        </div>
        <p className="mt-8 text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">ACAMP Archery © 2024</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-24 relative overflow-x-hidden">
        {isSwitching && (
          <div className="fixed inset-0 z-[200] bg-acamp-blue/60 backdrop-blur-3xl flex flex-col items-center justify-center text-white animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-8 animate-in zoom-in slide-in-from-bottom-8 duration-700">
               <div className="relative p-12 bg-white/10 rounded-[4rem] border border-white/20 shadow-2xl">
                  <div className="absolute inset-0 bg-acamp-yellow blur-3xl opacity-10 animate-pulse"></div>
                  {user.role === Role.TECNICO ? <Target size={100} className="text-acamp-yellow relative z-10" /> : <ShieldCheck size={100} className="text-acamp-yellow relative z-10" />}
               </div>
               <div className="text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 flex items-center justify-center gap-3">
                    <Sparkles size={24} className="text-acamp-yellow" />
                    {user.role === Role.TECNICO ? "Modo Atleta Ativo" : "Modo Técnico Ativo"}
                  </h2>
                  <p className="text-[10px] text-blue-100 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Loader2 size={12} className="animate-spin" /> Preparando interface...
                  </p>
               </div>
            </div>
          </div>
        )}

        <Header user={user} onLogout={() => supabase.auth.signOut()} />
        <main className="max-w-4xl mx-auto px-4 pt-4">
          <AnimatedRoutes 
            user={user}
            athletes={athletes}
            trainingPlans={trainingPlans}
            globalGoals={globalGoals}
            handleUpdateGoals={(g) => setGlobalGoals(prev => ({...prev, ...g}))}
            handleUpdateIndividualGoals={(id, g) => {
              supabase.from('profiles').update({ individual_goals: g }).eq('id', id).then(() => fetchFullEquipeData());
            }}
            handleAddTraining={p => {
              const plans = Array.isArray(p) ? p : [p];
              supabase.from('training_plans').insert(plans).then(() => fetchTrainingPlans(user.id, user.role));
            }}
            handleRemoveTraining={id => supabase.from('training_plans').delete().eq('id', id).then(() => fetchTrainingPlans(user.id, user.role))}
            handleToggleTraining={id => {
               const plan = trainingPlans.find(p => p.id === id);
               if(plan){
                 const tStr = new Date().toISOString().split('T')[0];
                 const isDone = plan.completed && plan.last_completed_at?.startsWith(tStr);
                 supabase.from('training_plans').update({ completed: !isDone, last_completed_at: !isDone ? new Date().toISOString() : plan.last_completed_at }).eq('id', id).then(() => fetchTrainingPlans(user.id, user.role));
               }
            }}
            handleAdjustShots={handleAdjustShots}
            completeShotSession={completeShotSession}
            handleRegisterAttendance={id => {
              const today = new Date().toISOString().split('T')[0];
              supabase.from('attendance').insert({ athlete_id: id, date: today }).then(() => {
                fetchProfile(user.id);
                if(user.role === Role.TECNICO) fetchFullEquipeData();
              });
            }}
            handleUpdateProfile={handleUpdateProfile}
          />
        </main>
        <Navbar isCoach={user.role === Role.TECNICO} />
      </div>
    </HashRouter>
  );
};

export default App;
