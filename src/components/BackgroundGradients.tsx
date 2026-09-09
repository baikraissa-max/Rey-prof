import React from 'react';

export const BackgroundGradients: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {/* Deep dark canvas gradient */}
      <div className="absolute inset-0 bg-[#070709]" />

      {/* Subtle organic liquid shapes - low contrast, very slow animation, zero glare */}
      <div 
        className="liquid-blob-1 absolute -top-[15%] -left-[10%] w-[55vw] max-w-[580px] h-[55vw] max-h-[580px] rounded-full opacity-20 blur-[100px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(30, 41, 69, 0.8) 0%, rgba(15, 23, 42, 0) 70%)',
        }}
      />

      <div 
        className="liquid-blob-2 absolute top-[35%] -right-[15%] w-[60vw] max-w-[620px] h-[60vw] max-h-[620px] rounded-full opacity-18 blur-[120px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(38, 32, 58, 0.7) 0%, rgba(15, 17, 26, 0) 75%)',
        }}
      />

      <div 
        className="liquid-blob-3 absolute -bottom-[15%] left-[10%] w-[50vw] max-w-[540px] h-[50vw] max-h-[540px] rounded-full opacity-15 blur-[110px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(24, 38, 48, 0.6) 0%, rgba(10, 14, 20, 0) 70%)',
        }}
      />

      {/* Subtle micro grid / noise layer for tactile texture */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
