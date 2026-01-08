
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Profile, Role, Category, GlobalGoals, AthleteData, TrainingPlan, ShotHistoryItem } from './types';
import { MOCK_USER, MOCK_COACH } from './constants';
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

  // Inicialização zerada conforme solicitado
  const [athletes, setAthletes] = useState<AthleteData[]>([
    { 
      id: 'user_1', 
      name: 'Bruno Arqueiro', 
      email: 'bruno@acamp.esp.br', 
      category: Category.RECURVO, 
      role: Role.ATLETA, 
      brotocoin_balance: 0, 
      attendance_history: [], 
      weekly_attendance: 0, 
      monthly_attendance: 0, 
      avg_score: 0, 
      today_shots: 0, 
      today_best_score: 0, 
      history: [], 
      last_redemptions: {} 
    },
    { 
      id: 'user_2', 
      name: 'Ana Souza', 
      email: 'ana@acamp.esp.br', 
      category: Category.RECURVO, 
      role: Role.ATLETA, 
      brotocoin_balance: 0, 
      attendance_history: [], 
      weekly_attendance: 0, 
      monthly_attendance: 0, 
      avg_score: 0, 
      today_shots: 0, 
      today_best_score: 0, 
      history: [], 
      last_redemptions: {} 
    },
    { 
      id: 'user_3', 
      name: 'Carlos Lima', 
      email: 'carlos@acamp.esp.br', 
      category: Category.COMPOSTO, 
      role: Role.ATLETA, 
      brotocoin_balance: 0, 
      attendance_history: [], 
      weekly_attendance: 0, 
      monthly_attendance: 0, 
      avg_score: 0, 
      today_shots: 0, 
      today_best_score: 0, 
      history: [], 
      last_redemptions: {} 
    },
  ]);

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([
    { id: 'tp_1', athlete_id: 'all', title: 'Mobilidade Básica', description: 'Aquecimento padrão para todos os arqueiros antes de iniciar os tiros.', duration: '15 min', intensity: 'Baixa', completed: false, created_at: new Date().toISOString() }
  ]);
  
  const [globalGoals, setGlobalGoals] = useState<GlobalGoals>({
    daily_score_target: 280,
    daily_shots_target: 60,
    weekly_attendance_target: 3
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('acamp_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
    }

    // Lógica de Reset Semanal Automático (Toda Segunda-feira)
    const checkWeeklyReset = () => {
      const today = new Date();
      const isMonday = today.getDay() === 1;
      const lastReset = localStorage.getItem('acamp_last_weekly_reset');
      const todayStr = today.toDateString();

      if (isMonday && lastReset !== todayStr) {
        setAthletes(prev => prev.map(a => ({
          ...a,
          weekly_attendance: 0,
          // Opcional: Zerar tiros do dia também no reset semanal
          today_shots: 0,
          today_best_score: 0
        })));
        localStorage.setItem('acamp_last_weekly_reset', todayStr);
        console.log("Reset semanal executado com sucesso.");
      }
    };

    checkWeeklyReset();
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const baseUser = athletes[0];
    const loggedUser = { ...baseUser, role: Role.ATLETA, brotocoin_balance: 0 };
    setUser(loggedUser);
    localStorage.setItem('acamp_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('acamp_user');
  };

  const handleUpdateProfile = (updates: Partial<Profile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('acamp_user', JSON.stringify(updatedUser));
    
    if (user.role === Role.ATLETA) {
      setAthletes(prev => prev.map(a => a.id === user.id ? { ...a, ...updates } as AthleteData : a));
    }
  };

  const handleRegisterAttendance = (athleteId: string) => {
    const now = new Date().toISOString();
    setAthletes(prev => prev.map(a => {
      if (a.id === athleteId) {
        const todayStr = new Date().toDateString();
        const alreadyPresent = a.attendance_history.some(d => new Date(d).toDateString() === todayStr);
        if (alreadyPresent) return a;

        const newHistory = [...a.attendance_history, now];
        const newBalance = a.brotocoin_balance + 5;

        if (user && user.id === athleteId) {
          const updatedUser = { ...user, brotocoin_balance: newBalance };
          setUser(updatedUser);
          localStorage.setItem('acamp_user', JSON.stringify(updatedUser));
        }

        return { 
          ...a, 
          attendance_history: newHistory, 
          brotocoin_balance: newBalance,
          weekly_attendance: a.weekly_attendance + 1,
          monthly_attendance: a.monthly_attendance + 1
        };
      }
      return a;
    }));
  };

  const awardCoins = (athleteId: string | 'all', amount: number) => {
    setAthletes(prev => {
      const updated = prev.map(a => {
        if (athleteId === 'all' || a.id === athleteId) {
          return { ...a, brotocoin_balance: Math.max(0, a.brotocoin_balance + amount) };
        }
        return a;
      });
      
      if (user && (athleteId === 'all' || user.id === athleteId)) {
        const updatedUserInList = updated.find(a => a.id === user.id);
        if (updatedUserInList) {
          const newProfile = { ...user, brotocoin_balance: updatedUserInList.brotocoin_balance };
          setUser(newProfile);
          localStorage.setItem('acamp_user', JSON.stringify(newProfile));
        }
      }
      return updated;
    });
  };

  const handleRedeemGoal = (goalId: string, amount: number) => {
    if (!user) return;
    const now = new Date().toISOString();
    setAthletes(prev => prev.map(a => {
      if (a.id === user.id) {
        const updatedRedemptions = { ...(a.last_redemptions || {}), [goalId]: now };
        const newBalance = a.brotocoin_balance + amount;
        
        const updatedProfile = { ...user, brotocoin_balance: newBalance };
        setUser(updatedProfile);
        localStorage.setItem('acamp_user', JSON.stringify(updatedProfile));
        
        return { ...a, brotocoin_balance: newBalance, last_redemptions: updatedRedemptions };
      }
      return a;
    }));
  };

  const handleAdjustShots = (amount: number) => {
    if (!user || user.role !== Role.ATLETA) return;
    setAthletes(prev => prev.map(a => {
      if (a.id === user.id) {
        const newVal = Math.max(0, a.today_shots + amount);
        return { ...a, today_shots: newVal };
      }
      return a;
    }));
  };

  const toggleTrainingPlan = (planId: string) => {
    const today = new Date().toLocaleDateString();
    setTrainingPlans(prev => prev.map(p => {
      if (p.id === planId) {
        const isCurrentlyCompleted = p.completed && p.last_completed_at === today;
        if (!isCurrentlyCompleted) {
          if (p.athlete_id === 'all') {
            awardCoins(user?.id || 'all', 5);
          }
        }
        return { 
          ...p, 
          completed: !isCurrentlyCompleted, 
          last_completed_at: !isCurrentlyCompleted ? today : p.last_completed_at 
        };
      }
      return p;
    }));
  };

  const updateIndividualGoals = (athleteId: string, goals: AthleteData['individual_goals']) => {
    setAthletes(prev => prev.map(a => a.id === athleteId ? { ...a, individual_goals: goals } : a));
  };

  const addTrainingPlan = (plan: Omit<TrainingPlan, 'id' | 'completed' | 'created_at'>) => {
    const newPlan: TrainingPlan = {
      ...plan,
      id: `tp_${Math.random().toString(36).substr(2, 9)}`,
      completed: false,
      created_at: new Date().toISOString()
    };
    setTrainingPlans(prev => [newPlan, ...prev]);
  };

  const removeTrainingPlan = (planId: string) => {
    setTrainingPlans(prev => prev.filter(p => p.id !== planId));
  };

  const updateGlobalGoals = (newGoals: Partial<GlobalGoals>) => {
    setGlobalGoals(prev => ({ ...prev, ...newGoals }));
  };

  const completeShotSession = (totalShots: number, bestScore: number, endScores: Record<number, (string | number)[]>) => {
    if (!user) return;
    const newHistoryItem: ShotHistoryItem = {
      id: Math.random().toString(),
      date: new Date().toISOString(), // Usar ISO para facilitar filtros de semana
      score: bestScore,
      distance: 18,
      end_scores: endScores
    };

    setAthletes(prev => prev.map(a => {
      if (a.id === user.id) {
        return { 
          ...a, 
          today_shots: a.today_shots + totalShots,
          today_best_score: Math.max(a.today_best_score, bestScore),
          history: [newHistoryItem, ...a.history].slice(0, 50) // Aumentar buffer de histórico
        };
      }
      return a;
    }));
    awardCoins(user.id, 15);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-acamp-blue text-acamp-yellow">
        <Logo size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-acamp-blue flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] p-12 w-full max-w-md shadow-2xl text-center relative overflow-hidden">
          <div className="mb-8">
             <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-black text-acamp-blue mb-4 tracking-tighter">Foco & Precisão</h1>
          <p className="text-gray-400 mb-12 text-sm font-medium leading-relaxed px-6">
            Gestão completa para arqueiros e técnicos da maior equipe de tiro com arco.
          </p>
          <div className="space-y-4">
            <button 
              onClick={handleLogin} 
              className="w-full bg-acamp-blue text-white font-black py-5 px-6 rounded-3xl flex items-center justify-center gap-4 hover:bg-acamp-dark transition-all active:scale-95 shadow-xl"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 brightness-200" alt="Google" />
              Entrar como Atleta
            </button>
          </div>
          <div className="mt-10 text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">
            Equipe ACAMP - Desde 2021
          </div>
        </div>
      </div>
    );
  }

  const isCoach = user.role === Role.TECNICO;
  const currentAthleteData = athletes.find(a => a.id === user.id) || (athletes[0]);
  
  const effectiveGoals = {
    daily_score_target: currentAthleteData.individual_goals?.daily_score || globalGoals.daily_score_target,
    daily_shots_target: currentAthleteData.individual_goals?.daily_shots || globalGoals.daily_shots_target,
    weekly_attendance_target: currentAthleteData.individual_goals?.weekly_attendance || globalGoals.weekly_attendance_target,
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 pb-24">
        <Header user={user} onLogout={handleLogout} />
        <main className="max-w-4xl mx-auto px-4 pt-4">
          <Routes>
            <Route path="/" element={
              isCoach ? 
              <CoachDashboard 
                athletes={athletes}
                onUpdateGoals={updateGlobalGoals} 
                onUpdateIndividualGoals={updateIndividualGoals}
                onAwardCoins={awardCoins} 
                onAddTraining={addTrainingPlan}
                currentGoals={globalGoals} 
              /> : 
              <AthleteDashboard 
                user={currentAthleteData} 
                goals={effectiveGoals} 
                progress={{
                  today_shots: currentAthleteData.today_shots,
                  today_best_score: currentAthleteData.today_best_score,
                  week_attendance: currentAthleteData.weekly_attendance
                }} 
                onAdjustShots={handleAdjustShots}
              />
            } />
            <Route path="/attendance" element={<AttendancePage user={currentAthleteData} onCheckIn={handleRegisterAttendance} />} />
            <Route path="/shots" element={<ShotLogger user={currentAthleteData} onComplete={completeShotSession} />} />
            <Route path="/training" element={<TrainingPlansPage user={user} plans={trainingPlans} onToggle={toggleTrainingPlan} onRemove={isCoach ? removeTrainingPlan : undefined} />} />
            <Route path="/goals" element={<GoalsPage user={currentAthleteData} goals={effectiveGoals} progress={{
              today_shots: currentAthleteData.today_shots,
              today_best_score: currentAthleteData.today_best_score,
              week_attendance: currentAthleteData.weekly_attendance
            }} onRedeem={handleRedeemGoal} />} />
            <Route path="/profile" element={<ProfilePage user={user} onRoleSwitch={(role) => setUser({...user, role})} onUpdateProfile={handleUpdateProfile} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Navbar isCoach={isCoach} />
      </div>
    </HashRouter>
  );
};

export default App;
