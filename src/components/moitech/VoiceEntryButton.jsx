import { useEffect, useRef, useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import MicIcon from '@mui/icons-material/Mic';
import { parseVoiceEntry } from '../../api/moiPlus';
import { canUseVoice, speechLang } from './shared';
import { notify } from '../ui';
import { useTx } from '../../language/site';

/**
 * Voice-only entry: the helper says the whole receipt in one go ("காரைக்குடி முருகன் ஐயாயிரத்து ஒன்று"),
 * AI turns it into place, name and amount, and onFill(fields) puts them in the form to check and save.
 */
const VoiceEntryButton = ({ language, onFill, size = 'medium' }) => {
  const tx = useTx();
  const [state, setState] = useState('idle'); // idle | listening | thinking
  const rec = useRef(null);

  useEffect(() => () => rec.current?.abort?.(), []);
  if (!canUseVoice()) return null;

  const start = () => {
    if (state === 'listening') {
      rec.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = speechLang(language);
    r.interimResults = false;
    r.maxAlternatives = 1;
    let heard = '';
    r.onresult = (e) => {
      heard = Array.from(e.results).map((x) => x[0].transcript).join(' ');
    };
    r.onerror = () => setState('idle');
    r.onend = async () => {
      if (!heard.trim()) {
        setState('idle');
        return;
      }
      setState('thinking');
      const res = await parseVoiceEntry(heard, String(language || 'ta').split('-')[0]);
      setState('idle');
      if (!res.ok) {
        notify.error(tx(res.message));
        return;
      }
      onFill(res.data);
      const miss = (res.data.missing || []).map((m) => tx(m === 'village' ? 'Place' : m === 'name' ? 'Name' : 'Amount'));
      if (miss.length) notify.info?.(`${tx('Heard')}: “${heard}”. ${tx('Please fill')}: ${miss.join(', ')}`);
      else notify.success(`${tx('Heard')}: “${heard}”`);
    };
    rec.current = r;
    setState('listening');
    r.start();
  };

  return (
    <Tooltip title={tx('Say the place, name and amount in one go')}>
      <Button size={size} variant={state === 'listening' ? 'contained' : 'outlined'} color={state === 'listening' ? 'error' : 'secondary'}
        startIcon={state === 'thinking' ? <CircularProgress size={16} /> : state === 'listening' ? <MicIcon /> : <RecordVoiceOverOutlinedIcon />}
        disabled={state === 'thinking'} onClick={start}>
        {tx(state === 'listening' ? 'Listening… tap to stop' : 'Speak whole entry')}
      </Button>
    </Tooltip>
  );
};

export default VoiceEntryButton;
