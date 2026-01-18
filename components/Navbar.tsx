
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

interface NavbarProps {
  isCoach: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isCoach }) => {
  const activeStyle = "flex flex-col items-center gap-1 text-acamp-yellow scale-110 transition-all duration-300 relative";
  const inactiveStyle = "flex flex-col items-center gap-1 text-blue-200 opacity-50 hover:opacity-100 hover:scale-105 transition-all duration-300";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-acamp-blue/95 backdrop-blur-md border-t border-white/10 p-3 px-6 z-[100] flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.2)]">
      <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Dashboard}
        <span className="text-[8px] uppercase font-black tracking-widest mt-0.5">Início</span>
        <div className="active-dot absolute -bottom-1 w-1 h-1 bg-acamp-yellow rounded-full scale-0 transition-transform duration-300"></div>
      </NavLink>

      <NavLink to="/attendance" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Calendar}
        <span className="text-[8px] uppercase font-black tracking-widest mt-0.5">Squad</span>
      </NavLink>

      {!isCoach && (
        <NavLink 
          to="/shots" 
          className={({ isActive }) => isActive ? "flex flex-col items-center gap-1 text-white scale-110 transition-all" : "flex flex-col items-center gap-1 text-blue-200 opacity-70 hover:opacity-100 transition-all"}
        >
          <div className={`bg-acamp-yellow text-acamp-blue p-3.5 rounded-full -mt-12 shadow-[0_8px_20px_rgba(255,215,0,0.3)] border-4 border-gray-50 active:scale-90 transition-all`}>
            {ICONS.Target}
          </div>
          <span className="text-[8px] uppercase font-black tracking-widest mt-1">Pontuar</span>
        </NavLink>
      )}

      <NavLink to="/training" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Dumbbell}
        <span className="text-[8px] uppercase font-black tracking-widest mt-0.5">Treino</span>
      </NavLink>

      <NavLink to="/goals" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Trophy}
        <span className="text-[8px] uppercase font-black tracking-widest mt-0.5">Metas</span>
      </NavLink>
      
      <style>{`
        .active .active-dot {
          scale: 1;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
