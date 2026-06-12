import React, { useState, useEffect } from 'react';
import { useExtensionStore } from '../hooks/useExtensionStore';
import { marked } from 'marked';
import { 
  Clock, 
  Calendar, 
  Quote, 
  Layers, 
  ExternalLink, 
  BookOpen, 
  Edit, 
  Save, 
  Eye, 
  Sun, 
  Moon, 
  Settings,
  Shield,
  Trash2,
  FileText
} from 'lucide-react';

const PRODUCTIVITY_QUOTES = [
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Focus is a muscle, and you build it by using it.", author: "Daniel Goleman" },
  { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
  { text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell" },
  { text: "It is not that we have a short time to live, but that we waste a lot of it.", author: "Seneca" }
];

export default function NewTabApp() {
  const { 
    notes, 
    sessions, 
    blockedSites, 
    theme, 
    loading, 
    fetchData, 
    setNotes, 
    toggleTheme,
    deleteSession
  } = useExtensionStore();

  const [time, setTime] = useState(new Date());
  const [quote, setQuote] = useState(PRODUCTIVITY_QUOTES[0]);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [greeting, setGreeting] = useState('Hello');

  useEffect(() => {
    fetchData();
    
    // Choose a random quote
    const randIndex = Math.floor(Math.random() * PRODUCTIVITY_QUOTES.length);
    setQuote(PRODUCTIVITY_QUOTES[randIndex]);

    // Clock update interval
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update notes text input once notes load from store
  useEffect(() => {
    if (!loading) {
      setNoteText(notes);
    }
  }, [notes, loading]);

  // Set greeting based on time of day
  useEffect(() => {
    const hours = time.getHours();
    if (hours < 12) {
      setGreeting('Good Morning');
    } else if (hours < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, [time]);

  const handleSaveNotes = async () => {
    await setNotes(noteText);
    setIsEditingNotes(false);
  };

  const handleRestoreSession = (name) => {
    const urls = sessions[name];
    if (!urls || urls.length === 0) return;

    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.create({ url: urls });
    } else {
      urls.forEach(url => window.open(url, '_blank'));
    }
  };

  const handleOpenSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  // Safe markdown html rendering
  const getNotesMarkdownHtml = () => {
    try {
      return { __html: marked.parse(noteText || '*Double click Edit to write notes.*') };
    } catch (e) {
      return { __html: 'Error rendering markdown' };
    }
  };

  // Format Clock digits
  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-150 transition-colors duration-200 relative overflow-hidden px-6 py-12 md:px-16 md:py-16 flex flex-col">
      
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between relative z-10 space-y-12">
        
        {/* Top Header Navbar */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent block">
                Productivity Suite
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleOpenSettings}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm flex items-center gap-2 font-semibold text-sm"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </header>

        {/* Hero Digital Clock & Greeting Section */}
        <section className="text-center md:text-left flex flex-col md:flex-row md:items-center md:justify-between gap-8 py-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {greeting}, <span className="bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">Maker</span>
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-brand-500 shrink-0" />
              <p className="text-sm font-semibold">{formattedDate}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-3xl shadow-xl flex items-center gap-4 mx-auto md:mx-0 shrink-0 select-none">
            <Clock className="w-8 h-8 text-brand-500" />
            <div className="text-left">
              <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                {formattedTime}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Local Time</p>
            </div>
          </div>
        </section>

        {/* Dynamic Quote and Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quote Widget */}
          <div className="md:col-span-2 bg-gradient-to-tr from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-start gap-4">
            <Quote className="w-8 h-8 text-brand-500 shrink-0 opacity-80" />
            <div className="space-y-2">
              <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-800 dark:text-slate-200 italic">
                "{quote.text}"
              </p>
              <p className="text-xs font-bold text-slate-450 dark:text-slate-500">
                — {quote.author}
              </p>
            </div>
          </div>

          {/* Core Stats widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-650 dark:text-brand-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block">Sessions</span>
                <span className="text-lg font-black">{Object.keys(sessions).length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-450">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase block">Blocked</span>
                <span className="text-lg font-black">{blockedSites.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Notes & Sessions Core Widgets Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notes Widget */}
          <div 
            id="widget-notes"
            data-testid="widget-notes"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col h-[400px]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-brand-500" />
                <h3 className="font-extrabold text-base">Quick Workspace Notes</h3>
              </div>

              <button
                onClick={() => {
                  if (isEditingNotes) {
                    handleSaveNotes();
                  } else {
                    setIsEditingNotes(true);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5"
              >
                {isEditingNotes ? (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-500" />
                    Save Note
                  </>
                ) : (
                  <>
                    <Edit className="w-3.5 h-3.5" />
                    Edit Notes
                  </>
                )}
              </button>
            </div>

            {/* Note content body */}
            <div className="flex-1 overflow-y-auto mt-4">
              {isEditingNotes ? (
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Draft notes, ideas or codes using Markdown syntax..."
                  className="w-full h-full p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono"
                />
              ) : (
                <div 
                  className="prose dark:prose-invert prose-slate dark:prose-slate prose-sm max-w-full focus:outline-none"
                  dangerouslySetInnerHTML={getNotesMarkdownHtml()}
                />
              )}
            </div>
          </div>

          {/* Sessions Widget */}
          <div 
            id="widget-sessions"
            data-testid="widget-sessions"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col h-[400px]"
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <Layers className="w-5 h-5 text-brand-500" />
              <h3 className="font-extrabold text-base">Saved Tab Sessions</h3>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
              {Object.keys(sessions).length === 0 ? (
                <div className="text-center py-16">
                  <Layers className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No saved sessions</p>
                  <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Open the extension popup to capture tab sessions.</p>
                </div>
              ) : (
                Object.keys(sessions).map((name) => (
                  <div 
                    key={name}
                    className="bg-slate-50 dark:bg-slate-850/40 hover:bg-slate-100/70 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 px-4 py-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all group"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate pr-2">
                        {name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 mt-0.5">
                        Contains {sessions[name].length} {sessions[name].length === 1 ? 'tab' : 'tabs'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreSession(name)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:hover:bg-brand-500/20 text-brand-650 dark:text-brand-400 transition-all flex items-center gap-1"
                        title="Restore tabs in new window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open
                      </button>
                      <button
                        onClick={() => deleteSession(name)}
                        className="p-2 rounded-lg text-slate-450 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        title="Delete Session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        {/* Footer */}
        <footer className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
          Productivity Suite Chrome Extension © {new Date().getFullYear()} | Focus. Simplify. Build.
        </footer>

      </div>
    </div>
  );
}
