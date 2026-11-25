import { useTx } from '../../language/site';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Box, Button, Chip, Fab, IconButton, InputBase, Link, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { aiChat, aiStatus } from '../../api/mahalAi';

const STORE = 'mahalAiChat';

const loadSaved = (mahalId) => {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    return s && s.mahalId === (mahalId || null) ? s : null;
  } catch (e) {
    return null;
  }
};
const save = (state) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify(state));
  } catch (e) {
    /* private mode: the chat still works, it just won't survive a reload */
  }
};

const greeting = (hallName) => ({
  from: 'ai',
  greet: true,
  text: hallName
    ? 'Vanakkam! I can tell you about {{hall}}: price, free dates, capacity, and send a booking request for you. You can write in English or தமிழ்.'
    : 'Vanakkam! Tell me the date, area and number of guests, and I will find halls for you. You can write in English or தமிழ்.',
});

const Dots = () => (
  <Stack direction="row" spacing={0.6} sx={{ px: 1.5, py: 1.25 }} aria-label="Typing">
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        component={motion.span}
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'text.secondary', display: 'block' }}
      />
    ))}
  </Stack>
);

/**
 * "Ask AI" on the public hall pages: a floating button that opens a chat with the booking assistant. It answers from
 * the hall's real details and can send a booking request once the customer confirms. Hidden when AI is off.
 */
const AiChat = ({ mahalId, hallName, bottomOffset = 0 }) => {
  const tx = useTx();
  const theme = useTheme();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(() => loadSaved(mahalId) || { mahalId: mahalId || null, chatId: null, messages: [greeting(hallName)] });
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    let live = true;
    aiStatus().then((on) => live && setEnabled(on));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => save(state), [state]);
  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [state.messages, busy, open]);

  if (!enabled) return null;

  const chips = hallName
    ? ['Price and advance?', 'Is it free next Sunday?', 'How many guests?', 'I want to book']
    : ['Halls for 500 guests', 'Free on 14 Feb?', 'AC hall near me'];

  const send = async (raw) => {
    const message = (raw ?? text).trim();
    if (!message || busy) return;
    setText('');
    setState((s) => ({ ...s, messages: [...s.messages, { from: 'me', text: message }] }));
    setBusy(true);
    const res = await aiChat(message, state.chatId, mahalId);
    setBusy(false);
    setState((s) => ({
      ...s,
      chatId: res.ok ? res.data.chatId : s.chatId,
      messages: [...s.messages, res.ok ? { from: 'ai', text: res.data.reply, bookingRef: res.data.bookingRef } : { from: 'ai', text: res.message, error: true }],
    }));
  };

  const restart = () => setState({ mahalId: mahalId || null, chatId: null, messages: [greeting(hallName)] });

  return (
    <>
      <AnimatePresence>
        {!open && (
          <Box
            component={motion.div}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            sx={{ position: 'fixed', right: { xs: 16, md: 28 }, bottom: { xs: 16 + bottomOffset, md: 28 }, zIndex: 1300 }}
          >
            <Fab variant="extended" color="primary" onClick={() => setOpen(true)} aria-label="Ask AI about halls" sx={{ fontWeight: 800, boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.45)}` }}>
              <Box component={motion.span} animate={{ rotate: [0, 18, -12, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2 }} sx={{ display: 'flex', mr: 1 }}>
                <AutoAwesomeIcon />
              </Box>
              {tx("Ask AI")}
            </Fab>
          </Box>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <Paper
            component={motion.section}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            elevation={12}
            aria-label="AI booking assistant"
            sx={{
              position: 'fixed',
              zIndex: 1300,
              right: { xs: 0, sm: 24 },
              bottom: { xs: 0, sm: 24 },
              width: { xs: '100%', sm: 380 },
              height: { xs: '85vh', sm: 560 },
              maxHeight: '100vh',
              borderRadius: { xs: '20px 20px 0 0', sm: 4 },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 2, py: 1.5, color: '#fff', background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
              <Avatar sx={{ bgcolor: alpha('#fff', 0.2), width: 36, height: 36 }}><AutoAwesomeIcon fontSize="small" /></Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800} lineHeight={1.2}>{tx("Booking assistant")}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }} noWrap>{hallName || tx('Find and book a hall')} · AI</Typography>
              </Box>
              <Tooltip title={tx("New chat")}><IconButton onClick={restart} sx={{ color: '#fff' }} aria-label="New chat"><RestartAltIcon /></IconButton></Tooltip>
              <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }} aria-label="Close chat"><CloseIcon /></IconButton>
            </Stack>

            <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Stack spacing={1}>
                {state.messages.map((m, i) => (
                  <Box
                    key={i}
                    component={motion.div}
                    initial={{ opacity: 0, y: 8, x: m.from === 'me' ? 12 : -12 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    sx={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 3,
                        whiteSpace: 'pre-wrap',
                        fontSize: 14.5,
                        lineHeight: 1.45,
                        ...(m.from === 'me'
                          ? { bgcolor: 'primary.main', color: '#fff', borderBottomRightRadius: 6 }
                          : { bgcolor: m.error ? alpha(theme.palette.error.main, 0.1) : 'background.paper', color: m.error ? 'error.main' : 'text.primary', borderBottomLeftRadius: 6, boxShadow: 1 }),
                      }}
                    >
                      {m.greet ? tx(m.text, { hall: hallName }) : m.text}
                    </Box>
                    {m.bookingRef && (
                      <Button component={RouterLink} to={`/mahals/status?ref=${m.bookingRef}`} size="small" variant="outlined" sx={{ mt: 0.75 }}>
                        {tx("Check booking ")}{m.bookingRef}
                      </Button>
                    )}
                  </Box>
                ))}
                {busy && (
                  <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ alignSelf: 'flex-start', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
                    <Dots />
                  </Box>
                )}
              </Stack>
            </Box>

            {state.messages.length <= 2 && (
              <Stack direction="row" spacing={0.75} sx={{ px: 1.5, pt: 1, overflowX: 'auto', flexShrink: 0 }}>
                {chips.map((c) => <Chip key={c} label={tx(c)} size="small" variant="outlined" color="primary" onClick={() => send(tx(c))} disabled={busy} />)}
              </Stack>
            )}

            <Stack
              component="form"
              direction="row"
              alignItems="flex-end"
              spacing={1}
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              sx={{ p: 1.25, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
            >
              <InputBase
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 1000))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={tx("Type your question…")}
                multiline
                maxRows={4}
                inputProps={{ 'aria-label': 'Message' }}
                sx={{ flex: 1, px: 1.5, py: 1, borderRadius: 3, bgcolor: alpha(theme.palette.text.primary, 0.05), fontSize: 15 }}
              />
              <IconButton type="submit" color="primary" disabled={!text.trim() || busy} aria-label="Send" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <SendRoundedIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ pb: 0.75, bgcolor: 'background.paper' }}>
              {tx("AI can make mistakes. The hall confirms every booking. ")}<Link component={RouterLink} to="/mahals/status">{tx("Check a booking")}</Link>
            </Typography>
          </Paper>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiChat;
