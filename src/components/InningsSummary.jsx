import React, { useState } from 'react';
import { useCricket } from '../context/CricketContext';
import { PlayCircle, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const InningsSummary = () => {
  const { currentMatch, startSecondInnings } = useCricket();
  const [showFullScorecard, setShowFullScorecard] = useState(true);

  if (!currentMatch || !currentMatch.innings1Stats) return null;

  const stats = currentMatch.innings1Stats;
  const target = currentMatch.target;
  const oversAvailable = currentMatch.maxOvers;
  const reqRunRate = (target / oversAvailable).toFixed(2);
  const teamB = currentMatch.battingTeam === currentMatch.teamA ? currentMatch.teamB : currentMatch.teamA;
  const oversPlayed = `${Math.floor(stats.balls / 6)}.${stats.balls % 6}`;
  const runRate = stats.balls > 0 ? ((stats.score / stats.balls) * 6).toFixed(2) : '0.00';

  return (
    <div className="container animate-fade-in-up" style={{ paddingBottom: '2rem' }}>
      
      {/* Header Card */}
      <div className="glass" style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        marginBottom: '1.5rem', 
        border: '1px solid var(--primary)', 
        background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          First Innings Complete
        </h1>
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>{stats.battingTeam}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
            {stats.score}
          </span>
          <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>/ {stats.wickets}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <div>Overs: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{oversPlayed}</span></div>
          <div>Run Rate: <span style={{ fontWeight: 600, color: 'var(--text)' }}>{runRate}</span></div>
        </div>
      </div>

      {/* Target Section */}
      <div className="glass" style={{ 
        padding: '1.5rem', 
        marginBottom: '1.5rem', 
        border: '1px solid var(--secondary)',
        background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.1) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1 }}>
          <Target size={120} />
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} /> Target for Second Innings
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{target}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overs</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{oversAvailable}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Req. RR</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {reqRunRate} <TrendingUp size={16} color="var(--danger)" />
            </div>
          </div>
        </div>
        
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(0,0,0,0.2)', 
          borderRadius: '0.5rem', 
          fontSize: '1.1rem', 
          fontWeight: 600,
          textAlign: 'center',
          color: 'var(--text)'
        }}>
          {teamB} needs {target} runs in {oversAvailable} overs to win.
        </div>
      </div>

      {/* Scorecard Toggle */}
      <button 
        onClick={() => setShowFullScorecard(!showFullScorecard)}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'var(--btn-bg)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'var(--text)',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}
      >
        <span>{showFullScorecard ? 'Hide' : 'View'} Full Scorecard</span>
        {showFullScorecard ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Detailed Scorecard */}
      {showFullScorecard && (
        <div className="animate-fade-in-up" style={{ marginBottom: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Batting
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <div>Batter</div>
                <div style={{ textAlign: 'right' }}>R</div>
                <div style={{ textAlign: 'right' }}>B</div>
                <div style={{ textAlign: 'right' }}>4s</div>
                <div style={{ textAlign: 'right' }}>6s</div>
                <div style={{ textAlign: 'right' }}>SR</div>
              </div>
              {Object.entries(stats.batsmenStats).map(([name, s]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.5fr', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700 }}>{s.runs}</div>
                  <div style={{ textAlign: 'right' }}>{s.balls}</div>
                  <div style={{ textAlign: 'right' }}>{s.fours || 0}</div>
                  <div style={{ textAlign: 'right' }}>{s.sixes || 0}</div>
                  <div style={{ textAlign: 'right' }}>{s.balls ? ((s.runs / s.balls) * 100).toFixed(1) : '0.0'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--danger)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Bowling
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                <div>Bowler</div>
                <div style={{ textAlign: 'right' }}>O</div>
                <div style={{ textAlign: 'right' }}>R</div>
                <div style={{ textAlign: 'right' }}>W</div>
                <div style={{ textAlign: 'right' }}>Econ</div>
              </div>
              {Object.entries(stats.bowlerStats).map(([name, s]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr', fontSize: '0.875rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>{name}</div>
                  <div style={{ textAlign: 'right' }}>{Math.floor(s.balls/6)}.{s.balls%6}</div>
                  <div style={{ textAlign: 'right' }}>{s.runs}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>{s.wickets}</div>
                  <div style={{ textAlign: 'right' }}>{s.balls ? ((s.runs / (s.balls/6))).toFixed(1) : '0.0'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button 
        onClick={startSecondInnings}
        className="flex-center animate-pulse"
        style={{ 
          width: '100%', 
          padding: '1.25rem', 
          borderRadius: '1.5rem', 
          background: 'var(--primary)', 
          color: 'var(--bg)', 
          gap: '0.75rem', 
          fontWeight: 800,
          fontSize: '1.1rem',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        <PlayCircle size={24} /> START SECOND INNINGS
      </button>

    </div>
  );
};

export default InningsSummary;
