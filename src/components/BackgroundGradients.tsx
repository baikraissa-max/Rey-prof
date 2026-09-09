import React from 'react';

export const BackgroundGradients: React.FC = () => {
  return (
    <div 
      aria-hidden="true" 
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* 1. Deep midnight dark canvas (80% dark space) */}
      <div className="absolute inset-0 bg-[#060608]" />

      {/* 2. KANAN ATAS (Top Right Ambient Purple Bloom) */}
      <div 
        className="liquid-blob-tr absolute -top-[12%] -right-[8%] sm:-top-[8%] sm:-right-[5%] w-[80vw] sm:w-[55vw] md:w-[48vw] max-w-[620px] h-[80vw] sm:h-[55vw] md:h-[48vw] max-h-[620px] rounded-full blur-[80px] sm:blur-[115px] md:blur-[135px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 55% 45%, rgba(124, 58, 237, 0.22) 0%, rgba(91, 33, 182, 0.14) 38%, rgba(67, 56, 202, 0.05) 62%, transparent 75%)',
        }}
      />

      {/* 3. KIRI TENGAH (Center Left Subtle Violet-Indigo Fog) */}
      <div 
        className="liquid-blob-cl absolute top-[36%] -left-[14%] sm:top-[34%] sm:-left-[8%] w-[75vw] sm:w-[50vw] md:w-[44vw] max-w-[560px] h-[75vw] sm:h-[50vw] md:h-[44vw] max-h-[560px] rounded-full blur-[85px] sm:blur-[120px] md:blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 45% 50%, rgba(79, 70, 229, 0.17) 0%, rgba(109, 40, 217, 0.13) 40%, rgba(46, 16, 101, 0.04) 65%, transparent 75%)',
        }}
      />

      {/* 4. SEDIKIT BAGIAN BAWAH (Subtle Bottom Ambient Light) */}
      <div 
        className="liquid-blob-b absolute -bottom-[12%] left-[15%] sm:left-[25%] w-[70vw] sm:w-[48vw] md:w-[42vw] max-w-[520px] h-[65vw] sm:h-[45vw] md:h-[38vw] max-h-[480px] rounded-full blur-[85px] sm:blur-[120px] md:blur-[140px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(126, 34, 206, 0.15) 0%, rgba(88, 28, 135, 0.09) 45%, rgba(15, 10, 30, 0) 72%)',
        }}
      />

      {/* 5. HERO SUBTLE DIFFUSE BLOOM (Pusat Atas - Memberi kedalaman lembut di belakang avatar dan heading) */}
      <div 
        className="absolute -top-[6%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[660px] h-[45vw] max-h-[380px] rounded-full blur-[75px] sm:blur-[105px] pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(147, 51, 234, 0.11) 0%, rgba(76, 29, 149, 0.05) 50%, transparent 70%)',
        }}
      />

      {/* 6. Subtle tactile micro-texture (mencegah color banding pada gradasi gelap, tanpa kesan ramai) */}
      <div 
        className="absolute inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />
    </div>
  );
};
