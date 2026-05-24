import React from 'react';
import { useCricket } from '../context/CricketContext';
import { Mic, MicOff, RotateCcw, TrendingUp, Info, MessageSquare, Activity } from 'lucide-react';

const LiveScoreboard = ({ voiceActive, onToggleVoice, lastHeard, voiceSupported = true }) => {
  const { currentMatch, undo } = useCricket();

  if (!currentMatch) return null;

  const totalBalls = currentMatch.balls;
  const overs = Math.floor(totalBalls / 6);
  const remainingBalls = totalBalls % 6;
  const crr = totalBalls > 0 ? ((currentMatch.score / totalBalls) * 6).toFixed(2) : '0.00';
  
  const isSecondInnings = currentMatch.innings === 2;
  const target = currentMatch.target || 0;
  const totalMaxBalls = currentMatch.maxOvers * 6;
  const ballsRemaining = totalMaxBalls - totalBalls;
  const runsNeeded = target - currentMatch.score;
  const rrr = ballsRemaining > 0 && runsNeeded > 0 ? ((runsNeeded / ballsRemaining) * 6).toFixed(2) : '0.00';

  let winPrediction = "";
  if (isSecondInnings && runsNeeded > 0 && ballsRemaining > 0) {
    if (parseFloat(crr) >= parseFloat(rrr)) {
      winPrediction = `${currentMatch.battingTeam} favorites`;
    } else if (parseFloat(rrr) - parseFloat(crr) > 2) {
      const bowlingTeam = currentMatch.battingTeam === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA;
      winPrediction = `${bowlingTeam} favorites`;
    } else {
      winPrediction = "Match evenly poised";
    }
  }
  
  const recentBalls = currentMatch.overHistory.slice(-3).reverse();

  return (
    <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      {isSecondInnings && (
        <div style={{
          background: 'var(--primary)',
          color: 'var(--bg)',
          padding: '0.75rem',
          borderRadius: '0.75rem',
          marginBottom: '1rem',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '1rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem'
        }}>
          <div>{runsNeeded > 0 ? `${runsNeeded} runs needed from ${ballsRemaining} balls` : 'Scores Level'}</div>
          {runsNeeded > 0 && ballsRemaining > 0 && (
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>
              {rrr} runs needed per over
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {currentMatch.battingTeam} is Batting
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 800 }}>{currentMatch.score}</span>
            <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {currentMatch.wickets}</span>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
          <button 
            onClick={voiceSupported ? onToggleVoice : () => alert('Voice scoring is not available on iPhone/iPad.\n\nPlease use Chrome on Android for voice scoring.')}
            title={voiceSupported ? (voiceActive ? 'Stop voice scoring' : 'Start voice scoring') : 'Not supported on iOS'}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '50%', 
              background: voiceActive ? 'var(--primary)' : 'var(--btn-bg)',
              color: voiceActive ? 'var(--bg)' : voiceSupported ? 'var(--text)' : 'var(--text-muted)',
              marginBottom: '0.25rem',
              animation: voiceActive ? 'glow 2s infinite' : 'none',
              opacity: voiceSupported ? 1 : 0.45,
              cursor: voiceSupported ? 'pointer' : 'not-allowed',
            }}
          >
            {voiceActive ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          
          <div style={{ 
            fontSize: '0.75rem', 
            height: '20px', 
            color: 'var(--primary)', 
            fontWeight: 600,
            opacity: lastHeard ? 1 : 0,
            transition: 'opacity 0.3s ease',
            textShadow: '0 0 10px rgba(242, 108, 35, 0.5)'
          }}>
            {lastHeard && `Heard: "${lastHeard}"`}
          </div>

          <div style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>
            {overs}.{remainingBalls} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ov</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={18} color="var(--primary)" />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CRR</div>
            <div style={{ fontWeight: 600 }}>{crr}</div>
          </div>
        </div>

        {isSecondInnings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--danger)" />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RRR</div>
              <div style={{ fontWeight: 600 }}>{rrr}</div>
            </div>
          </div>
        )}
        
        {isSecondInnings && winPrediction && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', gridColumn: 'span 2' }}>
            <Activity size={18} color="var(--secondary)" />
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary)' }}>
              {winPrediction}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', gridColumn: (isSecondInnings && !winPrediction) ? 'span 2' : 'span 1' }}>
           <button 
            onClick={undo}
            className="flex-center"
            style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)', gap: '0.3rem', fontSize: '0.875rem' }}
          >
            <RotateCcw size={16} /> Undo
          </button>
        </div>
      </div>

      {recentBalls.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={14} />
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Commentary</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentBalls.map((ball, i) => (
              <div key={i} style={{ fontSize: '0.875rem', display: 'flex', gap: '0.75rem', opacity: 1 - (i * 0.3) }}>
                <span style={{ fontWeight: 700, color: ball.type === 'wicket' ? 'var(--danger)' : ball.runs === 4 || ball.runs === 6 ? 'var(--primary)' : 'var(--text-muted)', minWidth: '24px' }}>
                  {ball.type === 'wicket' ? 'W' : ball.type === 'wide' ? 'Wd' : ball.type === 'noball' ? 'Nb' : ball.runs}
                </span>
                <span>{ball.commentary || '...'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;
