'use client';

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function GlowBorder({ children, className = '' }: GlowBorderProps) {
  return (
    <div className="relative group">
      {/* Animated glow effect */}
      <div className="absolute -inset-0.5 bg-[#BAFF29] rounded-lg blur opacity-30 animate-pulse-glow transition duration-1000"></div>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg">
        <div className="absolute inset-0 border-2 border-[#BAFF29] rounded-lg animate-border-flow"></div>
      </div>
      
      {/* Content */}
      <div className={`relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
