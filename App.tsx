
import React, { useState, useEffect } from 'react';
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

const App: React.FC = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const athleteData = await enrichAthleteData(profile);
        setUser(athleteData);
        if (profile.role === Role.TECNICO) fetchFullEquipeData();
        fetchTrainingPlans(userId);
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    }
  };

  const enrichAthleteData = async (profile: any): Promise<AthleteData> => {
    const { data: attendance } = await supabase.from('attendance').select('date').eq('athlete_id', profile.id);
    const { data: history } = await supabase.from('shot_sessions').select('*').eq('athlete_id', profile.id).order('date', { ascending: false });
    
    const attDates = (attendance || []).map(a => a.date);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const todaySessions = (history || []).filter(h => h.date.startsWith(todayStr));
    const todayBestScore = todaySessions.length > 0 ? Math.max(...todaySessions.map(s => s.score)) : 0;

    const lastRedemptions = typeof profile.last_redemptions === 'string' 
      ? JSON.parse(profile.last_redemptions) 
      : (profile.last_redemptions || {});

    return {
      ...profile,
      attendance_history: attDates,
      weekly_attendance: attDates.filter(d => isThisWeek(new Date(d))).length,
      monthly_attendance: attDates.filter(d => new Date(d).getMonth() === now.getMonth()).length,
      history: history || [],
      today_shots: profile.today_shots || 0,
      today_best_score: todayBestScore,
      last_redemptions: lastRedemptions
    };
  };

  const fetchFullEquipeData = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles) {
      const enriched = await Promise.all(profiles.map(p => enrichAthleteData(p)));
      setAthletes(enriched);
    }
  };

  const fetchTrainingPlans = async (userId: string) => {
    const { data } = await supabase
      .from('training_plans')
      .select('*')
      .or(`athlete_id.eq.all,athlete_id.eq.${userId}`);
    if (data) setTrainingPlans(data);
  };

  const isThisWeek = (date: Date) => {
    const now = new Date();
    const day = now.getDay() || 7;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - day + 1);
    startOfWeek.setHours(0,0,0,0);
    return date >= startOfWeek;
  };

  const handleAdjustShots = async (amount: number) => {
    if (!user) return;
    const currentShots = (user as AthleteData).today_shots || 0;
    const newShots = Math.max(0, currentShots + amount);
    const backupUser = { ...user };

    setUser(prev => prev ? { ...prev, today_shots: newShots } as AthleteData : null);

    const { error } = await supabase
      .from('profiles')
      .update({ today_shots: newShots })
      .eq('id', user.id);

    if (error) {
      setUser(backupUser);
      alert("Erro ao sincronizar disparos.");
    } else if (user.role === Role.TECNICO) {
      fetchFullEquipeData();
    }
  };

  const awardCoins = async (athleteId: string | 'all', amount: number) => {
    const targetIds = athleteId === 'all' ? athletes.map(a => a.id) : [athleteId];
    
    for (const id of targetIds) {
      const { data: profile } = await supabase.from('profiles').select('brotocoin_balance').eq('id', id).single();
      if (profile) {
        const newBalance = Math.max(0, (profile.brotocoin_balance || 0) + amount);
        await supabase.from('profiles').update({ brotocoin_balance: newBalance }).eq('id', id);
      }
    }
    
    if (user) await fetchProfile(user.id);
    if (user?.role === Role.TECNICO) fetchFullEquipeData();
  };

  const handleRedeemGoal = async (goalId: string, amount: number) => {
    if (!user) return;
    const now = new Date().toISOString();
    const currentRedemptions = (user as AthleteData).last_redemptions || {};
    
    if (currentRedemptions[goalId] && new Date(currentRedemptions[goalId]).toDateString() === new Date().toDateString() && goalId !== 'attendance_goal') {
      alert("Você já resgatou este prêmio hoje!");
      return;
    }

    const updatedRedemptions = { ...currentRedemptions, [goalId]: now };
    const newBalance = (user.brotocoin_balance || 0) + amount;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        brotocoin_balance: newBalance,
        last_redemptions: updatedRedemptions 
      })
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? { ...prev, brotocoin_balance: newBalance, last_redemptions: updatedRedemptions } as AthleteData : null);
      alert(`🎉 Parabéns! Você ganhou ${amount} BORTOCOINS!`);
    }
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (!error) {
      const updatedUser = { ...user, ...updates } as AthleteData;
      setUser(updatedUser);
      if (updates.role === Role.TECNICO) {
        await fetchFullEquipeData();
      }
    } else {
      throw error;
    }
  };

  const handleRegisterAttendance = async (athleteId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await supabase.from('attendance')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('date', today)
      .single();

    if (!existing) {
      const { error } = await supabase.from('attendance').insert({ athlete_id: athleteId, date: today });
      if (!error) {
        await awardCoins(athleteId, 5);
      }
    }
  };

  const completeShotSession = async (totalShots: number, bestScore: number, endScores: any) => {
    if (!user) return;
    const { error } = await supabase.from('shot_sessions').insert({
      athlete_id: user.id,
      date: new Date().toISOString(),
      score: bestScore,
      distance: 18,
      end_scores: endScores
    });
    
    if (!error) {
      const currentShots = (user as AthleteData).today_shots || 0;
      const newTotalShots = currentShots + totalShots;
      await supabase.from('profiles').update({ today_shots: newTotalShots }).eq('id', user.id);
      setUser(prev => prev ? { ...prev, today_shots: newTotalShots } as AthleteData : null);
      await awardCoins(user.id, 15);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-acamp-blue">
        <Logo size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-acamp-blue flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
          <div className="mb-6 flex justify-center">
             <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-black text-acamp-blue mb-2 text-center tracking-tighter">
            {authMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <form onSubmit={(e) => {
            e.preventDefault();
            const handleAuth = async () => {
              setLoading(true);
              if (authMode === 'signup') {
                const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
                if (error) alert(error.message); else { alert("Cadastro realizado!"); setAuthMode('login'); }
              } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message);
              }
              setLoading(false);
            };
            handleAuth();
          }} className="space-y-4">
            {authMode === 'signup' && (
              <input type="text" placeholder="Nome Completo" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue" value={name} onChange={e => setName(e.target.value)} required />
            )}
            <input type="email" placeholder="E-mail" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Senha" className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full bg-acamp-blue text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-xs">
              {loading ? 'Carregando...' : authMode === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-acamp-blue text-[10px] font-black uppercase tracking-widest hover:underline">
              {authMode === 'login' ? 'Ainda não tem conta? Cadastre-se' : 'Já tem uma conta? Faça Login'}
            </button>
          </div>
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
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header user={user} onLogout={() => supabase.auth.signOut()} />
        <main className="max-w-4xl mx-auto px-4 pt-4">
          <Routes>
            <Route path="/" element={isCoach ? <CoachDashboard athletes={athletes} onUpdateGoals={g => setGlobalGoals({...globalGoals, ...g})} onUpdateIndividualGoals={(id, g) => supabase.from('profiles').update({ individual_goals: g }).eq('id', id).then(() => fetchFullEquipeData())} onAwardCoins={awardCoins} onAddTraining={p => supabase.from('training_plans').insert(p).then(() => fetchTrainingPlans(user.id))} currentGoals={globalGoals} /> : <AthleteDashboard user={currentAthleteData} goals={effectiveGoals} progress={{ today_shots: currentAthleteData.today_shots, today_best_score: currentAthleteData.today_best_score, week_attendance: currentAthleteData.weekly_attendance }} onAdjustShots={handleAdjustShots} />} />
            <Route path="/attendance" element={<AttendancePage user={currentAthleteData} onCheckIn={handleRegisterAttendance} />} />
            <Route path="/shots" element={<ShotLogger user={currentAthleteData} onComplete={completeShotSession} />} />
            <Route path="/training" element={<TrainingPlansPage user={user} plans={trainingPlans} onRemove={id => supabase.from('training_plans').delete().eq('id', id).then(() => fetchTrainingPlans(user.id))} />} />
            <Route path="/goals" element={<GoalsPage user={currentAthleteData} goals={effectiveGoals} progress={{ today_shots: currentAthleteData.today_shots, today_best_score: currentAthleteData.today_best_score, week_attendance: currentAthleteData.weekly_attendance }} onRedeem={handleRedeemGoal} />} />
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
