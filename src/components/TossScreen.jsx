import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Circle, RefreshCw, Hand } from 'lucide-react';

const playTossSound = () => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
};

const TossScreen = ({ config, onComplete }) => {
  const [method, setMethod] = useState('coin'); // coin, wheel, tap
  const [status, setStatus] = useState('idle'); // idle, tossing, result, decision
  const [winner, setWinner] = useState('');
  
  // Animation states
  const [rotation, setRotation] = useState(0);
  const [flickering, setFlickering] = useState(false);
  const [tapA, setTapA] = useState(false);
  const [tapB, setTapB] = useState(false);

  const teamA = config.teamA || 'Team A';
  const teamB = config.teamB || 'Team B';

  const determineWinner = () => {
    return Math.random() > 0.5 ? teamA : teamB;
  };

  const handleStartToss = () => {
    if (method === 'tap' && (!tapA || !tapB)) {
      alert('Both captains must tap their buttons!');
      return;
    }

    setStatus('tossing');
    playTossSound();
    
    const outcome = determineWinner();

    if (method === 'coin') {
      const isA = outcome === teamA;
      // 1800 is 5 full spins, add 180 if Team B wins (assuming Heads is Team A, Tails is B)
      const newRot = rotation + 1800 + (isA ? 0 : 180);
      setRotation(newRot);
      
      setTimeout(() => {
        setWinner(outcome);
        setStatus('result');
      }, 2000);
      
    } else if (method === 'wheel') {
      const isA = outcome === teamA;
      // land securely in the zone for A (0-180deg) or B (180-360deg)
      const baseSpins = 1800;
      const extraRot = isA ? 90 : 270; 
      const newRot = rotation + baseSpins + extraRot;
      setRotation(newRot);

      setTimeout(() => {
        setWinner(outcome);
        setStatus('result');
      }, 2500);

    } else if (method === 'tap') {
       setFlickering(true);
       let ticks = 0;
       const flickerInterval = setInterval(() => {
         setWinner(ticks % 2 === 0 ? teamA : teamB);
         ticks++;
       }, 100);

       setTimeout(() => {
         clearInterval(flickerInterval);
         setFlickering(false);
         setWinner(outcome);
         setStatus('result');
       }, 2000);
    }
  };

  const handleDecision = (decision) => {
    let battingTeam = '';
    if (decision === 'bat') {
      battingTeam = winner;
    } else {
      battingTeam = winner === teamA ? teamB : teamA;
    }
    
    onComplete({
      ...config,
      battingTeam: battingTeam
    });
  };

  // Reset toss states if method changes
  useEffect(() => {
    setStatus('idle');
    setWinner('');
    setTapA(false);
    setTapB(false);
    setRotation(0);
  }, [method]);

  return (
    <div className="container animate-fade-in-up" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--text)' }}>
          <span style={{ color: 'var(--primary)' }}>Toss</span> Time
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Choose your toss method</p>
      </header>

      {status === 'idle' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setMethod('coin')}
            className="glass" 
            style={{ padding: '0.75rem 1.5rem', background: method === 'coin' ? 'var(--primary)' : 'var(--glass-bg)', color: method === 'coin' ? '#000' : 'var(--text)' }}
          >
            <Circle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Coin Flip
          </button>
          <button 
            onClick={() => setMethod('wheel')}
            className="glass" 
            style={{ padding: '0.75rem 1.5rem', background: method === 'wheel' ? 'var(--primary)' : 'var(--glass-bg)', color: method === 'wheel' ? '#000' : 'var(--text)' }}
          >
            <RefreshCw size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Spin Wheel
          </button>
          <button 
            onClick={() => setMethod('tap')}
            className="glass" 
            style={{ padding: '0.75rem 1.5rem', background: method === 'tap' ? 'var(--primary)' : 'var(--glass-bg)', color: method === 'tap' ? '#000' : 'var(--text)' }}
          >
            <Hand size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}/> Tap Battle
          </button>
        </div>
      )}

      <div className="glass" style={{ padding: '3rem', width: '100%', maxWidth: '500px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        
        {/* TEAMS DISPLAY */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: '800', fontSize: '1.25rem' }}>
          <div style={{ color: 'var(--primary)' }}>{teamA}</div>
          <div style={{ color: 'var(--text-muted)' }}>VS</div>
          <div style={{ color: 'var(--secondary)' }}>{teamB}</div>
        </div>

        {/* --- COIN UI --- */}
        {method === 'coin' && (status === 'idle' || status === 'tossing') && (
          <div style={{ perspective: '1000px', margin: '2rem 0' }}>
            <div style={{
              width: '120px', height: '120px', 
              borderRadius: '50%',
              background: 'linear-gradient(45deg, var(--secondary), #fde047)',
              boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
              transformStyle: 'preserve-3d',
              transition: 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: `rotateY(${rotation}deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: '900', color: '#854d0e'
            }}>
              $
            </div>
          </div>
        )}

        {/* --- WHEEL UI --- */}
        {method === 'wheel' && (status === 'idle' || status === 'tossing') && (
          <div style={{ position: 'relative', margin: '2rem 0' }}>
            <div style={{
              position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
              width: '0', height: '0',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '20px solid var(--text)',
              zIndex: 10
            }}></div>
            <div style={{
              width: '200px', height: '200px',
              borderRadius: '50%',
              background: 'conic-gradient(var(--primary) 0deg 180deg, var(--secondary) 180deg 360deg)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              transition: 'transform 2.5s cubic-bezier(0.1, 0.7, 0.1, 1)',
              transform: `rotate(${rotation}deg)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '20%', left: '20%', transform: 'rotate(-45deg)', fontWeight: 800, color: '#000' }}>{teamA.substring(0,3)}</div>
              <div style={{ position: 'absolute', bottom: '20%', right: '20%', transform: 'rotate(135deg)', fontWeight: 800, color: '#000' }}>{teamB.substring(0,3)}</div>
            </div>
          </div>
        )}

        {/* --- TAP UI --- */}
        {method === 'tap' && (status === 'idle' || status === 'tossing') && (
          <div style={{ display: 'flex', gap: '2rem', margin: '2rem 0' }}>
            <button 
              onClick={() => status === 'idle' && setTapA(true)}
              style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: tapA ? 'var(--primary)' : 'var(--glass-bg)',
                border: `4px solid var(--primary)`,
                fontSize: '0.8rem', fontWeight: '800', color: tapA ? '#000' : 'var(--text)',
                transition: 'all 0.2s',
                opacity: (flickering && winner === teamB) ? 0.3 : 1
              }}
            >
              TAP A
            </button>
            <button 
              onClick={() => status === 'idle' && setTapB(true)}
              style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: tapB ? 'var(--secondary)' : 'var(--glass-bg)',
                border: `4px solid var(--secondary)`,
                fontSize: '0.8rem', fontWeight: '800', color: tapB ? '#000' : 'var(--text)',
                transition: 'all 0.2s',
                opacity: (flickering && winner === teamA) ? 0.3 : 1
              }}
            >
              TAP B
            </button>
          </div>
        )}

        {/* START TOSS BUTTON */}
        {status === 'idle' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
            <button 
              onClick={handleStartToss}
              className="flex-center"
              style={{ 
                padding: '1rem 2rem', 
                borderRadius: '2rem', 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
                color: '#000', fontWeight: 800, fontSize: '1.25rem', width: '100%'
              }}
            >
              START TOSS
            </button>
            <button 
              onClick={() => setStatus('skip_toss_decision')}
              className="flex-center"
              style={{ 
                padding: '0.75rem 1.5rem', 
                borderRadius: '2rem', 
                background: 'var(--glass-bg)', 
                color: 'var(--text)', fontWeight: 600, fontSize: '1rem', border: '1px solid var(--border)', width: '100%'
              }}
            >
              Skip Toss & Select Batting Team
            </button>
          </div>
        )}

        {/* SKIP TOSS DECISION */}
        {status === 'skip_toss_decision' && (
          <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1.5rem', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text)' }}>
              Who will bat first?
            </h2>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                onClick={() => onComplete({ ...config, battingTeam: teamA })}
                style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', background: 'var(--primary)', color: '#000', fontWeight: 800, fontSize: '1.1rem' }}
              >
                {teamA}
              </button>
              <button 
                onClick={() => onComplete({ ...config, battingTeam: teamB })}
                style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', background: 'var(--secondary)', color: '#000', fontWeight: 800, fontSize: '1.1rem' }}
              >
                {teamB}
              </button>
            </div>
            <button 
              onClick={() => setStatus('idle')}
              style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Back to Toss
            </button>
          </div>
        )}

        {/* RESULT & DECISION */}
        {(status === 'result' || status === 'decision') && (
          <div className="animate-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '1.5rem', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: winner === teamA ? 'var(--primary)' : 'var(--secondary)' }}>
              {winner} won the toss!
            </h2>
            
            {status === 'result' && (
              <button 
                onClick={() => setStatus('decision')}
                className="flex-center"
                style={{ padding: '1rem 2rem', borderRadius: '1.25rem', background: 'var(--text)', color: '#000', fontWeight: 800 }}
              >
                Make Decision
              </button>
            )}

            {status === 'decision' && (
              <div style={{ width: '100%' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>What will {winner} choose to do?</p>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <button 
                    onClick={() => handleDecision('bat')}
                    style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', background: 'var(--primary)', color: '#000', fontWeight: 800, fontSize: '1.1rem' }}
                  >
                    BAT FIRST
                  </button>
                  <button 
                    onClick={() => handleDecision('bowl')}
                    style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', background: 'var(--secondary)', color: '#000', fontWeight: 800, fontSize: '1.1rem' }}
                  >
                    BOWL FIRST
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TossScreen;
