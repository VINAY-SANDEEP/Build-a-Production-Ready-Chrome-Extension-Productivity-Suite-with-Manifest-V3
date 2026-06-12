import React, { useState, useEffect } from 'react';
import { useExtensionStore } from '../hooks/useExtensionStore';
import { 
  ShieldAlert, 
  Download, 
  Trash2, 
  Plus, 
  Layers, 
  Sun, 
  Moon, 
  BookOpen, 
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Settings
} from 'lucide-react';

export default function OptionsApp() {
  const { 
    notes, 
    sessions, 
    blockedSites, 
    theme, 
    loading, 
    error, 
    fetchData, 
    toggleTheme, 
    addBlockedSite, 
    deleteBlockedSite 
  } = useExtensionStore();

  const [activeTab, setActiveTab] = useState('blocker'); // 'blocker' | 'data' | 'about'
  const [newHostname, setNewHostname] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddBlock = async (e) => {
    e.preventDefault();
    const host = newHostname.trim();
    if (!host) {
      showToast('Hostname cannot be empty', 'error');
      return;
    }
    
    // Quick validation: Check for basic hostname structure
    if (host.includes('/') && !host.startsWith('http')) {
      showToast('Please enter just a hostname (e.g. facebook.com)', 'error');
      return;
    }

    await addBlockedSite(host);
    showToast(`Added ${host} to blocklist`);
    setNewHostname('');
  };

  const handleRemoveBlock = async (host) => {
    await deleteBlockedSite(host);
    showToast(`Removed ${host} from blocklist`);
  };

  const handleExportData = () => {
    try {
      const exportData = {
        sessions,
        notes,
        blockedSites
      };
      
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'productivity_suite_export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast('Extension data exported successfully!');
    } catch (err) {
      showToast('Failed to export data: ' + err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="font-semibold text-slate-500 dark:text-slate-450">Loading configurations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col md:flex-row">
      
      {/* Toast Notice */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold border bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-right-6 duration-300">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-b md:border-b-0 border-slate-200 dark:border-slate-850 flex flex-col justify-between p-6">
        <div className="space-y-8">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/10">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base bg-gradient-to-r from-brand-600 to-indigo-500 dark:from-brand-400 dark:to-indigo-400 bg-clip-text text-transparent">
                Productivity Suite
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Control Panel</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('blocker')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'blocker'
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Website Blocker
            </button>
            
            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'data'
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              Data Management
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'about'
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400'
                  : 'text-slate-500 dark:text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              About Extension
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Theme toggle */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Theme</span>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        
        {/* Blocker settings tab */}
        {activeTab === 'blocker' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Website Blocker</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter hostnames of distracting websites to block them during work sessions.
              </p>
            </div>

            {/* Add blocker Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm">
              <form onSubmit={handleAddBlock} className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Block New Hostname
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    id="block-hostname-input"
                    data-testid="block-hostname-input"
                    value={newHostname}
                    onChange={(e) => setNewHostname(e.target.value)}
                    placeholder="e.g. facebook.com, youtube.com, twitter.com"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    id="add-block-btn"
                    data-testid="add-block-btn"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Site
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  *Blocking a domain blocks its subdomains too (e.g. adding <code>youtube.com</code> blocks <code>www.youtube.com</code>).
                </p>
              </form>
            </div>

            {/* Blocked Sites list */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Blocked Sites ({blockedSites.length})
              </h3>
              
              <ul 
                id="blocked-sites-list"
                data-testid="blocked-sites-list"
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {blockedSites.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Your blocklist is empty</p>
                    <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Enjoy a distraction-free web!</p>
                  </div>
                ) : (
                  blockedSites.map((site) => (
                    <li 
                      key={site}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-750 px-4 py-3.5 rounded-xl flex items-center justify-between shadow-sm transition-all group"
                    >
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate pr-2">
                        {site}
                      </span>
                      <button
                        onClick={() => handleRemoveBlock(site)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
                        title={`Remove ${site}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Data settings tab */}
        {activeTab === 'data' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Data Management</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Backup, export or review the data synchronized in your extension.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Saved Sessions</span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 block mt-1">
                  {Object.keys(sessions).length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Blocked Hostnames</span>
                <span className="text-2xl font-extrabold text-amber-500 block mt-1">
                  {blockedSites.length}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">Notes Character Count</span>
                <span className="text-2xl font-extrabold text-emerald-500 block mt-1">
                  {notes ? notes.length : 0}
                </span>
              </div>
            </div>

            {/* Export block */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-5 h-5 text-brand-500" />
                  Backup Data
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Export all your tab sessions, notes, and site blockers into a single JSON file. You can save this backup file locally.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleExportData}
                  id="export-data-btn"
                  data-testid="export-data-btn"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-150 text-white dark:text-slate-900 font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
                >
                  <Download className="w-4 h-4" />
                  Export Data JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* About tab */}
        {activeTab === 'about' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Productivity Suite</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Version 1.0.0 | Built with Manifest V3 React setup.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 shadow-sm space-y-4 text-sm text-slate-650 dark:text-slate-350">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Features Overview</h3>
              <ul className="list-disc pl-5 space-y-2.5">
                <li>
                  <strong>Tab Session Management:</strong> Group open browser tabs and save them as named sessions. Restore multiple tabs instantly.
                </li>
                <li>
                  <strong>Website Blocker:</strong> Sync distraction blockers using Chrome Storage Sync API to maintain consistent block lists.
                </li>
                <li>
                  <strong>Markdown Notes Editor:</strong> Draft quick notes, lists, or drafts using standard markdown. Append active tabs instantly using context menus.
                </li>
                <li>
                  <strong>Keyboard Shortcuts:</strong> Press <code>Ctrl+Shift+S</code> to instantly capture all tabs in the active window.
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
