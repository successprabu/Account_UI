import { Fragment, useEffect, useRef, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Box, Button, Chip, Fab, IconButton, InputBase, Link, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseIcon from '@mui/icons-material/Close';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { supportChat, supportStatus } from '../../api/supportAi';
import { SITE, WHATSAPP_URL, faqAnswer } from './supportFaq';
import { useTx } from '../../language/site';

const STORE = 'supportChat';
/** Messages sent back to the server as history with each question. */
const HISTORY = 12;

const GREETING = {
  from: 'ai',
  greet: true,
  text: 'Vanakkam! 👋 I am the MySuccess assistant. Ask me about Moitech, Mahal Management, School Website & ERP, custom software, prices or demos. You can write in English or தமிழ்.',
};

const CHIPS = ['What is Moitech?', 'Mahal booking software', 'School ERP price', 'Custom software', 'Talk to a person'];

/** Pages that have their own chat (hall booking assistant) or where a chat box would get in the way. */
const HIDDEN = [/^\/mahals(\/|$)/, /^\/login/, /^\/forgot-password/, /^\/antony-resume/, /^\/design-system/];

const loadSaved = () => {
  try {
    const s = JSON.parse(sessionStorage.getItem(STORE) || 'null');
    return Array.isArray(s?.messages) && s.messages.length ? s.messages : null;
  } catch (e) {
    return null;
  }
};
const save = (messages) => {
  try {
    sessionStorage.setItem(STORE, JSON.stringify({ messages }));
  } catch (e) {
    /* private mode: the chat still works, it just won't survive a reload */
  }
};

const signedIn = () => {
  try {
    return !!JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return false;
  }
};

/** Turns links in a reply into clickable links; links to this site open inside the app. */
const URL_RE = /(https?:\/\/[^\s)]+[^\s).,;:!?'"])/g;
export const Linkified = ({ text }) => (
  <>
    {String(text)
      .split(URL_RE)
      .map((part, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
        if (part.startsWith(SITE)) {
          const to = part.slice(SITE.length) || '/';
          return <Link key={i} component={RouterLink} to={to} sx={{ wordBreak: 'break-all', fontWeight: 600 }}>{to}</Link>;
        }
        return <Link key={i} href={part} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: 'break-all', fontWeight: 600 }}>{part.replace(/^https?:\/\//, '')}</Link>;
      })}
  </>
);

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
 * "Ask us" chat box on the public MySuccess pages: answers visitors' questions about our apps, prices and demos.
 * Uses AI when it is switched on (SupportAi/Chat); otherwise, or if the AI call fails, it answers from the built-in
 * FAQ. Hidden for signed-in users and on pages that have their own chat.
 */
const SupportChat = () => {
  const tx = useTx();
  const theme = useTheme();
  const { pathname } = useLocation();
  const [ai, setAi] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadSaved() || [GREETING]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    let live = true;
    supportStatus().then((on) => live && setAi(on));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => save(messages), [messages]);
  useEffect(() => {
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  if (signedIn() || HIDDEN.some((re) => re.test(pathname))) return null;

  const send = async (raw) => {
    const message = (raw ?? text).trim().slice(0, 1000);
    if (!message || busy) return;
    setText('');
    const before = messages;
    setMessages([...before, { from: 'me', text: message }]);
    setBusy(true);
    let reply;
    if (ai) {
      const history = before
        .filter((m) => !m.greet && !m.error)
        .slice(-HISTORY)
        .map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', text: m.text }));
      const res = await supportChat(message, history, pathname);
      reply = res.ok && res.data?.reply ? { from: 'ai', text: res.data.reply } : { from: 'ai', text: faqAnswer(message), offline: true };
    } else {
      await new Promise((r) => setTimeout(r, 350));
      reply = { from: 'ai', text: faqAnswer(message), offline: true };
    }
    setBusy(false);
    setMessages((m) => [...m, reply]);
  };

  const restart = () => setMessages([GREETING]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <Box
            component={motion.div}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            sx={{ position: 'fixed', right: { xs: 16, md: 28 }, bottom: { xs: 16, md: 28 }, zIndex: 1300 }}
          >
            <Fab variant="extended" color="primary" onClick={() => setOpen(true)} aria-label="Chat with us" sx={{ fontWeight: 800, textTransform: 'none', boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.45)}` }}>
              <Box component={motion.span} animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }} sx={{ display: 'flex', mr: 1 }}>
                <ChatRoundedIcon />
              </Box>
              {tx('Ask us')}
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
            aria-label="MySuccess help chat"
            sx={{
              position: 'fixed',
              zIndex: 1300,
              right: { xs: 0, sm: 24 },
              bottom: { xs: 0, sm: 24 },
              width: { xs: '100%', sm: 390 },
              height: { xs: '85vh', sm: 580 },
              maxHeight: '100vh',
              borderRadius: { xs: '20px 20px 0 0', sm: 4 },
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ px: 2, py: 1.5, color: '#fff', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              <Avatar src="/logo.png" alt="MySuccess" sx={{ bgcolor: '#fff', width: 38, height: 38, p: 0.4 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800} lineHeight={1.2}>{tx('MySuccess assistant')}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                  {tx(ai ? 'AI · replies in seconds' : 'Quick answers · we reply on WhatsApp')}
                </Typography>
              </Box>
              <Tooltip title={tx("New chat")}><IconButton onClick={restart} sx={{ color: '#fff' }} aria-label="New chat"><RestartAltIcon /></IconButton></Tooltip>
              <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }} aria-label="Close chat"><CloseIcon /></IconButton>
            </Stack>

            <Box ref={listRef} sx={{ flex: 1, overflowY: 'auto', p: 1.5, bgcolor: '#F8FAFC' }}>
              <Stack spacing={1}>
                {messages.map((m, i) => (
                  <Box
                    key={i}
                    component={motion.div}
                    initial={{ opacity: 0, y: 8, x: m.from === 'me' ? 12 : -12 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    sx={{ alignSelf: m.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: 3,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        fontSize: 14.5,
                        lineHeight: 1.5,
                        ...(m.from === 'me'
                          ? { bgcolor: '#6366F1', color: '#fff', borderBottomRightRadius: 6 }
                          : { bgcolor: 'background.paper', color: 'text.primary', borderBottomLeftRadius: 6, boxShadow: 1 }),
                      }}
                    >
                      {m.from === 'me' ? m.text : <Linkified text={m.greet ? tx(m.text) : m.text} />}
                    </Box>
                  </Box>
                ))}
                {busy && (
                  <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} sx={{ alignSelf: 'flex-start', bgcolor: 'background.paper', borderRadius: 3, boxShadow: 1 }}>
                    <Dots />
                  </Box>
                )}
              </Stack>
            </Box>

            {messages.length <= 2 && (
              <Stack direction="row" spacing={0.75} sx={{ px: 1.5, pt: 1, overflowX: 'auto', flexShrink: 0 }}>
                {CHIPS.map((c) => <Chip key={c} label={tx(c)} size="small" variant="outlined" color="primary" onClick={() => send(tx(c))} disabled={busy} />)}
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
              <IconButton type="submit" color="primary" disabled={!text.trim() || busy} aria-label="Send" sx={{ bgcolor: alpha('#6366F1', 0.1) }}>
                <SendRoundedIcon />
              </IconButton>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, pb: 1, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary">
                {ai ? `${tx('AI can make mistakes.')} ` : ''}{tx('Never share passwords or OTPs.')}
              </Typography>
              <Button size="small" startIcon={<WhatsAppIcon />} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" sx={{ color: '#10B981', fontWeight: 700, textTransform: 'none' }}>
                {tx('WhatsApp us')}
              </Button>
            </Stack>
          </Paper>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChat;
