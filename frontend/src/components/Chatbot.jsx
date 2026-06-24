import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessage } from '../api';
import { Sparkles, Send, Mic, MicOff, MessageSquare, X, ChevronDown, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hi! I'm InfoHub AI. I can recommend colleges, calculate cutoffs, help search scholarships, matching internships, or outline careers. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const listeningTimeout = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setPulse(false);
    }
  }, [open]);

  const quickReplies = [
    'Recommend top colleges',
    'Calculate TN cutoff score',
    'Find scholarships for engineering',
    'Career options after 12th',
  ];

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    
    try {
      const { data } = await sendChatMessage(msg);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble matching your profile details right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceListening = () => {
    if (isListening) {
      clearTimeout(listeningTimeout.current);
      setIsListening(false);
      return;
    }
    
    setIsListening(true);
    // Simulate voice speech transcription
    listeningTimeout.current = setTimeout(() => {
      setInput("Recommend colleges with highest placements packages");
      setIsListening(false);
    }, 3000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Button ── */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI chatbot"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary shadow-primary-glow flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={pulse ? { repeat: Infinity, duration: 2 } : {}}
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!open && pulse && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-accent rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[550px] max-h-[calc(100vh-120px)] flex flex-col rounded-3xl border border-borderDark shadow-premium overflow-hidden bg-cardDark body-light:bg-cardLight body-light:border-borderLight"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-borderDark body-light:border-borderLight">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-primary-glow">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white body-light:text-textPrimaryLight">InfoHub AI Copilot</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-accent">Active Agent</span>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)} 
                className="ml-auto p-1.5 rounded-lg text-textSecondaryDark hover:text-white hover:bg-white/5 body-light:hover:text-textPrimaryLight body-light:hover:bg-black/5 transition-all"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-premium">
              {messages.map((msg, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                    msg.role === 'user' 
                      ? 'bg-secondary' 
                      : 'bg-primary'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-secondary text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/5 text-textPrimaryDark rounded-tl-none body-light:bg-black/5 body-light:border-black/5 body-light:text-textPrimaryLight'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 body-light:bg-black/5 body-light:border-black/5">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Simulated Voice overlay */}
            {isListening && (
              <div className="bg-primary/10 border-y border-primary/20 px-4 py-2 flex items-center gap-3">
                <span className="w-2 h-2 bg-danger rounded-full animate-ping" />
                <span className="text-[10px] text-primary font-bold animate-pulse">Voice Listening (Say "Recommend colleges")...</span>
              </div>
            )}

            {/* Quick Prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pb-3 flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto scrollbar-premium">
                {quickReplies.map(q => (
                  <button 
                    key={q} 
                    onClick={() => sendMessage(q)}
                    className="text-[10px] px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-textSecondaryDark hover:border-primary/30 hover:bg-primary/15 hover:text-white body-light:bg-black/5 body-light:border-black/5 body-light:text-textSecondaryLight transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className="p-4 border-t border-borderDark body-light:border-borderLight">
              <div className="flex gap-2">
                <input 
                  ref={inputRef} 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Ask about courses, placements, cutoff..."}
                  className="flex-1 bg-surfaceDark/50 border border-borderDark rounded-xl px-4 py-2.5 text-xs text-white placeholder-mutedDark focus:outline-none focus:border-primary body-light:bg-white body-light:border-borderLight body-light:text-textPrimaryLight body-light:placeholder-mutedLight transition-all"
                  disabled={isListening}
                />
                
                {/* Voice button */}
                <button
                  onClick={startVoiceListening}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${
                    isListening 
                      ? 'border-danger bg-danger/10 text-danger' 
                      : 'border-borderDark hover:bg-white/5 text-textSecondaryDark body-light:border-borderLight'
                  }`}
                  aria-label="Simulate voice support"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Send button */}
                <button 
                  onClick={() => sendMessage()} 
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-hover flex items-center justify-center disabled:opacity-40 text-white shadow-primary-glow flex-shrink-0 transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
