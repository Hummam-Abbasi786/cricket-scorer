import React from 'react';
import { useCricket } from '../context/CricketContext';
import { Trophy, Share2, PlayCircle, RotateCcw, Star } from 'lucide-react';

const MatchSummary = () => {
  const { currentMatch, resetMatch, resumeMatch } = useCricket();

  if (!currentMatch) return null;

  const handleShare = async () => {
    const text = `🏏 Cricket Match Result: ${currentMatch.teamA} vs ${currentMatch.teamB}\nScore: ${currentMatch.score}/${currentMatch.wickets}\nOvers: ${Math.floor(currentMatch.balls / 6)}.${currentMatch.balls % 6}\nShared via Voice Scorer`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cricket Result', text });
      } catch (err) {
        console.error(err);
      }
    } else {
      alert(text);
    }
  };

  return (
    <div className="container animate-fade-in-up">
      <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', border: '2px solid var(--primary)', background: 'var(--btn-bg)' }}>
        <Trophy size={80} color="var(--primary)" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 10px var(--primary))' }} />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text)' }}>Match Finished!</h1>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {currentMatch.winner === 'Draw' ? "IT'S A DRAW!" : `${currentMatch.winner} WON!`}
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Hooray! Congratulations!</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem' }}>{currentMatch.score} / {currentMatch.wickets}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ({Math.floor(currentMatch.balls / 6)}.{currentMatch.balls % 6} Overs)
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700 }}>{currentMatch.battingTeam}</p>
          </div>
        </div>

        {(() => {
          let topPlayer = { name: 'None', points: 0, reason: '' };
          Object.entries(currentMatch.batsmenStats).forEach(([name, stats]) => {
            let points = stats.runs + (stats.sixes || 0) * 2 + (stats.fours || 0) * 1;
            if (points > topPlayer.points) {
              topPlayer = { name, points, reason: `${stats.runs} runs off ${stats.balls} balls` };
            }
          });
          Object.entries(currentMatch.bowlerStats).forEach(([name, stats]) => {
            let points = (stats.wickets * 25) + (stats.balls > 0 ? (36 / (stats.runs / (stats.balls/6))) : 0);
            if (points > topPlayer.points) {
              topPlayer = { name, points, reason: `${stats.wickets} wickets for ${stats.runs} runs` };
            }
          });
          if (topPlayer.points === 0) return null;
          
          return (
            <div style={{ marginBottom: '1.5rem', background: 'rgba(251, 191, 36, 0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                <Star size={18} fill="currentColor" />
                <h3 style={{ fontSize: '1rem', margin: 0 }}>Player of the Match</h3>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>{topPlayer.name}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: 600 }}>{topPlayer.reason}</span>
              </div>
            </div>
          );
        })()}

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>Top Batsmen</h3>
          {Object.entries(currentMatch.batsmenStats).map(([name, stats]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span>{name}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{stats.runs} <span style={{color: 'var(--text-muted)', fontWeight: 400}}>({stats.balls})</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  SR: {stats.balls ? ((stats.runs/stats.balls)*100).toFixed(1) : '0'} 
                  {stats.fours > 0 && ` • 4s: ${stats.fours}`}
                  {stats.sixes > 0 && ` • 6s: ${stats.sixes}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>Top Bowlers</h3>
          {Object.entries(currentMatch.bowlerStats).map(([name, stats]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span>{name}</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{stats.wickets}-{stats.runs} <span style={{color: 'var(--text-muted)', fontWeight: 400}}>({Math.floor(stats.balls / 6)}.{stats.balls % 6})</span></div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Econ: {stats.balls ? ((stats.runs/(stats.balls/6))).toFixed(1) : '0'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          onClick={handleShare}
          className="flex-center"
          style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--secondary)', color: 'white', gap: '0.5rem', fontWeight: 600 }}
        >
          <Share2 size={20} /> SHARE
        </button>
        <button 
          onClick={() => { resetMatch(); window.location.reload(); }}
          className="flex-center"
          style={{ padding: '1rem', borderRadius: '1rem', background: 'var(--card-bg)', color: 'var(--text)', gap: '0.5rem', fontWeight: 600, border: '1px solid var(--border)' }}
        >
          <RotateCcw size={20} /> NEW MATCH
        </button>
      </div>
    </div>
  );
};

export default MatchSummary;
