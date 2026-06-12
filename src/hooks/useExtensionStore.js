import { create } from 'zustand';

export const useExtensionStore = create((set, get) => {
  let isListening = false;

  const syncStoreWithStorage = () => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;

    if (isListening) return;
    isListening = true;

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local') {
        if (changes.notes) {
          set({ notes: changes.notes.newValue || '' });
        }
        if (changes.sessions) {
          set({ sessions: changes.sessions.newValue || {} });
        }
        if (changes.theme) {
          set({ theme: changes.theme.newValue || 'dark' });
          updateDOMTheme(changes.theme.newValue || 'dark');
        }
      }
      if (areaName === 'sync') {
        if (changes.blockedSites) {
          set({ blockedSites: changes.blockedSites.newValue || [] });
        }
      }
    });
  };

  const updateDOMTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return {
    notes: '',
    sessions: {},
    blockedSites: [],
    theme: 'dark',
    loading: true,
    error: null,

    fetchData: async () => {
      set({ loading: true, error: null });
      try {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          // Fetch local storage
          const localData = await new Promise((resolve) => {
            chrome.storage.local.get(['notes', 'sessions', 'theme'], (result) => {
              resolve(result);
            });
          });

          // Fetch sync storage
          const syncData = await new Promise((resolve) => {
            chrome.storage.sync.get(['blockedSites'], (result) => {
              resolve(result);
            });
          });

          const currentTheme = localData.theme || 'dark';
          set({
            notes: localData.notes || '',
            sessions: localData.sessions || {},
            theme: currentTheme,
            blockedSites: syncData.blockedSites || [],
            loading: false,
          });

          updateDOMTheme(currentTheme);
          syncStoreWithStorage();
        } else {
          // Fallback for local development
          const localNotes = localStorage.getItem('notes') || '';
          const localSessions = JSON.parse(localStorage.getItem('sessions') || '{}');
          const localBlocked = JSON.parse(localStorage.getItem('blockedSites') || '[]');
          const localTheme = localStorage.getItem('theme') || 'dark';
          
          set({
            notes: localNotes,
            sessions: localSessions,
            blockedSites: localBlocked,
            theme: localTheme,
            loading: false,
          });

          updateDOMTheme(localTheme);
        }
      } catch (err) {
        set({ error: err.message, loading: false });
      }
    },

    setNotes: async (notes) => {
      set({ notes });
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve) => {
          chrome.storage.local.set({ notes }, resolve);
        });
      } else {
        localStorage.setItem('notes', notes);
      }
    },

    toggleTheme: async () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      set({ theme: nextTheme });
      updateDOMTheme(nextTheme);

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve) => {
          chrome.storage.local.set({ theme: nextTheme }, resolve);
        });
      } else {
        localStorage.setItem('theme', nextTheme);
      }
    },

    addSession: async (sessionName, urls) => {
      const currentSessions = { ...get().sessions };
      currentSessions[sessionName] = urls;
      set({ sessions: currentSessions });

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve) => {
          chrome.storage.local.set({ sessions: currentSessions }, resolve);
        });
      } else {
        localStorage.setItem('sessions', JSON.stringify(currentSessions));
      }
    },

    deleteSession: async (sessionName) => {
      const currentSessions = { ...get().sessions };
      delete currentSessions[sessionName];
      set({ sessions: currentSessions });

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve) => {
          chrome.storage.local.set({ sessions: currentSessions }, resolve);
        });
      } else {
        localStorage.setItem('sessions', JSON.stringify(currentSessions));
      }
    },

    addBlockedSite: async (hostname) => {
      let cleanHost = hostname.trim().toLowerCase();
      try {
        if (!cleanHost.startsWith('http://') && !cleanHost.startsWith('https://')) {
          cleanHost = 'http://' + cleanHost;
        }
        const urlObj = new URL(cleanHost);
        cleanHost = urlObj.hostname;
      } catch (e) {
        cleanHost = hostname.trim().toLowerCase()
          .replace(/^(https?:\/\/)?(www\.)?/, '')
          .split('/')[0];
      }

      if (!cleanHost || cleanHost.indexOf('.') === -1) {
        cleanHost = hostname.trim().toLowerCase();
      }

      if (!cleanHost) return;

      const currentBlocked = [...get().blockedSites];
      if (!currentBlocked.includes(cleanHost)) {
        currentBlocked.push(cleanHost);
        set({ blockedSites: currentBlocked });

        if (typeof chrome !== 'undefined' && chrome.storage) {
          await new Promise((resolve) => {
            chrome.storage.sync.set({ blockedSites: currentBlocked }, resolve);
          });
        } else {
          localStorage.setItem('blockedSites', JSON.stringify(currentBlocked));
        }
      }
    },

    deleteBlockedSite: async (hostname) => {
      const currentBlocked = get().blockedSites.filter(site => site !== hostname);
      set({ blockedSites: currentBlocked });

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await new Promise((resolve) => {
          chrome.storage.sync.set({ blockedSites: currentBlocked }, resolve);
        });
      } else {
        localStorage.setItem('blockedSites', JSON.stringify(currentBlocked));
      }
    },
  };
});
export default useExtensionStore;
