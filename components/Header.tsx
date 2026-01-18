
import React from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../types';
import Logo from './Logo';

interface HeaderProps {
  user: Profile;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-acamp-blue text-white p-4 shadow-md sticky top-0 z-50 border-b border-acamp-dark/30">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 active:scale-95 transition-transform">
          <Logo size="md" showText={false} />
          <span className="text-acamp-yellow font-black uppercase tracking-tighter text-lg">acamp</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/profile" className="flex items-center gap-2 active:scale-90 transition-transform">
            <img 
              src={user.avatar_url || "https://picsum.photos/100/100"} 
              alt={user.name} 
              className="w-9 h-9 rounded-full border-2 border-acamp-yellow object-cover shadow-sm"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
