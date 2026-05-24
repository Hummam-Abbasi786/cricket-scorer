import React, { useEffect, useRef } from 'react';
import { Trophy, Zap, Flame, Rocket, Settings } from 'lucide-react';
import { speak } from '../utils/voiceRecognition';

/* ─── Particle Canvas ────────────────────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#F26C23' : '#009FA0',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
};

/* ─── Format Selection ───────────────────────────────────────────── */
const FormatSelection = ({ onSelect }) => {
  const formats = [
    {
      id: 'ODI',
      name: '50 Over Match',
      overs: 50,
      icon: <Trophy size={28} />,
      desc: 'The classic long format — a complete test of skill & stamina.',
      color: '#F26C23',
      gradient: 'linear-gradient(135deg, #F26C23 0%, #d95d18 100%)',
    },
    {
      id: 'T20',
      name: 'T20 Match',
      overs: 20,
      icon: <Zap size={28} />,
      desc: 'Fast-paced action, big boundaries, crowd going wild!',
      color: '#009FA0',
      gradient: 'linear-gradient(135deg, #009FA0 0%, #006f70 100%)',
    },
    {
      id: 'T10',
      name: 'T10 Match',
      overs: 10,
      icon: <Flame size={28} />,
      desc: 'Intense blast of energy — ten overs of pure thrill.',
      color: '#facc15',
      gradient: 'linear-gradient(135deg, #facc15 0%, #d4a800 100%)',
    },
    {
      id: 'T5',
      name: 'T5 Match',
      overs: 5,
      icon: <Rocket size={28} />,
      desc: 'Sprint to victory — five overs of mayhem!',
      color: '#f87171',
      gradient: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)',
    },
    {
      id: 'Custom',
      name: 'Custom Match',
      overs: '?',
      icon: <Settings size={28} />,
      desc: 'Set your own overs and rules — your match, your way.',
      color: '#a78bfa',
      gradient: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    },
  ];

  return (
    <div className="fs-wrapper">
      {/* ── Full-screen stadium background ── */}
      <div className="fs-bg" />

      {/* ── Overlay gradient for readability ── */}
      <div className="fs-overlay" />

      {/* ── Particle layer ── */}
      <ParticleCanvas />

      {/* ── Scrollable content ── */}
      <div className="fs-content">

        {/* HERO */}
        <div className="fs-hero animate-fade-in-up">
          {/* Cricket ball icon */}
          <div className="fs-ball-ring">
            <span className="fs-ball">🏏</span>
          </div>

          <h1 className="fs-title">
            <span className="fs-title-top">BOL OR LIKH</span>
            <span className="fs-title-sub">Smart Cricket Scorer</span>
          </h1>

          <p className="fs-tagline">
            Voice-powered • Real-time • Bilingual scoring experience
          </p>

          <div className="fs-badge-row">
            <span className="fs-badge">🎙 Voice Commands</span>
            <span className="fs-badge">📊 Live Stats</span>
            <span className="fs-badge">🏆 Urdu &amp; English</span>
          </div>
        </div>

        {/* FORMAT LABEL */}
        <div className="fs-section-label">
          <div className="fs-section-line" />
          <span>Choose Your Format</span>
          <div className="fs-section-line" />
        </div>

        {/* FORMAT CARDS GRID */}
        <div className="fs-grid">
          {formats.map((fmt, i) => (
            <button
              key={fmt.id}
              className={`fs-card ${fmt.id === 'Custom' ? 'fs-card--wide' : ''}`}
              style={{ '--card-color': fmt.color, animationDelay: `${i * 0.08}s` }}
              onClick={() => {
                speak(`Let's play ${fmt.id === 'ODI' ? '50 Over' : fmt.name}`);
                onSelect(fmt);
              }}
            >
              {/* Glow border */}
              <div className="fs-card-glow" style={{ background: fmt.gradient }} />

              {/* Icon badge */}
              <div className="fs-card-icon" style={{ background: `${fmt.color}22`, borderColor: `${fmt.color}55`, color: fmt.color }}>
                {fmt.icon}
              </div>

              {/* Text */}
              <div className="fs-card-body">
                <div className="fs-card-name">{fmt.name}</div>
                <div className="fs-card-overs" style={{ color: fmt.color }}>
                  {fmt.overs} {fmt.overs === '?' ? 'OVERS' : 'OVERS'}
                </div>
                <div className="fs-card-desc">{fmt.desc}</div>
              </div>

              {/* Arrow */}
              <div className="fs-card-arrow" style={{ color: fmt.color }}>›</div>
            </button>
          ))}
        </div>

        {/* FOOTER */}
        <div className="fs-footer">
          Made with ❤️ for cricket lovers • Powered by voice AI
        </div>
      </div>
    </div>
  );
};

export default FormatSelection;
