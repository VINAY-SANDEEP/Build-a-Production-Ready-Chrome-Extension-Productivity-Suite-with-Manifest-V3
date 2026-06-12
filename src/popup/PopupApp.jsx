import React, { useState, useEffect } from 'react';
import { useExtensionStore } from '../hooks/useExtensionStore';
import { marked } from 'marked';
import { 
  FolderLock, 
  BookOpen, 
  Settings, 
  Sun, 
  Moon, 
  Save, 
  Trash2, 
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers
} from 'lucide-react';

export default function PopupApp() {
  const { 
    notes, 
    sessions, 
    theme, 
    loading, 
    error, 
    fetchData, 
    setNotes, 
    toggleTheme, 
    addSession, 
    deleteSession 
  } = useExtensionStore();

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'notes'
  const [sessionNameInput, setSessionNameInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isNotesPreview, setIsNotesPreview] = useState(false);
  const [currentWindowTabs, setCurrentWindowTabs] = useState([]);
  const [toast, setToast] = useState(null);

  // Load initial store data
  useEffect(() => {
    fetchData();
  }, []);

  // Update notes text input once notes load from store
  useEffect(() => {
    if (!loading) {
      setNotesInput(notes);
    }
  }, [notes, loading]);

  // Load current window tabs for preview/saving
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        const filtered = tabs.filter(tab => tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://'));
        setCurrentWindowTabs(filtered);
        
        // Suggest a default session name
        const dateStr = new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        setSessionNameInput(`Session - ${dateStr}`);
      });
    } else {
      // Mock data for browser dev
      setCurrentWindowTabs([
        { id: 1, title: 'Google Search', url: 'https://google.com' },
        { id: 2, title: 'GitHub', url: 'https://github.com' }
      ]);
      setSessionNameInput('Mock Session - Local Dev');
    }
  }, [loading]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleOpenOptions = () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/options.html', '_blank');
    }
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    const name = sessionNameInput.trim();
    if (!name) {
      showToast('Please enter a session name', 'error');
      return;
    }

    if (currentWindowTabs.length === 0) {
      showToast('No active tabs to save', 'error');
      return;
    }

    const urls = currentWindowTabs.map(tab => tab.url);
    await addSession(name, urls);
    showToast('Session saved successfully!');
    
    // Refresh name input
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setSessionNameInput(`Session - ${dateStr}`);
  };

  const handleRestoreSession = (name) => {
    const urls = sessions[name];
    if (!urls || urls.length === 0) {
      showToast('No URLs in this session', 'error');
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.windows) {
      chrome.windows.create({ url: urls }, () => {
        showToast('Session restored in new window');
      });
    } else {
      showToast(`Dev restore: opening ${urls.length} tabs`);
      urls.forEach(url => window.open(url, '_blank'));
    }
  };

  const handleDeleteSession = async (name) => {
    await deleteSession(name);
    showToast('Session deleted');
  };

  const handleSaveNotes = async () => {
    await setNotes(notesInput);
    showToast('Notes saved successfully!');
  };

  // Safe markdown html rendering
  const getMarkdownHtml = () => {
    try {
      return { __html: marked.parse(notesInput || '*No notes yet. Switch to Edit mode to write.*') };
    } catch (e) {
      return { __html: 'Error rendering markdown' };
    }
  };

  if (loading) {
    return (
      <div className="w-[420px] h-[550px] flex flex-col items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading Productivity Suite...</p>
      </div>
    );
  }

  return (
    <div className="w-[420px] h-[550px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Productivity Suite
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button 
            id="open-options-btn"
            data-testid="open-options-btn"
            onClick={handleOpenOptions}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Options page"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="m-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <nav className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'sessions' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/20 dark:bg-brand-500/5' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FolderLock className="w-4 h-4" />
          Sessions
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 py-3 px-4 font-semibold text-sm flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'notes' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/20 dark:bg-brand-500/5' 
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Notes
        </button>
      </nav>

      {/* Tab Panels */}
      <main className="flex-1 overflow-y-auto p-4">
        
        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            
            {/* Save Current Session Form */}
            <form onSubmit={handleSaveSession} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Save Active Session</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sessionNameInput}
                  onChange={(e) => setSessionNameInput(e.target.value)}
                  placeholder="Enter session name..."
                  className="flex-1 px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                />
                <button
                  type="submit"
                  id="save-session-btn"
                  data-testid="save-session-btn"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              
              {/* Current Tabs Info */}
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Tabs to save: <strong>{currentWindowTabs.length}</strong></span>
                <span className="text-[10px] text-slate-450 italic">Excludes internal URLs</span>
              </div>
            </form>

            {/* Saved Sessions list */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">Saved Sessions</h3>
              <div 
                id="sessions-list" 
                data-testid="sessions-list" 
                className="space-y-2"
              >
                {Object.keys(sessions).length === 0 ? (
                  <div className="text-center py-8 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <Layers className="w-8 h-8 text-slate-350 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-450">No saved sessions yet</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Save your current tabs to find them here.</p>
                  </div>
                ) : (
                  Object.keys(sessions).map((name) => (
                    <div 
                      key={name}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm truncate text-slate-850 dark:text-slate-100" title={name}>
                          {name}
                        </h4>
                        <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                          {sessions[name].length} {sessions[name].length === 1 ? 'tab' : 'tabs'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleRestoreSession(name)}
                          className="p-1.5 rounded-md text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 transition-colors"
                          title="Restore in new window"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(name)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="h-full flex flex-col space-y-3">
            
            {/* Editor Headers / Actions */}
            <div className="flex items-center justify-between">
              <div className="flex rounded-md bg-slate-200 dark:bg-slate-850 p-0.5">
                <button
                  onClick={() => setIsNotesPreview(false)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    !isNotesPreview 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsNotesPreview(true)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    isNotesPreview 
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  Preview
                </button>
              </div>

              {!isNotesPreview && (
                <button
                  type="button"
                  id="save-notes-btn"
                  data-testid="save-notes-btn"
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow transition-all flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Notes
                </button>
              )}
            </div>

            {/* Editor vs Preview Area */}
            <div className="flex-1 min-h-[300px] flex flex-col">
              {isNotesPreview ? (
                <div 
                  className="flex-1 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-y-auto text-sm max-w-full prose dark:prose-invert prose-slate dark:prose-slate prose-sm focus:outline-none"
                  dangerouslySetInnerHTML={getMarkdownHtml()}
                />
              ) : (
                <textarea
                  id="notes-textarea"
                  data-testid="notes-textarea"
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Write notes here... (Supports Markdown Syntax)"
                  className="flex-1 w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none font-mono"
                />
              )}
            </div>

            {/* Note Formatting tip */}
            <div className="text-[10px] text-slate-400 dark:text-slate-500 italic px-1">
              Supports **bold**, *italic*, [links](url), lists, headers, etc. Context menu clicks will append URLs here automatically.
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
