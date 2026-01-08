
import React from 'react';
import { 
  Trophy, 
  Calendar, 
  Target, 
  Dumbbell, 
  Users, 
  Coins, 
  User, 
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Plus,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';

export const ICONS = {
  Dashboard: <LayoutDashboard size={24} />,
  Trophy: <Trophy size={24} />,
  Calendar: <Calendar size={24} />,
  Target: <Target size={24} />,
  Dumbbell: <Dumbbell size={24} />,
  Users: <Users size={24} />,
  Coins: <Coins size={24} />,
  User: <User size={24} />,
  LogOut: <LogOut size={24} />,
  ChevronRight: <ChevronRight size={20} />,
  Plus: <Plus size={24} />,
  Check: <CheckCircle2 size={24} />,
  Trend: <TrendingUp size={24} />,
  Award: <Award size={24} />,
};

export const MOCK_USER: any = {
  id: 'user_1',
  name: 'Bruno Arqueiro',
  email: 'bruno@acamp.esp.br',
  category: 'Recurvo',
  role: 'Atleta',
  brotocoin_balance: 0,
  avatar_url: 'https://picsum.photos/200/200'
};

export const MOCK_COACH: any = {
  id: 'coach_1',
  name: 'Treinador Silva',
  email: 'silva@acamp.esp.br',
  category: 'Composto',
  role: 'Técnico',
  brotocoin_balance: 0,
  avatar_url: 'https://picsum.photos/200/200?random=1'
};
