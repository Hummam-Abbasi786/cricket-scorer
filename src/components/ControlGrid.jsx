import React from 'react';
import { useCricket } from '../context/CricketContext';
import { Skull, AlertCircle, PlusCircle } from 'lucide-react';

const ControlGrid = ({ onScore }) => {
  const runs = [0, 1, 2, 3, 4, 6];
  const extras = [
    { label: 'Wide', type: 'wide', icon: <AlertCircle size={24} /> },
    { label: 'No Ball', type: 'noball', icon: <PlusCircle size={24} /> },
    { label: 'Wicket', type: 'wicket', icon: <Skull size={24} />, color: 'var(--danger)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Runs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem' 
      }}>
        {runs.map(run => (
          <button
            key={run}
            onClick={() => onScore(run)}
            style={{
              height: '100px',
              borderRadius: '1.5rem',
              fontSize: '2.5rem',
              fontWeight: 900,
              background: run === 4 || run === 6 ? 'var(--secondary)' : 'var(--card-bg)',
              color: 'var(--text)',
              border: 'none',
              boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.3)',
              transition: 'var(--transition)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {run}
          </button>
        ))}
      </div>

      {/* Extras Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem' 
      }}>
        {extras.map(extra => (
          <button
            key={extra.label}
            onClick={() => onScore(0, extra.type)}
            style={{
              height: '90px',
              borderRadius: '1.5rem',
              fontSize: '0.875rem',
              fontWeight: 700,
              background: extra.color || 'var(--btn-bg)',
              color: 'var(--text)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'var(--transition)'
            }}
          >
            {extra.icon}
            <div style={{ fontSize: '1rem' }}>{extra.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ControlGrid;
