import React, { useState } from 'react';
import { User, Shield, Play, Users, ArrowLeft } from 'lucide-react';

const SetupScreen = ({ format, onStart, onBack }) => {
  const [setup, setSetup] = useState({
    teamA: 'Team A',
    teamB: 'Team B',
    playersPerTeam: 11,
    customOvers: 1
  });

  if (!format) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!setup.teamA || !setup.teamB) {
      alert('Please enter both team names');
      return;
    }
    const finalOvers = format.id === 'Custom' ? parseInt(setup.customOvers) : format.overs;
    onStart({ ...setup, overs: finalOvers, type: format.name });
  };

  return (
    <div className="container animate-fade-in-up" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={onBack}
          className="glass"
          style={{ 
            padding: '0.8rem', 
            borderRadius: '16px',
            color: 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'var(--glass-hover-bg)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'var(--glass-bg)'}
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            <span style={{ color: 'var(--primary)' }}>{format.name}</span> Setup
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500 }}>
            Enter team and starting player details
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
          {format.id === 'Custom' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overs</label>
              <input 
                type="number" 
                min="1"
                max="100"
                value={setup.customOvers} 
                onChange={e => setSetup({...setup, customOvers: e.target.value})}
                className="glass"
                style={{ width: '100%', padding: '1.2rem', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 800, background: 'var(--input-bg)', border: '1px solid var(--primary)' }}
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Players Per Team</label>
            <input 
              type="number" 
              min="2"
              max="20"
              value={setup.playersPerTeam} 
              onChange={e => setSetup({...setup, playersPerTeam: e.target.value})}
              className="glass"
              style={{ width: '100%', padding: '1.2rem', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 800, background: 'var(--input-bg)', border: '1px solid var(--secondary)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team A</label>
            <input 
              type="text" 
              value={setup.teamA} 
              onChange={e => setSetup({...setup, teamA: e.target.value})}
              className="glass"
              style={{ width: '100%', padding: '1.2rem', color: 'var(--text)', fontSize: '1.1rem', background: 'var(--input-bg)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Team B</label>
            <input 
              type="text" 
              value={setup.teamB} 
              onChange={e => setSetup({...setup, teamB: e.target.value})}
              className="glass"
              style={{ width: '100%', padding: '1.2rem', color: 'var(--text)', fontSize: '1.1rem', background: 'var(--input-bg)' }}
            />
          </div>
        </div>



        <button 
          type="submit"
          className="flex-center"
          style={{ 
            marginTop: '1rem',
            padding: '1.5rem', 
            borderRadius: '1.25rem', 
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
            color: 'var(--text)', 
            fontWeight: 800,
            fontSize: '1.25rem',
            gap: '1rem',
            boxShadow: '0 10px 30px -10px rgba(242, 108, 35, 0.5)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 15px 35px -10px rgba(242, 108, 35, 0.7)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(242, 108, 35, 0.5)';
          }}
        >
          <Play fill="currentColor" size={24} /> NEXT: TO TOSS
        </button>
      </form>
    </div>
  );
};

export default SetupScreen;
