
import React, { useState, useRef } from 'react';
import { Profile, Role, Category } from '../types';
import { ICONS } from '../constants';
import { Camera, Pencil, Lock } from 'lucide-react';

interface ProfilePageProps {
  user: Profile;
  onRoleSwitch: (role: Role) => void;
  onUpdateProfile?: (updates: Partial<Profile>) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onRoleSwitch, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    category: user.category,
    avatar_url: user.avatar_url || "https://picsum.photos/200/200"
  });

  const handleSave = () => {
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setIsEditing(false);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Escolha uma foto de até 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchRole = (role: Role) => {
    if (role === Role.TECNICO && user.role !== Role.TECNICO) {
      setShowPasswordModal(true);
      setPassword('');
      setPasswordError(false);
    } else {
      onRoleSwitch(role);
    }
  };

  const validatePassword = () => {
    if (password === '7418') {
      onRoleSwitch(Role.TECNICO);
      setShowPasswordModal(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-acamp-blue to-acamp-dark opacity-5"></div>
        
        <div className="relative inline-block mb-6 mt-4 group">
          <div className="relative">
            <img 
              src={isEditing ? formData.avatar_url : (user.avatar_url || "https://picsum.photos/200/200")} 
              alt={user.name} 
              className={`w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover transition-all duration-300 ${isEditing ? 'brightness-75 scale-105' : ''}`}
            />
            
            {isEditing && (
              <button 
                onClick={triggerFileSelect}
                className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full text-white transition-opacity group-hover:bg-black/40"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Alterar</span>
                </div>
              </button>
            )}
          </div>

          {!isEditing && (
            <div className="absolute -bottom-1 -right-1 bg-acamp-yellow text-acamp-blue p-2 rounded-full border-4 border-white shadow-md">
              <span className="scale-75">{user.category === Category.RECURVO ? ICONS.Target : ICONS.Trend}</span>
            </div>
          )}

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        {isEditing ? (
          <div className="space-y-5 max-w-sm mx-auto text-left animate-in slide-in-from-bottom-4 duration-400">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Seu Nome</label>
              <input 
                type="text" 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-acamp-blue transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Como quer ser chamado?"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block tracking-widest">Categoria de Arco</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setFormData({ ...formData, category: Category.RECURVO })}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.category === Category.RECURVO ? 'bg-acamp-blue border-acamp-blue text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  Recurvo
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, category: Category.COMPOSTO })}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.category === Category.COMPOSTO ? 'bg-acamp-blue border-acamp-blue text-white shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                >
                  Composto
                </button>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user.name, category: user.category, avatar_url: user.avatar_url || "https://picsum.photos/200/200" });
                }}
                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-acamp-yellow text-acamp-blue shadow-xl active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-6 font-medium">{user.email}</p>
            
            <div className="flex justify-center gap-3">
              <div className="bg-acamp-blue text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {user.role}
              </div>
              <div className="bg-white text-acamp-blue px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-100 shadow-sm">
                {user.category}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-gray-400 group-hover:bg-acamp-light group-hover:text-acamp-blue transition-all">
                  <Pencil size={20} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-black uppercase tracking-widest text-gray-700 block">Editar Dados</span>
                  <span className="text-[10px] text-gray-400 font-bold">Foto, nome e categoria</span>
                </div>
              </div>
              <div className="text-gray-200 group-hover:text-acamp-blue transition-colors">{ICONS.ChevronRight}</div>
            </button>
          )}
          
          <div className="p-6 bg-gray-50/30">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1 h-1 bg-acamp-yellow rounded-full"></span>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Painel de Controle</p>
            </div>
            <div className="flex p-1.5 bg-white border border-gray-100 rounded-[1.25rem] shadow-sm">
              <button 
                onClick={() => onRoleSwitch(Role.ATLETA)}
                className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.role === Role.ATLETA ? 'bg-acamp-blue text-white shadow-lg scale-105 z-10' : 'text-gray-300 hover:text-gray-500'}`}
              >
                Sou Atleta
              </button>
              <button 
                onClick={() => handleSwitchRole(Role.TECNICO)}
                className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${user.role === Role.TECNICO ? 'bg-acamp-blue text-white shadow-lg scale-105 z-10' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {user.role !== Role.TECNICO && <Lock size={12} className="opacity-50" />}
                Acesso Técnico
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-2">
        <button className="w-full bg-red-50 text-red-500 py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95 border border-red-100/50">
          <div className="scale-75">{ICONS.LogOut}</div>
          Sair da Conta
        </button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-acamp-blue/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-acamp-light w-16 h-16 rounded-3xl flex items-center justify-center text-acamp-blue mx-auto mb-6">
                 <Lock size={32} />
              </div>
              <h3 className="text-xl font-black text-acamp-blue text-center mb-2 tracking-tighter">Área Restrita</h3>
              <p className="text-gray-400 text-center text-sm mb-8 font-medium">Insira a senha de autorização para habilitar as funções de técnico.</p>
              
              <div className="space-y-4">
                 <input 
                    type="password" 
                    placeholder="Senha de 4 dígitos" 
                    className={`w-full bg-gray-50 border-2 rounded-2xl p-4 text-center font-black text-xl tracking-[0.5em] outline-none transition-all ${passwordError ? 'border-red-400 bg-red-50 text-red-500 shake' : 'border-gray-100 focus:border-acamp-blue'}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    maxLength={4}
                 />
                 
                 {passwordError && (
                   <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in fade-in">Senha incorreta</p>
                 )}

                 <div className="flex gap-3 pt-4">
                    <button 
                       onClick={() => setShowPasswordModal(false)}
                       className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400"
                    >
                       Cancelar
                    </button>
                    <button 
                       onClick={validatePassword}
                       className="flex-1 bg-acamp-blue text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                    >
                       Confirmar
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <div className="text-center pb-8">
        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">ACAMP Archery App v1.3</p>
      </div>
    </div>
  );
};

export default ProfilePage;
