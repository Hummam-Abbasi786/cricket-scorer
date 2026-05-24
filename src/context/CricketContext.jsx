import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { speak } from '../utils/voiceRecognition';

const CricketContext = createContext();

export const useCricket = () => useContext(CricketContext);

export const CricketProvider = ({ children }) => {
  const [matchConfig, setMatchConfig] = useState(null);
  const [currentMatch, setCurrentMatch] = useState(() => {
    const saved = sessionStorage.getItem('currentMatch');
    return saved ? JSON.parse(saved) : null;
  });

  const [players, setPlayers] = useState({
    striker: '',
    nonStriker: '',
    bowler: '',
  });

  const [selectionRequired, setSelectionRequired] = useState(null);
  const [selectionQueue, setSelectionQueue] = useState([]); // queued prompts

  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentMatch) {
      sessionStorage.setItem('currentMatch', JSON.stringify(currentMatch));
    }
  }, [currentMatch]);

  // Selection prompts are now only triggered by addScore (wickets/overs)
  // or explicitly via the UI

  const startMatch = (config) => {
    const initialMatch = {
      teamA: config.teamA,
      teamB: config.teamB,
      maxOvers: config.overs,
      playersPerTeam: config.playersPerTeam,
      innings: 1,
      battingTeam: config.battingTeam || config.teamA,
      score: 0,
      wickets: 0,
      balls: 0,
      isFreeHit: false,
      overHistory: [],
      batsmenStats: {},
      bowlerStats: {},
      status: 'playing',
    };
    setMatchConfig(config);
    setCurrentMatch(initialMatch);
    setPlayers({ 
      striker: config.striker || '', 
      nonStriker: config.nonStriker || '', 
      bowler: config.bowler || '' 
    });
    setHistory([]);
    
    if (!config.striker && !config.nonStriker && !config.bowler) {
      const activeBatting = config.battingTeam || config.teamA;
      const activeBowling = activeBatting === config.teamA ? config.teamB : config.teamA;
      setSelectionQueue([
        { type: 'nonStriker', label: `${activeBatting} — Non-Striker` },
        { type: 'bowler',     label: `${activeBowling} — Opening Bowler` },
      ]);
      setSelectionRequired({ type: 'striker', label: `${activeBatting} — Opening Batsman` });
    } else {
      setSelectionRequired(null);
    }
  };

  const resolveSelection = (name) => {
    if (!selectionRequired) return;
    const type = selectionRequired.type;
    
    setPlayers(prev => {
      const next = { ...prev };
      if (type === 'striker' || type === 'newBatsman') next.striker = name;
      else if (type === 'nonStriker') next.nonStriker = name;
      else if (type === 'bowler' || type === 'newBowler') next.bowler = name;
      return next;
    });
    
    // Pop the next prompt from the queue if there is one
    setSelectionQueue(prev => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        setSelectionRequired(next);
        return rest;
      }
      setSelectionRequired(null);
      return [];
    });
  };

  const rotateStrike = useCallback(() => {
    setPlayers(prev => ({
      ...prev,
      striker: prev.nonStriker,
      nonStriker: prev.striker,
    }));
  }, []);

  const addScore = (runs, type = 'normal') => {
    if (!currentMatch || currentMatch.status !== 'playing' || selectionRequired) return;

    setHistory(prev => [...prev, JSON.parse(JSON.stringify({ match: currentMatch, players }))]);

    let commentary = "";
    if (type === 'normal') {
      if (runs === 0) commentary = "Solid defense, no run.";
      else if (runs === 1) commentary = "Pushed for a quick single.";
      else if (runs === 2) commentary = "Good running, they get two.";
      else if (runs === 3) commentary = "Great effort in the deep, they run three.";
      else if (runs === 4) commentary = "Shot! That races away to the boundary for four.";
      else if (runs === 6) commentary = "Huge! Smashed for a magnificent six!";
    } else if (type === 'wide') {
      commentary = "Umpire signals wide. Extra run.";
    } else if (type === 'noball') {
      commentary = "No ball! Extra run added.";
    } else if (type === 'runout') {
      commentary = "Run out! Excellent fielding.";
    } else if (type === 'wicket') {
      if (currentMatch.isFreeHit) {
        speak("Free hit! Batsman cannot be out. Say run out if they were run out.");
        return;
      }
      commentary = "Wicket! He's gone! Brilliant breakthrough.";
    }

    const ballData = { runs, type, striker: players.striker, bowler: players.bowler, commentary };
    
    // Create a deep-ish clone for safe updates
    const newMatch = { 
      ...currentMatch,
      batsmenStats: { ...currentMatch.batsmenStats },
      bowlerStats: { ...currentMatch.bowlerStats },
      overHistory: [...currentMatch.overHistory, ballData]
    };

    if (type === 'normal') {
      newMatch.score += runs;
      newMatch.balls += 1;
      
      // Update Batsman Stats (Immutable)
      const currentBStat = newMatch.batsmenStats[players.striker] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
      newMatch.batsmenStats[players.striker] = {
        ...currentBStat,
        runs: currentBStat.runs + runs,
        balls: currentBStat.balls + 1,
        fours: (currentBStat.fours || 0) + (runs === 4 ? 1 : 0),
        sixes: (currentBStat.sixes || 0) + (runs === 6 ? 1 : 0)
      };

      // Update Bowler Stats (Immutable)
      const currentBoStat = newMatch.bowlerStats[players.bowler] || { runs: 0, balls: 0, wickets: 0 };
      newMatch.bowlerStats[players.bowler] = {
        ...currentBoStat,
        runs: currentBoStat.runs + runs,
        balls: currentBoStat.balls + 1
      };

      if (runs % 2 !== 0) rotateStrike();
      
      if (newMatch.balls % 6 === 0) {
        rotateStrike();
        if (newMatch.balls < newMatch.maxOvers * 6) {
          speak('Over complete. Please select a new bowler.');
          setSelectionRequired({ type: 'newBowler' });
        }
      }
      newMatch.isFreeHit = false;
    } else if (type === 'wide') {
      newMatch.score += (runs + 1);
      const currentBoStat = newMatch.bowlerStats[players.bowler] || { runs: 0, balls: 0, wickets: 0 };
      newMatch.bowlerStats[players.bowler] = { ...currentBoStat, runs: currentBoStat.runs + (runs + 1) };
    } else if (type === 'noball') {
      newMatch.score += (runs + 1);
      const currentBoStat = newMatch.bowlerStats[players.bowler] || { runs: 0, balls: 0, wickets: 0 };
      newMatch.bowlerStats[players.bowler] = { ...currentBoStat, runs: currentBoStat.runs + (runs + 1) };
      speak('Free Hit!');
      newMatch.isFreeHit = true;
    } else if (type === 'runout') {
      newMatch.wickets += 1;
      newMatch.balls += 1;
      newMatch.score += runs;
      
      const currentBStat = newMatch.batsmenStats[players.striker] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
      newMatch.batsmenStats[players.striker] = { ...currentBStat, runs: currentBStat.runs + runs, balls: currentBStat.balls + 1 };
      const currentBoStat = newMatch.bowlerStats[players.bowler] || { runs: 0, balls: 0, wickets: 0 };
      newMatch.bowlerStats[players.bowler] = { ...currentBoStat, runs: currentBoStat.runs + runs, balls: currentBoStat.balls + 1 };

      if (runs % 2 !== 0) rotateStrike();
      newMatch.isFreeHit = false;

      if (newMatch.balls % 6 === 0) {
        rotateStrike();
        if (newMatch.balls < newMatch.maxOvers * 6) {
          speak('Over complete. Please select a new bowler.');
          setSelectionRequired({ type: 'newBowler' });
        }
      }

      if (newMatch.wickets >= newMatch.playersPerTeam - 1) {
        handleInningsEnd(newMatch);
      } else {
        setSelectionRequired({ type: 'newBatsman' });
      }
    } else if (type === 'wicket') {
      newMatch.wickets += 1;
      newMatch.balls += 1;
      newMatch.isFreeHit = false;
      
      // Update Batsman Balls (Immutable)
      const currentBStat = newMatch.batsmenStats[players.striker] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
      newMatch.batsmenStats[players.striker] = {
        ...currentBStat,
        balls: currentBStat.balls + 1
      };

      // Update Bowler Stats (Immutable)
      const currentBoStat = newMatch.bowlerStats[players.bowler] || { runs: 0, balls: 0, wickets: 0 };
      newMatch.bowlerStats[players.bowler] = {
        ...currentBoStat,
        balls: currentBoStat.balls + 1,
        wickets: currentBoStat.wickets + 1
      };

      if (newMatch.wickets >= newMatch.playersPerTeam - 1) {
        handleInningsEnd(newMatch);
      } else {
        setSelectionRequired({ type: 'newBatsman' });
      }
    }

    // Check Case: Innings 2 Win
    if (newMatch.innings === 2 && newMatch.target && newMatch.score >= newMatch.target) {
      newMatch.status = 'finished';
      newMatch.winner = newMatch.teamB;
      speak(`Hooray! ${newMatch.teamB} win the match! Congratulations!`);
    }

    // Check Case: Innings End due to overs
    if (newMatch.status !== 'finished' && newMatch.balls >= newMatch.maxOvers * 6) {
      handleInningsEnd(newMatch);
    }

    setCurrentMatch(newMatch);
  };

  const handleInningsEnd = (match) => {
    if (match.innings === 1) {
      speak(`First innings complete. Target is ${match.score + 1}.`);
      match.target = match.score + 1;
      match.status = 'inningsBreak';
      
      // Preserve first innings data for the scorecard
      match.innings1Stats = {
        score: match.score,
        wickets: match.wickets,
        balls: match.balls,
        battingTeam: match.battingTeam,
        batsmenStats: JSON.parse(JSON.stringify(match.batsmenStats)),
        bowlerStats: JSON.parse(JSON.stringify(match.bowlerStats)),
        overHistory: [...match.overHistory]
      };
    } else {
      match.status = 'finished';
      if (match.score >= match.target) {
        match.winner = match.teamB;
      } else if (match.score < match.target - 1) {
        match.winner = match.teamA;
      } else {
        match.winner = 'Draw';
      }
      
      if (match.winner === 'Draw') {
        speak("It's a draw!");
      } else {
        speak(`Hooray! ${match.winner} win the match! Congratulations!`);
      }
    }
  };

  const startSecondInnings = () => {
    if (!currentMatch) return;
    
    setCurrentMatch(prev => {
      const next = { ...prev };
      next.innings = 2;
      next.score = 0;
      next.wickets = 0;
      next.balls = 0;
      next.isFreeHit = false;
      next.battingTeam = matchConfig.teamB;
      next.overHistory = [];
      next.batsmenStats = {};
      next.bowlerStats = {};
      next.status = 'playing';
      return next;
    });

    setPlayers({ striker: '', nonStriker: '', bowler: '' });
    setSelectionQueue([
      { type: 'nonStriker', label: `${matchConfig.teamB} — Non-Striker` },
      { type: 'bowler',     label: `${matchConfig.teamA} — Opening Bowler` },
    ]);
    setSelectionRequired({ type: 'striker', label: `${matchConfig.teamB} — Opening Batsman` });
  };

  const finishMatch = () => {
    setCurrentMatch(prev => ({ ...prev, status: 'finished' }));
  };

  const resumeMatch = () => {
    setCurrentMatch(prev => ({ ...prev, status: 'playing' }));
  };

  const undo = () => {
    if (history.length === 0) return;
    const { match, players: prevPlayers } = history[history.length - 1];
    setHistory(prevHist => prevHist.slice(0, -1));
    setCurrentMatch(match);
    setPlayers(prevPlayers);
    setSelectionRequired(null);
    setSelectionQueue([]);
  };

  const resetMatch = () => {
    setCurrentMatch(null);
    setMatchConfig(null);
    setPlayers({ striker: '', nonStriker: '', bowler: '' });
    setSelectionRequired(null);
    setSelectionQueue([]);
    sessionStorage.removeItem('currentMatch');
  };

  const value = {
    currentMatch,
    players,
    selectionRequired,
    setPlayers,
    resolveSelection,
    startMatch,
    addScore,
    undo,
    rotateStrike,
    finishMatch,
    resumeMatch,
    resetMatch,
    startSecondInnings
  };

  return <CricketContext.Provider value={value}>{children}</CricketContext.Provider>;
};
