
import React, { useState, useRef } from 'react';
import { Profile, Role, Category } from '../types';
import { ICONS } from '../constants';
import { Camera, Pencil, Lock, CheckCircle2, Loader2, ShieldCheck, User as UserIcon, X, ChevronRight } from 'lucide-react';

interface ProfilePageProps {
  user: Profile;
  onRoleSwitch: (role: Role) => Promise<void>;
  onUpdateProfile?: (updates: Partial<Profile>) => Promise<void>;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onRoleSwitch, onUpdateProfile, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name || '',
    category: user.category,
    avatar_url: user.avatar_url || "https://picsum.photos/200/200"
  });

  const handleSave = async () => {
    if (onUpdateProfile) {
      setIsUpdating(true);
      try {
        await onUpdateProfile(formData);
        showSuccess("Perfil atualizado!");
      } catch (err) {
        alert("Erro ao salvar.");
      } finally {
        setIsUpdating(false);
        setIsEditing(false);
      }
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSwitchRole = async (role: Role) => {
    if (role === user.role) return;
    
    if (role === Role.TECNICO) {
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError(false);
    } else {
      setIsUpdating(true);
      try {
        await onRoleSwitch(role);
      } catch (err) {
        alert("Erro ao trocar papel.");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const validatePassword = async () => {
    if (password === '7418') {
      setIsUpdating(true);
      setShowPasswordModal(false);
      try {
        await onRoleSwitch(Role.TECNICO);
      } catch (err) {
        alert("Erro na ativação.");
        setIsUpdating(false);
      }
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 800);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Toast de Sucesso */}
      {successMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-green-500/30 backdrop-blur-md">
            <CheckCircle2 size={18} />
            <span className="text-xs font-black uppercase tracking-widest">{successMsg}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden transition-all hover:shadow-md">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-acamp-blue to-acamp-dark opacity-5"></div>
        
        <div className="relative inline-block mb-6 mt-4 group">
          <div className="relative">
            <img 
              src={isEditing ? formData.avatar_url : (user.avatar_url || "https://picsum.photos/200/200")} 
              alt={user.name} 
              className={`w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transition-all duration-300 ${isEditing ? 'brightness-75 scale-105 ring-4 ring-acamp-yellow ring-offset-2' : ''}`}
            />
            {isEditing && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white transition-opacity group-hover:bg-black/40"
              >
                <Camera size={24} />
              </button>
            )}
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setFormData({ ...formData, avatar_url: reader.result as string });
              reader.readAsDataURL(file);
            }
          }} />
        </div>
        
        {isEditing ? (
          <div className="space-y-5 max-w-sm mx-auto text-left">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Nome do Arqueiro</label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-500">Cancelar</button>
              <button onClick={handleSave} disabled={isUpdating} className="flex-1 py-4 bg-acamp-blue text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-acamp-blue/20">
                {isUpdating ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Salvar Alterações"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{user.name || 'Arqueiro ACAMP'}</h2>
              {user.role === Role.TECNICO && <ShieldCheck size={20} className="text-acamp-blue" />}
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">{user.email}</p>
            <div className="flex justify-center gap-3">
              <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.role === Role.TECNICO ? 'bg-acamp-blue text-white border-acamp-dark' : 'bg-acamp-yellow text-acamp-blue border-yellow-500'}`}>
                {user.role}
              </span>
              <span className="bg-white text-gray-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100">
                {user.category}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SELETOR DE FUNÇÃO REDESENHADO */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest">Configuração de Perfil</h3>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Alterne entre modos de acesso</p>
           </div>
           <ShieldCheck size={20} className="text-gray-200" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 p-2 bg-gray-50 rounded-[2.2rem] border border-gray-100 relative">
          {isUpdating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-20 rounded-[2.2rem] flex items-center justify-center">
              <Loader2 className="animate-spin text-acamp-blue" />
            </div>
          )}
          
          <button 
            onClick={() => handleSwitchRole(Role.ATLETA)}
            className={`relative py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${user.role === Role.ATLETA ? 'bg-white text-acamp-blue shadow-xl border border-acamp-blue/5 scale-[1.03] z-10' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
          >
            <UserIcon size={18} />
            Atleta
            {user.role === Role.ATLETA && <div className="absolute bottom-2 w-1 h-1 bg-acamp-blue rounded-full"></div>}
          </button>
          
          <button 
            onClick={() => handleSwitchRole(Role.TECNICO)}
            className={`relative py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-2 ${user.role === Role.TECNICO ? 'bg-white text-acamp-blue shadow-xl border-acamp-blue/10 scale-[1.03] ring-2 ring-acamp-yellow/20 z-10' : 'text-gray-400 opacity-60 hover:opacity-100'}`}
          >
            <ShieldCheck size={18} />
            Técnico
            {user.role === Role.TECNICO && <div className="absolute bottom-2 w-1 h-1 bg-acamp-blue rounded-full"></div>}
          </button>
        </div>
      </div>

      <div className="px-2 space-y-3">
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border border-gray-100 group transition-all hover:border-acamp-blue/30 active:scale-[0.98]">
             <div className="flex items-center gap-4">
               <div className="bg-gray-50 p-3 rounded-2xl group-hover:bg-acamp-light group-hover:text-acamp-blue transition-all"><Pencil size={20} /></div>
               <div className="text-left">
                  <span className="text-sm font-black text-gray-700 block uppercase tracking-tight">Editar Perfil</span>
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Alterar nome e foto</span>
               </div>
             </div>
             <ChevronRight className="text-gray-200 group-hover:text-acamp-blue transition-colors" size={20} />
          </button>
        )}
        <button onClick={onLogout} className="w-full bg-red-50 text-red-500 py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-[10px] border border-red-100/50 hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]">Encerrar Sessão</button>
      </div>

      {/* PIN MODAL ESTILIZADO */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-acamp-blue/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className={`bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl transition-all ${passwordError ? 'animate-shake border-2 border-red-500' : ''}`}>
              <div className="flex justify-center mb-8">
                 <div className="bg-acamp-light w-20 h-20 rounded-[2rem] flex items-center justify-center text-acamp-blue shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <Lock size={36} className="relative z-10" />
                 </div>
              </div>
              <div className="text-center mb-10">
                 <h3 className="text-2xl font-black text-acamp-blue uppercase tracking-tighter">Acesso Restrito</h3>
                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Digite o PIN Técnico ACAMP</p>
              </div>
              <input 
                type="password" 
                placeholder="••••" 
                className={`w-full bg-gray-50 border-2 rounded-2xl p-5 text-center font-black text-4xl tracking-[0.6em] outline-none transition-all ${passwordError ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-100 focus:border-acamp-blue'}`}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validatePassword()}
                autoFocus
                maxLength={4}
              />
              <div className="flex gap-4 pt-10">
                <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-gray-600">Cancelar</button>
                <button onClick={validatePassword} className="flex-1 bg-acamp-blue text-white py-5 rounded-2xl font-black text-[10px] uppercase shadow-xl shadow-acamp-blue/20 tracking-widest active:scale-95 transition-all">Confirmar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
