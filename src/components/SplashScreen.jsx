import React, { useEffect, useState } from 'react';

const PLAYERS = [
  { name: 'Babar Azam', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Babar_azam_2023.jpg/330px-Babar_azam_2023.jpg' },
  { name: 'Virat Kohli', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/330px-Virat_Kohli_in_PMO_New_Delhi.jpg' },
  { name: 'Mitchell Starc', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Mitchell_Starc_2023.jpg/330px-Mitchell_Starc_2023.jpg' },
  { name: 'David Warner', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/DAVID_WARNER_%2811704782453%29.jpg/330px-DAVID_WARNER_%2811704782453%29.jpg' },
  { name: 'Brian Lara', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Brian_Lara_at_2012_Mumbai_Marathon_pre_bash.jpg/330px-Brian_Lara_at_2012_Mumbai_Marathon_pre_bash.jpg' }
];

const SplashScreen = ({ onDone }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [playersVisible, setPlayersVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Show completely black screen first, then animate logo in
    const showTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 400); // slight delay to emphasize the pure black screen
    
    // 2. Animate players shortly after logo appears
    const playersTimer = setTimeout(() => {
      setPlayersVisible(true);
    }, 800);

    // 3. Keep visible for ~5-6 seconds total before fading out
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 6000); 

    // 4. Complete animation and notify parent to navigate
    const doneTimer = setTimeout(() => {
      onDone();
    }, 6800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(playersTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <>
      <style>
        {`
          @keyframes luxuriousGlowPulse {
            0% {
              opacity: 0.6;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1.05);
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000', // Completely black screen
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          opacity: fadeOut ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out',
        }}
      >
        <div
          style={{
            opacity: logoVisible ? 1 : 0,
            transform: logoVisible ? 'scale(1)' : 'scale(1.15)', // Cinematic zoom-in
            filter: logoVisible ? 'blur(0px)' : 'blur(10px)', // Fade in from blur
            transition: 'opacity 2.5s cubic-bezier(0.2, 0.8, 0.2, 1), transform 3.5s cubic-bezier(0.2, 0.8, 0.2, 1), filter 2.5s ease',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {/* Soft orange & yellow glow lighting around logo */}
          <div
            style={{
              position: 'absolute',
              width: '150%',
              height: '150%',
              background: 'radial-gradient(circle, rgba(242,108,35,0.4) 0%, rgba(250,204,21,0.15) 35%, transparent 70%)',
              filter: 'blur(30px)',
              opacity: logoVisible ? 1 : 0,
              transition: 'opacity 3s ease-in-out 0.5s',
              zIndex: 0,
              animation: logoVisible ? 'luxuriousGlowPulse 4s ease-in-out infinite alternate' : 'none'
            }}
          />
          
          <img 
            src="/logo.png" 
            alt="App Logo" 
            style={{
              width: '240px',
              maxWidth: '60vw',
              position: 'relative',
              zIndex: 10,
              filter: 'drop-shadow(0 0 15px rgba(242,108,35,0.3)) drop-shadow(0 0 30px rgba(250,204,21,0.2))',
            }}
          />

          {/* Famous Player Portraits */}
          {PLAYERS.map((player, index) => {
            // Distribute evenly in a circle around the logo
            const angle = (index / PLAYERS.length) * 2 * Math.PI - Math.PI / 2; // start from top
            // Using a dynamic radius so it scales well on mobile
            const radiusStr = `clamp(130px, 25vw, 220px)`; 
            
            return (
              <div
                key={player.name}
                style={{
                  position: 'absolute',
                  width: 'clamp(50px, 10vw, 80px)',
                  height: 'clamp(50px, 10vw, 80px)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  zIndex: 5,
                  opacity: playersVisible ? 0.9 : 0,
                  transform: playersVisible 
                    ? `translate(calc(cos(${angle}rad) * ${radiusStr}), calc(sin(${angle}rad) * ${radiusStr})) scale(1)` 
                    : `translate(0px, 0px) scale(0.3)`,
                  transition: `opacity 1.5s ease-out ${0.5 + index * 0.15}s, transform 2.2s cubic-bezier(0.2, 0.8, 0.2, 1.1) ${0.5 + index * 0.15}s`,
                  boxShadow: '0 0 20px rgba(242,108,35,0.4)',
                  border: '2px solid rgba(250,204,21,0.5)',
                  backgroundColor: '#111'
                }}
              >
                <img 
                  src={player.src} 
                  alt={player.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            );
          })}

        </div>
      </div>
    </>
  );
};

export default SplashScreen;
