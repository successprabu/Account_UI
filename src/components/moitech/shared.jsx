import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Box, IconButton, InputAdornment, List, ListItemButton, Paper, TextField, Tooltip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';

/** True when the browser can turn speech into text (Chrome / Edge / Android). */
export const canUseVoice = () => typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

/**
 * Voice input for several fields. toggle(field, onText) starts listening for that field
 * (or stops if it is already listening); onText receives what was said.
 */
/** Speech recognition language for the app language (Tamil, Hindi, Telugu, Kannada, Malayalam, else English). */
export const speechLang = (language) => ({ ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN' }[String(language || 'en').split('-')[0]] || 'en-IN');

export const useVoice = (language = 'en') => {
  const [field, setField] = useState(null);
  const recRef = useRef(null);
  const stop = useCallback(() => {
    recRef.current?.stop();
    setField(null);
  }, []);
  const toggle = useCallback(
    (name, onText) => {
      if (field === name) {
        stop();
        return;
      }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      recRef.current?.stop();
      const rec = new SR();
      rec.lang = speechLang(language);
      rec.onresult = (e) => onText(e.results[0][0].transcript);
      rec.onend = () => setField((f) => (f === name ? null : f));
      recRef.current = rec;
      setField(name);
      rec.start();
    },
    [field, language, stop]
  );
  useEffect(() => () => recRef.current?.stop(), []);
  return { field, toggle, stop };
};

const SUGGEST_LANGS = new Set(['ta', 'hi', 'ml', 'te', 'kn']);

/**
 * Spelling suggestions: English letters → words in the user's language (Google Input Tools).
 * Only active when `enabled` and the language is Tamil, Hindi, Malayalam, Telugu or Kannada.
 * handleKey(e) returns true when it used the key (arrows, Enter on a suggestion, Escape).
 */
export const useSuggestions = (enabled, language, onPick) => {
  const [list, setList] = useState([]);
  const [field, setField] = useState(null);
  const [index, setIndex] = useState(-1);
  const seq = useRef(0);
  const clear = useCallback(() => {
    seq.current += 1;
    setList([]);
    setField(null);
    setIndex(-1);
  }, []);
  const lookup = useCallback(
    async (name, text) => {
      const lang = String(language || 'en').split('-')[0];
      if (!enabled || !String(text).trim() || !SUGGEST_LANGS.has(lang)) {
        clear();
        return;
      }
      const mine = ++seq.current;
      try {
        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${lang}-t-i0-und&num=5`;
        const data = await (await fetch(url)).json();
        if (mine !== seq.current) return; // a newer lookup is on its way
        const words = data && Array.isArray(data[1]) && data[1][0] && Array.isArray(data[1][0][1]) ? data[1][0][1] : [];
        setList(words);
        setField(words.length ? name : null);
        setIndex(-1);
      } catch (e) {
        if (mine === seq.current) clear();
      }
    },
    [enabled, language, clear]
  );
  const pick = useCallback(
    (word) => {
      if (field) onPick(field, word);
      clear();
    },
    [field, onPick, clear]
  );
  const handleKey = (e) => {
    if (!list.length) return false;
    if (e.key === 'ArrowDown') setIndex((i) => Math.min(i + 1, list.length - 1));
    else if (e.key === 'ArrowUp') setIndex((i) => Math.max(i - 1, -1));
    else if (e.key === 'Enter' && index >= 0) pick(list[index]);
    else if (e.key === 'Escape') clear();
    else return false;
    e.preventDefault();
    return true;
  };
  const propsFor = (name) => ({ suggestions: field === name ? list : [], selectedIndex: index, onPick: pick });
  return { lookup, clear, handleKey, propsFor, field };
};

export const rupees = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

/** A number that counts to its new value. */
export const AnimatedNumber = ({ value, format = rupees }) => {
  const mv = useMotionValue(Number(value) || 0);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  useEffect(() => {
    const c = animate(mv, Number(value) || 0, { duration: 0.5, ease: 'easeOut' });
    return c.stop;
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
};

/**
 * Text field used on the moi entry screens: a mic button for voice input and a
 * list of spelling suggestions (e.g. English letters → Tamil) under the field.
 *
 * suggestions: array shown under this field (pass [] when another field is active)
 * selectedIndex: highlighted suggestion (arrow keys), onPick(suggestion)
 * recording: this field is listening; onMic toggles it
 */
export const EntryField = ({ suggestions = [], selectedIndex = -1, onPick, recording = false, onMic, voiceLabel, InputProps, sx, ...props }) => {
  const theme = useTheme();
  const voice = onMic && canUseVoice();
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TextField
        fullWidth
        {...props}
        InputProps={{
          ...InputProps,
          endAdornment: voice ? (
            <InputAdornment position="end">
              <Tooltip title={recording ? 'Stop listening' : 'Speak'}>
                <IconButton
                  onClick={onMic}
                  edge="end"
                  aria-label={`${recording ? 'Stop voice input for' : 'Voice input for'} ${voiceLabel || props.label}`}
                  aria-pressed={recording}
                  sx={{
                    color: recording ? 'error.main' : 'text.secondary',
                    ...(recording && {
                      bgcolor: alpha(theme.palette.error.main, 0.12),
                      animation: 'moiPulse 1.2s ease-in-out infinite',
                      '@keyframes moiPulse': {
                        '0%, 100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.4)}` },
                        '50%': { boxShadow: `0 0 0 8px ${alpha(theme.palette.error.main, 0)}` },
                      },
                    }),
                  }}
                >
                  {recording ? <MicIcon /> : <MicNoneIcon />}
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : InputProps?.endAdornment,
        }}
      />
      <AnimatePresence>
        {suggestions.length > 0 && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            elevation={8}
            sx={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', zIndex: 20, overflow: 'hidden', borderRadius: 2 }}
          >
            <List dense disablePadding role="listbox" aria-label="Suggestions">
              {suggestions.map((s, i) => (
                <ListItemButton
                  key={`${s}-${i}`}
                  selected={i === selectedIndex}
                  role="option"
                  aria-selected={i === selectedIndex}
                  // mousedown so the click lands before the field loses focus
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onPick?.(s);
                  }}
                  sx={{ py: 1, fontSize: 16 }}
                >
                  {s}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </AnimatePresence>
    </Box>
  );
};
