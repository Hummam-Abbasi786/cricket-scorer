import React, { useState, useEffect } from 'react';
import { CricketProvider, useCricket } from './context/CricketContext';
import FormatSelection from './components/FormatSelection';
import SetupScreen from './components/SetupScreen';
import TossScreen from './components/TossScreen';
import LiveScoreboard from './components/LiveScoreboard';
import ControlGrid from './components/ControlGrid';
import MatchSummary from './components/MatchSummary';
import InningsSummary from './components/InningsSummary';
import SelectionOverlay from './components/SelectionOverlay';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/WelcomeScreen';
import { startListening, stopListening, speak, isVoiceSupported } from './utils/voiceRecognition';
import { Undo, LogOut, Moon, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';

// Sound effects using Web Audio API
// BUGFIX: Do NOT create AudioContext at module load time.
// Mobile browsers (Chrome on Android) require AudioContext to be created
// inside a user-gesture handler. Creating it at the top level leaves it
// permanently suspended on mobile, and resume() won't work outside a gesture.
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playBatHit = () => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

const playCheer = () => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const bufferSize = ctx.sampleRate * 2.0; // 2 seconds
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1000;
  const gain = ctx.createGain();
  
  // Envelope for cheer
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        padding: '0.75rem',
        borderRadius: '50%',
        background: 'var(--glass-bg)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        cursor: 'pointer',
        display: 'flex',
      }}
      className="glass hover-lift"
    >
      {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

const CricketApp = () => {
  const { currentMatch, players, addScore, selectionRequired, startMatch, undo, finishMatch } = useCricket();
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [pendingMatchConfig, setPendingMatchConfig] = useState(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const lastHeardTimeoutRef = React.useRef(null);

  const updateLastHeard = (transcript) => {
    if (lastHeardTimeoutRef.current) {
      clearTimeout(lastHeardTimeoutRef.current);
    }
    setLastHeard(transcript);
    lastHeardTimeoutRef.current = setTimeout(() => {
      setLastHeard('');
    }, 4000); // Clear after 4 seconds of silence
  };

  const handleScoreRef = React.useRef();

  useEffect(() => {
    handleScoreRef.current = handleScore;
  });

  const handleToggleVoice = () => {
    if (!voiceActive) {
      const started = startListening(
        (runs, type, transcript) => {
          if (handleScoreRef.current) {
            handleScoreRef.current(runs, type, transcript);
          }
        },
        (error) => {
          console.error("Voice error:", error);
          if (error === 'not-allowed') {
            alert('Microphone permission denied. Please allow microphone access in your browser settings to use voice scoring.');
          } else if (error === 'ios-not-supported') {
            alert('Voice scoring is not available on iPhone/iPad.\n\nThe Web Speech API is not supported on iOS browsers. Please use an Android device with Chrome for voice scoring.');
          } else if (error === 'not-supported') {
            alert('Voice recognition is not supported in this browser. Please use Chrome on Android and make sure the page is loaded over HTTPS.');
          }
          setVoiceActive(false);
        },
        (transcript) => {
          updateLastHeard(transcript);
        }
      );
      if (started) {
        setVoiceActive(true);
      }
    } else {
      stopListening();
      setVoiceActive(false);
    }
  };

  useEffect(() => {
    if (voiceActive && selectionRequired) {
      stopListening();
      setVoiceActive(false);
    }
  }, [voiceActive, selectionRequired]);

  const handleScore = (runs, type, transcript) => {
    if (transcript) {
      updateLastHeard(transcript);
    }

    if (type === 'undo') {
      undo();
      return;
    }
    
    // Play sound effects
    if (runs > 0 && type !== 'wide') {
      playBatHit();
    }
    if (runs === 4 || runs === 6 || type === 'wicket') {
      playCheer();
    }
    
    addScore(runs, type);
    if (runs === 4 || runs === 6) {
      confetti({
        particleCount: runs === 6 ? 150 : 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: runs === 6 ? ['#fbbf24', '#10b981', '#facc15'] : ['#10b981']
      });
    }
  };

  const handleFormatSelect = (format) => {
    setSelectedFormat(format);
  };

  const handleMatchStart = (config) => {
    setPendingMatchConfig(config);
  };
  
  const finalizeMatchStart = (finalConfig) => {
    setPendingMatchConfig(null);
    startMatch(finalConfig);
  };

  return (
    <div className="container">
      {/* 1. Format Selection View */}
      {!currentMatch && !selectedFormat && (
        <FormatSelection onSelect={handleFormatSelect} />
      )}

      {/* 2. Setup View */}
      {!currentMatch && !pendingMatchConfig && selectedFormat && (
        <SetupScreen 
          format={selectedFormat} 
          onStart={handleMatchStart} 
          onBack={() => setSelectedFormat(null)} 
        />
      )}

      {/* 3. Toss View */}
      {!currentMatch && pendingMatchConfig && (
        <TossScreen
          config={pendingMatchConfig}
          onComplete={finalizeMatchStart}
        />
      )}

      {/* 4. Innings Break View */}
      {currentMatch && currentMatch.status === 'inningsBreak' && (
        <InningsSummary />
      )}

      {/* 5. Summary View */}
      {currentMatch && currentMatch.status === 'finished' && (
        <MatchSummary />
      )}

      {/* 6. Live Match View */}
      {currentMatch && currentMatch.status === 'playing' && (
        <div className="animate-fade-in-up">
           <header className="animate-float" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem' }}>{currentMatch.teamA} <span style={{ color: 'var(--text-muted)' }}>vs</span> {currentMatch.teamB}</h1>
              {currentMatch.innings === 2 && (
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  TARGET: {currentMatch.target}
                </div>
              )}
            </div>
          </header>

          <LiveScoreboard 
            voiceActive={voiceActive} 
            onToggleVoice={handleToggleVoice} 
            lastHeard={lastHeard}
            voiceSupported={isVoiceSupported}
          />
          
          <div className="glass" style={{ padding: '1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Batsman</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {players.striker || 'Select Batsman'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {currentMatch.batsmenStats[players.striker]?.runs || 0} 
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                  ({currentMatch.batsmenStats[players.striker]?.balls || 0})
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                SR: {currentMatch.batsmenStats[players.striker]?.balls ? ((currentMatch.batsmenStats[players.striker].runs / currentMatch.batsmenStats[players.striker].balls) * 100).toFixed(1) : '0.0'} • 
                4s: {currentMatch.batsmenStats[players.striker]?.fours || 0} • 
                6s: {currentMatch.batsmenStats[players.striker]?.sixes || 0}
              </div>
            </div>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partner</div>
              <div style={{ fontWeight: 600, fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {players.nonStriker || 'Select Batsman'}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {currentMatch.batsmenStats[players.nonStriker]?.runs || 0} 
                <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                  ({currentMatch.batsmenStats[players.nonStriker]?.balls || 0})
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                SR: {currentMatch.batsmenStats[players.nonStriker]?.balls ? ((currentMatch.batsmenStats[players.nonStriker].runs / currentMatch.batsmenStats[players.nonStriker].balls) * 100).toFixed(1) : '0.0'} • 
                4s: {currentMatch.batsmenStats[players.nonStriker]?.fours || 0} • 
                6s: {currentMatch.batsmenStats[players.nonStriker]?.sixes || 0}
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '1rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Bowler</span>
              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1.1rem' }}>{players.bowler || 'Select Bowler'}</span>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 700 }}>
              {currentMatch.bowlerStats[players.bowler]?.wickets || 0} - {currentMatch.bowlerStats[players.bowler]?.runs || 0}
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                ({Math.floor((currentMatch.bowlerStats[players.bowler]?.balls || 0) / 6)}.{ (currentMatch.bowlerStats[players.bowler]?.balls || 0) % 6})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.1rem' }}>
                Econ: {currentMatch.bowlerStats[players.bowler]?.balls ? ((currentMatch.bowlerStats[players.bowler].runs / (currentMatch.bowlerStats[players.bowler].balls / 6))).toFixed(1) : '0.0'}
              </div>
            </div>
          </div>

          <ControlGrid onScore={handleScore} />

          {/* Match Actions */}
          <div style={{ 
            marginTop: '1.5rem', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem' 
          }}>
            <button
              onClick={undo}
              className="flex-center"
              style={{
                padding: '1rem',
                borderRadius: '1.25rem',
                background: 'var(--btn-bg)',
                color: 'var(--text-muted)',
                gap: '0.5rem',
                fontWeight: 600,
                border: '1px solid var(--border)'
              }}
            >
              <Undo size={20} />
              <div>
                <div>UNDO</div>
              </div>
            </button>

            <button
              onClick={() => {
                if (window.confirm('End Match?')) {
                  finishMatch();
                }
              }}
              className="flex-center"
              style={{
                padding: '1rem',
                borderRadius: '1.25rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
                gap: '0.5rem',
                fontWeight: 600,
                border: '1px solid rgba(239, 68, 68, 0.2)'
              }}
            >
              <LogOut size={20} />
              <div>
                <div>END MATCH</div>
              </div>
            </button>
          </div>
        </div>
      )}
      
      <SelectionOverlay />
    </div>
  );
};

function App() {
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
  }, []);

  return (
    <>
      {!welcomeDone && <WelcomeScreen onNext={() => setWelcomeDone(true)} />}
      {welcomeDone && !splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {welcomeDone && splashDone && (
        <>
          <ThemeToggle />
          <CricketProvider>
            <CricketApp />
          </CricketProvider>
        </>
      )}
    </>
  );
}

export default App;
