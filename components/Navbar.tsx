
import React from 'react';
import { NavLink } from 'react-router-dom';
import { ICONS } from '../constants';

interface NavbarProps {
  isCoach: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isCoach }) => {
  const activeStyle = "flex flex-col items-center gap-1 text-acamp-yellow";
  const inactiveStyle = "flex flex-col items-center gap-1 text-blue-200 opacity-70 hover:opacity-100 transition-opacity";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-acamp-blue border-t border-acamp-dark/50 p-3 px-6 z-50 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <NavLink to="/" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Dashboard}
        <span className="text-[10px] uppercase font-bold tracking-wider">Início</span>
      </NavLink>

      <NavLink to="/attendance" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Calendar}
        <span className="text-[10px] uppercase font-bold tracking-wider">Presença</span>
      </NavLink>

      {!isCoach && (
        <NavLink 
          to="/shots" 
          className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
        >
          <div className={`bg-acamp-yellow text-acamp-blue p-3 rounded-full -mt-10 shadow-lg border-4 border-gray-50`}>
            {ICONS.Target}
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Tiros</span>
        </NavLink>
      )}

      <NavLink to="/training" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Dumbbell}
        <span className="text-[10px] uppercase font-bold tracking-wider">Treinos</span>
      </NavLink>

      <NavLink to="/goals" className={({ isActive }) => isActive ? activeStyle : inactiveStyle}>
        {ICONS.Trophy}
        <span className="text-[10px] uppercase font-bold tracking-wider">Metas</span>
      </NavLink>
    </nav>
  );
};

export default Navbar;
