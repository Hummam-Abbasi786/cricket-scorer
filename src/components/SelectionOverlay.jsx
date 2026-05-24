import React, { useState, useEffect } from 'react';
import { useCricket } from '../context/CricketContext';
import { User, Shield, CheckCircle } from 'lucide-react';

const SelectionOverlay = () => {
  const { selectionRequired, resolveSelection, currentMatch, players } = useCricket();
  const [name, setName] = useState('');

  useEffect(() => {
    setName('');
  }, [selectionRequired]);

  if (!selectionRequired) return null;

  const getLabel = () => {
    switch (selectionRequired.type) {
      case 'striker':
        return { en: 'Next Striker Batsman', icon: <User size={24} color="var(--primary)" /> };
      case 'nonStriker':
        return { en: 'Non-Striker Batsman', icon: <User size={24} color="var(--primary)" /> };
      case 'bowler':
        return { en: 'Choose Bowler', icon: <Shield size={24} color="var(--danger)" /> };
      case 'newBatsman':
        return { en: 'New Batsman Required', icon: <User size={24} color="var(--primary)" /> };
      case 'newBowler':
        return { en: 'Select New Bowler', icon: <Shield size={24} color="var(--danger)" /> };
      default:
        return { en: 'Entry Required', icon: <User size={24} /> };
    }
  };

  const label = getLabel();
  const displayTitle = selectionRequired.label || label.en;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      resolveSelection(name.trim());
      setName('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="glass animate-fade-in-up" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2rem',
        textAlign: 'center',
        border: '1px solid var(--border-light)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'var(--btn-bg)', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          {label.icon}
        </div>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', lineHeight: 1.3 }}>{displayTitle}</h2>

        {currentMatch && currentMatch.status !== 'setup' && (
          <div style={{ 
            marginBottom: '1.5rem', 
            padding: '1rem', 
            background: 'var(--input-bg)', 
            borderRadius: '1rem', 
            textAlign: 'left', 
            fontSize: '0.9rem',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Score</span> 
              <span style={{ fontWeight: 800 }}>{currentMatch.score}/{currentMatch.wickets} <span style={{ color: 'var(--text-muted)' }}>({Math.floor(currentMatch.balls/6)}.{currentMatch.balls%6} Ovs)</span></span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {players.striker && selectionRequired.type !== 'striker' && (
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-muted)' }}>Striker:</span> 
                   <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{players.striker} ({currentMatch.batsmenStats[players.striker]?.runs || 0})</span>
                 </div>
              )}
              {players.nonStriker && selectionRequired.type !== 'nonStriker' && (
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ color: 'var(--text-muted)' }}>Partner:</span> 
                   <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{players.nonStriker} ({currentMatch.batsmenStats[players.nonStriker]?.runs || 0})</span>
                 </div>
              )}
              {players.bowler && selectionRequired.type !== 'bowler' && selectionRequired.type !== 'newBowler' && (
                 <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
                   <span style={{ color: 'var(--text-muted)' }}>Bowler:</span> 
                   <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{players.bowler} {currentMatch.bowlerStats[players.bowler]?.wickets || 0}-{currentMatch.bowlerStats[players.bowler]?.runs || 0}</span>
                 </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="Enter player name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: '1rem',
              background: 'var(--input-bg)',
              border: '2px solid var(--primary)',
              color: 'var(--text)',
              fontSize: '1.25rem',
              textAlign: 'center',
              marginBottom: '1rem',
              outline: 'none',
              boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
            }}
          />

          <button
            type="submit"
            disabled={!name.trim()}
            style={{
              width: '100%',
              padding: '1.25rem',
              borderRadius: '1rem',
              background: name.trim() ? 'var(--primary)' : 'var(--btn-bg)',
              color: name.trim() ? 'var(--bg)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: name.trim() ? 1 : 0.5,
              cursor: name.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            <CheckCircle size={24} />
            CONFIRM
          </button>
        </form>
      </div>
    </div>
  );
};

export default SelectionOverlay;
