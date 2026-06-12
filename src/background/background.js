// Context Menu Initialization
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-to-notes",
    title: "Add page to notes",
    contexts: ["page"]
  });
});

// Context Menu Event Listener
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-to-notes" && tab) {
    const title = tab.title || "Untitled Page";
    const url = tab.url || "";

    if (!url) return;

    chrome.storage.local.get(["notes"], (result) => {
      const currentNotes = result.notes || "";
      const dateStr = new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const appendText = `\n\n- [${title}](${url}) (Added on ${dateStr})`;
      const newNotes = currentNotes ? currentNotes + appendText : `- [${title}](${url}) (Added on ${dateStr})`;

      chrome.storage.local.set({ notes: newNotes }, () => {
        console.log("Appended page link to notes from context menu.");
      });
    });
  }
});

// Keyboard Commands Listener
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-session") {
    saveCurrentSession();
  }
});

// Function to save all open tabs in current window
function saveCurrentSession() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    // Filter out extensions, chrome settings, and empty tabs
    const validTabs = tabs.filter(tab => {
      const url = tab.url || "";
      return url && !url.startsWith("chrome://") && !url.startsWith("chrome-extension://");
    });

    if (validTabs.length === 0) return;

    const urls = validTabs.map(tab => tab.url);
    const date = new Date();
    const formattedDate = date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const sessionName = `Quick Session - ${formattedDate}`;

    chrome.storage.local.get(["sessions"], (result) => {
      const currentSessions = result.sessions || {};
      currentSessions[sessionName] = urls;
      
      chrome.storage.local.set({ sessions: currentSessions }, () => {
        console.log(`Saved session: ${sessionName} with ${urls.length} tabs.`);
      });
    });
  });
}

// Blocker helper: check if hostname is matches blocklist
function shouldBlock(urlStr, blockList) {
  if (!urlStr || !blockList || blockList.length === 0) return false;
  
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();
    
    return blockList.some(blockedItem => {
      const blocked = blockedItem.toLowerCase().trim();
      if (!blocked) return false;
      // Exact match or subdomain match
      return hostname === blocked || hostname.endsWith("." + blocked);
    });
  } catch (e) {
    return false;
  }
}

// Monitor tab updates for site blocker
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check on loading status when URL is available
  const url = changeInfo.url || tab.url;
  if (url && (changeInfo.status === 'loading' || changeInfo.url)) {
    chrome.storage.sync.get(["blockedSites"], (result) => {
      const blockedSites = result.blockedSites || [];
      
      if (shouldBlock(url, blockedSites)) {
        let matchedHost = "this site";
        try {
          matchedHost = new URL(url).hostname;
        } catch (e) {}

        // Inject focus screen content
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: (host) => {
            document.title = "Blocked by Productivity Suite";
            document.documentElement.innerHTML = `
              <head>
                <title>Blocked by Productivity Suite</title>
                <meta charset="utf-8">
                <style>
                  * { box-sizing: border-box; }
                  body {
                    margin: 0;
                    padding: 24px;
                    background-color: #0f172a;
                    color: #f8fafc;
                    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    text-align: center;
                  }
                  .card {
                    max-width: 480px;
                    width: 100%;
                    background-color: #1e293b;
                    border: 1px solid #334155;
                    padding: 40px 32px;
                    border-radius: 16px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                  }
                  .icon {
                    font-size: 64px;
                    margin-bottom: 24px;
                    display: inline-block;
                    animation: float 3s ease-in-out infinite;
                  }
                  h1 {
                    font-size: 28px;
                    font-weight: 800;
                    margin: 0 0 12px 0;
                    color: #ef4444;
                    letter-spacing: -0.025em;
                  }
                  p {
                    font-size: 15px;
                    color: #94a3b8;
                    line-height: 1.6;
                    margin: 0 0 28px 0;
                  }
                  .host {
                    font-weight: 600;
                    color: #cbd5e1;
                    word-break: break-all;
                  }
                  .btn-group {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                  }
                  button {
                    flex: 1;
                    padding: 12px 20px;
                    font-size: 14px;
                    font-weight: 600;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                  }
                  .btn-primary {
                    background-color: #3b82f6;
                    color: #ffffff;
                  }
                  .btn-primary:hover {
                    background-color: #2563eb;
                  }
                  .btn-secondary {
                    background-color: #475569;
                    color: #f1f5f9;
                  }
                  .btn-secondary:hover {
                    background-color: #334155;
                  }
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">🚫</div>
                  <h1>Distraction Blocked</h1>
                  <p>
                    <span class="host">${host}</span> is currently on your blocklist.<br/>
                    Stay focused on what matters!
                  </p>
                  <div class="btn-group">
                    <button id="goback-btn" class="btn-primary">Go Back</button>
                    <button id="closetab-btn" class="btn-secondary">Close Tab</button>
                  </div>
                </div>
              </body>
            `;

            document.getElementById('goback-btn').addEventListener('click', () => {
              if (document.referrer || window.history.length > 1) {
                window.history.back();
              } else {
                window.close();
              }
            });

            document.getElementById('closetab-btn').addEventListener('click', () => {
              window.close();
            });
          },
          args: [matchedHost]
        }).catch(err => {
          console.error("Script injection failed: ", err);
        });
      }
    });
  }
});
