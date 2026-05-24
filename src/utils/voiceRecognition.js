// ─── Browser Support Check ──────────────────────────────────────────────────
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// iOS Safari has never supported SpeechRecognition (even in Chrome for iOS).
// We detect this early so callers can show a proper error message.
const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream;
export const isVoiceSupported = !!SpeechRecognitionAPI && !isIOS;

let recognition = null;

// ─── State Machine ───────────────────────────────────────────────────────────
const STATE = {
  IDLE: 'IDLE',
  STARTING: 'STARTING',
  LISTENING: 'LISTENING',
  STOPPING: 'STOPPING',
};

let currentState = STATE.IDLE;
let autoRestart = false;
let currentCallback = null;
let currentErrorCallback = null;
let currentTranscriptCallback = null;
let pendingStart = false;
let processedIndices = new Set();

// Pre-sorted once at module load — longest keys first so "six runs" beats "six"
// This avoids re-sorting on every onresult event (was a hidden latency source)
let sortedCommandKeys = [];

// ─── Text normaliser ─────────────────────────────────────────────────────────
const normalizeTranscript = (text) =>
  text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// ─── Text-to-Speech ──────────────────────────────────────────────────────────
export const speak = (text, onComplete) => {
  if (!window.speechSynthesis) {
    if (onComplete) onComplete();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.3;  // faster speech = less time blocking the mic
  utterance.pitch = 1.1;

  let called = false;
  const handleCallback = () => {
    if (!called) {
      called = true;
      if (onComplete) onComplete();
    }
  };

  utterance.onend = handleCallback;
  utterance.onerror = handleCallback;
  // Safety fallback: 1.2s — at rate=1.3 even "Removing last ball" finishes well within this
  setTimeout(handleCallback, 1200);

  window.speechSynthesis.speak(utterance);
};

// ─── Recognition setup ───────────────────────────────────────────────────────
if (SpeechRecognitionAPI && !isIOS) {
  recognition = new SpeechRecognitionAPI();

  // KEY FIX: Keep continuous=true on ALL platforms including mobile.
  // Previously this was false on mobile, which caused the mic to stop after
  // every single utterance and miss subsequent commands during the restart gap.
  // Modern Chrome for Android fully supports continuous mode.
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('Voice: started');
    currentState = STATE.LISTENING;
    pendingStart = false;
    processedIndices.clear();
  };

  recognition.onend = () => {
    console.log('Voice: ended');
    const wasStopping = currentState === STATE.STOPPING;
    currentState = STATE.IDLE;

    if (pendingStart) {
      // A start was requested while we were busy — honour it now
      setTimeout(safeStart, 50);
    } else if (autoRestart && !wasStopping) {
      // Auto-recover from unexpected drops (network glitch, timeout, etc.)
      setTimeout(safeStart, 50); // reduced from 150ms → 50ms
    }
  };

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const rawTranscript = event.results[i][0].transcript;
      const transcript = normalizeTranscript(rawTranscript);

      // Live transcript display
      if (currentTranscriptCallback && rawTranscript.trim()) {
        currentTranscriptCallback(rawTranscript);
      }

      if (processedIndices.has(i)) continue;

      for (const key of sortedCommandKeys) {
        const regex = new RegExp(`\\b${key}\\b`, 'i');
        if (regex.test(transcript)) {
          console.log(`Voice match: "${rawTranscript}" → "${key}"`);
          processedIndices.add(i);

          const shouldRestart = autoRestart;
          autoRestart = false;

          // Stop mic so TTS doesn't echo into the microphone
          if (recognition) {
            try { recognition.stop(); } catch (e) { /* ignore */ }
          }

          // SPEED FIX: Fire the score callback immediately — don't wait for TTS.
          // Then restart the mic after 400ms (enough silence to avoid echo).
          // TTS plays in the background concurrently — it no longer blocks the mic.
          // Old behaviour: stop → TTS plays fully (up to 2s) → restart
          // New behaviour: stop → score registered instantly → restart after 400ms
          //                TTS plays in parallel during those 400ms
          if (currentCallback) {
            currentCallback(COMMANDS[key].runs, COMMANDS[key].type, transcript);
          }

          speak(COMMANDS[key].msg); // fire-and-forget, no callback needed

          if (shouldRestart) {
            setTimeout(() => {
              autoRestart = true;
              safeStart();
            }, 400); // short enough to feel instant, long enough to avoid echo
          }

          break;
        }
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
    const fatalErrors = ['not-allowed', 'audio-capture', 'not-supported', 'service-not-allowed'];

    if (fatalErrors.includes(event.error)) {
      autoRestart = false;
      if (currentErrorCallback) currentErrorCallback(event.error);
      currentState = STATE.IDLE;
    } else {
      // 'no-speech', 'aborted', 'network' — transient, will auto-restart via onend
      console.log(`Voice: transient error "${event.error}" — will retry`);
    }
  };
}

