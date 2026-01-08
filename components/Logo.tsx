
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = "" }) => {
  const sizes = {
    sm: { box: 'w-10 h-10', font: 'text-[8px]' },
    md: { box: 'w-14 h-14', font: 'text-[12px]' },
    lg: { box: 'w-28 h-28', font: 'text-[24px]' },
    xl: { box: 'w-48 h-48', font: 'text-[42px]' }
  };

  const s = sizes[size];

  // URL de um ícone de arqueiro (archer) em amarelo (FFD700) com fundo transparente
  const logoUrl = "https://img.icons8.com/ios-filled/512/FFD700/archer.png";

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* Container do ícone do arqueiro */}
      <div className={`${s.box} relative flex items-center justify-center overflow-visible`}>
        <img 
          src={logoUrl} 
          alt="ACAMP Arqueiro" 
          className="w-full h-full object-contain filter drop-shadow-md"
          onError={(e) => {
            // Fallback para ícone de arco e flecha genérico se necessário
            (e.target as HTMLImageElement).src = "https://img.icons8.com/ios-filled/512/FFD700/archery.png";
          }}
        />
      </div>
      
      {showText && (
        <span className={`${s.font} font-black text-acamp-yellow tracking-tighter uppercase mt-1 drop-shadow-sm`}>
          acamp
        </span>
      )}
    </div>
  );
};

export default Logo;
