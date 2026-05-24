import React from 'react';
import { ArrowRight, Trophy } from 'lucide-react';

const WelcomeScreen = ({ onNext }) => {
  return (
    <div 
      className="fs-wrapper" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div className="fs-bg" />
      <div className="fs-overlay" />
      
      <div 
        style={{ 
          zIndex: 10, 
          position: 'relative', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'fadeInUp 1s ease-out'
        }}
      >
        <div 
          style={{ 
            background: 'rgba(242, 108, 35, 0.1)', 
            padding: '1.5rem', 
            borderRadius: '50%', 
            marginBottom: '2rem',
            border: '2px solid rgba(242, 108, 35, 0.3)',
            boxShadow: '0 0 30px rgba(242, 108, 35, 0.2)'
          }}
        >
          <Trophy size={64} color="#F26C23" />
        </div>

        <h1 
          style={{ 
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
            fontWeight: '600', 
            marginBottom: '0.5rem', 
            color: 'var(--text-muted)'
          }}
        >
          Welcome to
        </h1>
        
        <h2 
          style={{ 
            fontSize: 'clamp(3rem, 8vw, 5rem)', 
            fontWeight: '900', 
            color: 'var(--text)', 
            marginBottom: '3rem', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            lineHeight: '1.1',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)' 
          }}
        >
          <span style={{ 
            background: 'linear-gradient(to right, #F26C23, #facc15)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
          }}>
            Hummam Abbasi
          </span>
          <br />
          Scoring App
        </h2>

        <button
          onClick={onNext}
          className="hover-lift"
          style={{
            padding: '1.2rem 3.5rem',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            borderRadius: '50px',
            background: 'linear-gradient(135deg, #F26C23 0%, #d95d18 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(242, 108, 35, 0.4)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          Get Started <ArrowRight />
        </button>
      </div>
      
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default WelcomeScreen;