// ─── safeStart ───────────────────────────────────────────────────────────────
const safeStart = () => {
  if (!recognition) return;

  if (currentState !== STATE.IDLE) {
    console.log('Voice: busy, queueing start');
    pendingStart = true;
    return;
  }

  try {
    currentState = STATE.STARTING;
    recognition.start();
  } catch (err) {
    console.error('Voice: safeStart failed', err);
    currentState = STATE.IDLE;
    if (autoRestart) {
      setTimeout(safeStart, 200); // reduced from 500ms → 200ms
    } else {
      pendingStart = false;
    }
  }
};

// ─── Commands ────────────────────────────────────────────────────────────────
const COMMANDS = {
  'no ball':       { runs: 0, type: 'noball',  msg: 'No ball' },
  'noball':        { runs: 0, type: 'noball',  msg: 'No ball' },
  'no-ball':       { runs: 0, type: 'noball',  msg: 'No ball' },

  'wide ball':     { runs: 0, type: 'wide',    msg: 'Wide' },
  'wideball':      { runs: 0, type: 'wide',    msg: 'Wide' },
  'wide':          { runs: 0, type: 'wide',    msg: 'Wide' },
  'white':         { runs: 0, type: 'wide',    msg: 'Wide' },
  'white ball':    { runs: 0, type: 'wide',    msg: 'Wide' },

  'wicket':        { runs: 0, type: 'wicket',  msg: 'Wicket!' },
  'out':           { runs: 0, type: 'wicket',  msg: 'Out!' },
  'gone':          { runs: 0, type: 'wicket',  msg: 'Wicket!' },
  'caught':        { runs: 0, type: 'wicket',  msg: 'Out!' },
  'bold':          { runs: 0, type: 'wicket',  msg: 'Bowled!' },
  'bowled':        { runs: 0, type: 'wicket',  msg: 'Bowled!' },
  'clean bowled':  { runs: 0, type: 'wicket',  msg: 'Bowled!' },
  'out out':       { runs: 0, type: 'wicket',  msg: 'Out!' },
  'wicket out':    { runs: 0, type: 'wicket',  msg: 'Out!' },

  'run out':       { runs: 0, type: 'runout',  msg: 'Run out!' },
  'runout':        { runs: 0, type: 'runout',  msg: 'Run out!' },
  'lbw':           { runs: 0, type: 'wicket',  msg: 'Out!' },

  'six runs':      { runs: 6, type: 'normal',  msg: 'Six!' },
  'six run':       { runs: 6, type: 'normal',  msg: 'Six!' },
  '6 runs':        { runs: 6, type: 'normal',  msg: 'Six!' },
  '6 run':         { runs: 6, type: 'normal',  msg: 'Six!' },
  'sixer':         { runs: 6, type: 'normal',  msg: 'Maximum!' },
  'six':           { runs: 6, type: 'normal',  msg: 'Six!' },
  '6':             { runs: 6, type: 'normal',  msg: 'Six!' },
  'sex':           { runs: 6, type: 'normal',  msg: 'Six!' },
  'secs':          { runs: 6, type: 'normal',  msg: 'Six!' },
  'sicks':         { runs: 6, type: 'normal',  msg: 'Six!' },
  'sick':          { runs: 6, type: 'normal',  msg: 'Six!' },
  'sics':          { runs: 6, type: 'normal',  msg: 'Six!' },
  '6s':            { runs: 6, type: 'normal',  msg: 'Six!' },
  'sixes':         { runs: 6, type: 'normal',  msg: 'Six!' },
  'sic':           { runs: 6, type: 'normal',  msg: 'Six!' },
  'fix':           { runs: 6, type: 'normal',  msg: 'Six!' },
  'chakka':        { runs: 6, type: 'normal',  msg: 'Six!' },
  'chaka':         { runs: 6, type: 'normal',  msg: 'Six!' },
  'che':           { runs: 6, type: 'normal',  msg: 'Six!' },

  'four runs':     { runs: 4, type: 'normal',  msg: 'Four!' },
  'four run':      { runs: 4, type: 'normal',  msg: 'Four!' },
  '4 runs':        { runs: 4, type: 'normal',  msg: 'Four!' },
  '4 run':         { runs: 4, type: 'normal',  msg: 'Four!' },
  'boundary':      { runs: 4, type: 'normal',  msg: 'Four!' },
  'four':          { runs: 4, type: 'normal',  msg: 'Four!' },
  '4':             { runs: 4, type: 'normal',  msg: 'Four!' },
  'for':           { runs: 4, type: 'normal',  msg: 'Four!' },
  'fore':          { runs: 4, type: 'normal',  msg: 'Four!' },
  'faur':          { runs: 4, type: 'normal',  msg: 'Four!' },
  'chouka':        { runs: 4, type: 'normal',  msg: 'Four!' },
  'choka':         { runs: 4, type: 'normal',  msg: 'Four!' },
  'choa':          { runs: 4, type: 'normal',  msg: 'Four!' },
  'char':          { runs: 4, type: 'normal',  msg: 'Four!' },
  'chaar':         { runs: 4, type: 'normal',  msg: 'Four!' },

  'three runs':    { runs: 3, type: 'normal',  msg: 'Three runs' },
  'three run':     { runs: 3, type: 'normal',  msg: 'Three runs' },
  '3 runs':        { runs: 3, type: 'normal',  msg: 'Three runs' },
  '3 run':         { runs: 3, type: 'normal',  msg: 'Three runs' },
  'three':         { runs: 3, type: 'normal',  msg: 'Three runs' },
  '3':             { runs: 3, type: 'normal',  msg: 'Three runs' },
  'triple':        { runs: 3, type: 'normal',  msg: 'Three' },
  'tree':          { runs: 3, type: 'normal',  msg: 'Three' },
  'thee':          { runs: 3, type: 'normal',  msg: 'Three' },
  'teen':          { runs: 3, type: 'normal',  msg: 'Three' },

  'two runs':      { runs: 2, type: 'normal',  msg: 'Two runs' },
  'two run':       { runs: 2, type: 'normal',  msg: 'Two runs' },
  '2 runs':        { runs: 2, type: 'normal',  msg: 'Two runs' },
  '2 run':         { runs: 2, type: 'normal',  msg: 'Two runs' },
  'two':           { runs: 2, type: 'normal',  msg: 'Two runs' },
  '2':             { runs: 2, type: 'normal',  msg: 'Two runs' },
  'double':        { runs: 2, type: 'normal',  msg: 'Two' },
  'to runs':       { runs: 2, type: 'normal',  msg: 'Two' },
  'too runs':      { runs: 2, type: 'normal',  msg: 'Two' },
  'to':            { runs: 2, type: 'normal',  msg: 'Two' },
  'too':           { runs: 2, type: 'normal',  msg: 'Two' },
  'do':            { runs: 2, type: 'normal',  msg: 'Two' },
  'duggi':         { runs: 2, type: 'normal',  msg: 'Two' },
  'duri':          { runs: 2, type: 'normal',  msg: 'Two' },

  'one runs':      { runs: 1, type: 'normal',  msg: 'One run' },
  'one run':       { runs: 1, type: 'normal',  msg: 'One run' },
  '1 runs':        { runs: 1, type: 'normal',  msg: 'One run' },
  '1 run':         { runs: 1, type: 'normal',  msg: 'One run' },
  'one':           { runs: 1, type: 'normal',  msg: 'One run' },
  '1':             { runs: 1, type: 'normal',  msg: 'One run' },
  'single':        { runs: 1, type: 'normal',  msg: 'Single' },
  'won':           { runs: 1, type: 'normal',  msg: 'Single' },
  'on':            { runs: 1, type: 'normal',  msg: 'Single' },
  'wan':           { runs: 1, type: 'normal',  msg: 'Single' },
  'an':            { runs: 1, type: 'normal',  msg: 'Single' },
  'ek':            { runs: 1, type: 'normal',  msg: 'Single' },
  'run':           { runs: 1, type: 'normal',  msg: 'Single' },

  'zero':          { runs: 0, type: 'normal',  msg: 'Dot ball' },
  '0':             { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'dot':           { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'dotball':       { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'dot ball':      { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'no run':        { runs: 0, type: 'normal',  msg: 'No' },
  'no-run':        { runs: 0, type: 'normal',  msg: 'No' },
  'not run':       { runs: 0, type: 'normal',  msg: 'No' },
  'khali':         { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'ball':          { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'sifar':         { runs: 0, type: 'normal',  msg: 'Dot ball' },
  'shunya':        { runs: 0, type: 'normal',  msg: 'Dot ball' },

  'undo':          { runs: 0, type: 'undo',    msg: 'Removing last ball' },
  'back':          { runs: 0, type: 'undo',    msg: 'Removing last ball' },
};

// Populate the pre-sorted key list now that COMMANDS exists
sortedCommandKeys = Object.keys(COMMANDS).sort((a, b) => b.length - a.length);

// ─── Public API ──────────────────────────────────────────────────────────────
export const startListening = (onCommand, onError, onTranscript) => {
  if (!recognition) {
    if (onError) onError(isIOS ? 'ios-not-supported' : 'not-supported');
    return false;
  }
  currentCallback = onCommand;
  currentErrorCallback = onError;
  currentTranscriptCallback = onTranscript;
  autoRestart = true;
  pendingStart = true;
  safeStart();
  return true;
};

export const stopListening = () => {
  autoRestart = false;
  pendingStart = false;
  currentTranscriptCallback = null;
  if (recognition && (currentState === STATE.LISTENING || currentState === STATE.STARTING)) {
    currentState = STATE.STOPPING;
    recognition.stop();
  }
};
