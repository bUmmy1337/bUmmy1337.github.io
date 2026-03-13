/**
 * bummylnx Desktop — JavaScript
 * Window management, terminal, GitHub API, Conky widget, file manager
 */

document.addEventListener('DOMContentLoaded', () => {

    // =============================
    // GLOBAL STATE
    // =============================
    let zCounter = 10;
    let activeWindow = null;
    let allRepos = [];
    let currentRepo = null;

    // Terminal state
    const username = 'user';
    const hostname = 'bummylnx';
    let currentPath = '/home/user';
    let commandHistory = [];
    let historyIndex = -1;

    // =============================
    // CLOCK
    // =============================
    const clockEl = document.getElementById('panel-clock');
    function updateClock() {
        const now = new Date();
        const opts = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
        clockEl.textContent = now.toLocaleDateString('en-US', opts);
    }
    setInterval(updateClock, 1000);
    updateClock();

    // =============================
    // CONKY WIDGET
    // =============================
    const conkyCpu = document.getElementById('conky-cpu');
    const conkyMem = document.getElementById('conky-mem');
    const conkyNet = document.getElementById('conky-net');
    const conkyUptime = document.getElementById('conky-uptime');
    const startTime = Date.now();

    function updateConky() {
        // CPU bars
        let cpuHtml = '';
        for (let i = 0; i < 8; i++) {
            const pct = Math.floor(Math.random() * 80) + 5;
            cpuHtml += `<div class="conky-bar-row">
                <span>C${i}</span>
                <div class="conky-bar-track"><div class="conky-bar-fill cpu-fill" style="width:${pct}%"></div></div>
                <span>${pct}%</span>
            </div>`;
        }
        conkyCpu.innerHTML = cpuHtml;

        // Memory
        const totalMem = 32;
        const usedMem = (Math.random() * totalMem * 0.4 + 2).toFixed(1);
        const memPct = ((usedMem / totalMem) * 100).toFixed(0);
        conkyMem.innerHTML = `
            <div class="conky-bar-row">
                <span>${usedMem}G / ${totalMem}G</span>
                <div class="conky-bar-track"><div class="conky-bar-fill mem-fill" style="width:${memPct}%"></div></div>
                <span>${memPct}%</span>
            </div>`;

        // Network
        const dl = (Math.random() * 800 + 50).toFixed(0);
        const ul = (Math.random() * 200 + 10).toFixed(0);
        conkyNet.innerHTML = `
            <div class="conky-net-row"><span>▼ Download</span><span class="net-down">${dl} KB/s</span></div>
            <div class="conky-net-row"><span>▲ Upload</span><span class="net-up">${ul} KB/s</span></div>`;

        // Uptime
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        conkyUptime.textContent = `${mins}m ${secs}s`;
    }

    setInterval(updateConky, 2000);
    updateConky();

    // Toggle conky from settings
    const toggleConky = document.getElementById('toggle-conky');
    const conkyWidget = document.getElementById('conky-widget');
    if (toggleConky) {
        toggleConky.addEventListener('change', () => {
            conkyWidget.style.opacity = toggleConky.checked ? '1' : '0';
            conkyWidget.style.pointerEvents = toggleConky.checked ? 'auto' : 'none';
        });
    }

    // =============================
    // WINDOW MANAGEMENT
    // =============================
    const allWindows = document.querySelectorAll('.window');

    function openWindow(id) {
        const win = document.getElementById('window-' + id);
        if (!win) return;
        win.classList.add('open');
        bringToFront(win);
        updateDock();

        // Auto-fetch for github window
        if (id === 'github' && allRepos.length === 0) {
            fetchGitHubRepos();
        }

        // Auto-populate files window
        if (id === 'files') {
            renderFileManager('/home/user');
        }

        // Focus terminal input
        if (id === 'terminal') {
            setTimeout(() => document.getElementById('term-input').focus(), 100);
        }
    }

    function closeWindow(win) {
        win.classList.remove('open');
        win.classList.remove('maximized');
        if (activeWindow === win) activeWindow = null;
        updateDock();
    }

    function minimizeWindow(win) {
        win.classList.remove('open');
        // keep has-window dot in dock
        updateDock();
    }

    function maximizeWindow(win) {
        if (win.classList.contains('maximized')) {
            // Restore
            win.classList.remove('maximized');
            win.style.width = win._origW || '';
            win.style.height = win._origH || '';
            win.style.top = win._origT || '';
            win.style.left = win._origL || '';
        } else {
            win._origW = win.style.width || win.offsetWidth + 'px';
            win._origH = win.style.height || win.offsetHeight + 'px';
            win._origT = win.style.top || win.offsetTop + 'px';
            win._origL = win.style.left || win.offsetLeft + 'px';
            win.classList.add('maximized');
            const panelH = 32;
            const dockH = 80;
            win.style.top = panelH + 'px';
            win.style.left = '0';
            win.style.width = '100vw';
            win.style.height = `calc(100vh - ${panelH}px - ${dockH}px)`;
        }
    }

    function bringToFront(win) {
        allWindows.forEach(w => w.classList.remove('active'));
        zCounter++;
        win.style.zIndex = zCounter;
        win.classList.add('active');
        activeWindow = win;
    }

    function updateDock() {
        document.querySelectorAll('.dock-item[data-window]').forEach(item => {
            const winId = 'window-' + item.dataset.window;
            const win = document.getElementById(winId);
            if (win && (win.classList.contains('open') || win.classList.contains('minimized-state'))) {
                item.classList.add('has-window');
            } else {
                item.classList.remove('has-window');
            }
        });
    }

    // Window control buttons
    allWindows.forEach(win => {
        win.querySelectorAll('.win-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'close') closeWindow(win);
                else if (action === 'minimize') minimizeWindow(win);
                else if (action === 'maximize') maximizeWindow(win);
            });
        });

        // Click to bring to front
        win.addEventListener('mousedown', () => bringToFront(win));
    });

    // Make windows draggable
    allWindows.forEach(win => {
        const titlebar = win.querySelector('.window-titlebar');
        let dragging = false, startX, startY, startLeft, startTop;

        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.win-btn')) return;
            dragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = win.offsetLeft;
            startTop = win.offsetTop;
            bringToFront(win);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            win.style.left = (startLeft + dx) + 'px';
            win.style.top = (startTop + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            dragging = false;
        });
    });

    // Desktop icons — double click to open
    document.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', () => {
            const winId = icon.dataset.window;
            if (winId) {
                openWindow(winId);
            } else if (icon.id === 'icon-catshade') {
                window.open('https://catshade.ru', '_blank');
            } else if (icon.id === 'icon-minecraft') {
                window.open('https://launcher.bummy.ru', '_blank');
            }
        });
    });

    // Dock items
    document.querySelectorAll('.dock-item[data-window]').forEach(item => {
        item.addEventListener('click', () => {
            const winId = item.dataset.window;
            const win = document.getElementById('window-' + winId);
            if (win && win.classList.contains('open')) {
                // If already open and active, minimize
                if (win.classList.contains('active')) {
                    minimizeWindow(win);
                } else {
                    bringToFront(win);
                }
            } else {
                openWindow(winId);
            }
        });
    });

    // =============================
    // TERMINAL
    // =============================
    const termOutput = document.getElementById('term-output');
    const termInput = document.getElementById('term-input');
    const termPrompt = document.getElementById('term-prompt');

    // Focus terminal on window click
    document.getElementById('window-terminal').addEventListener('click', () => {
        termInput.focus();
    });

    // File system
    const fileSystem = {
        '/': {
            type: 'dir', children: {
                'home': {
                    type: 'dir', children: {
                        'user': {
                            type: 'dir', children: {
                                'about.txt': { type: 'file', content: 'Hello! I\'m bUmmy1337 — a developer and Linux enthusiast.\nThis portfolio is designed as a Linux desktop environment.\nFeel free to explore!' },
                                'projects': {
                                    type: 'dir', children: {
                                        'catshade.txt': { type: 'file', content: 'CatShade — https://catshade.ru\nA project by bUmmy1337.' },
                                        'legacymirror.txt': { type: 'file', content: 'LegacyMirror — https://launcher.bummy.ru\nMinecraft related project.' }
                                    }
                                },
                                'documents': {
                                    type: 'dir', children: {
                                        'readme.md': { type: 'file', content: '# bummylnx\nA portfolio Linux distribution.\nType `help` in the terminal for commands.' }
                                    }
                                },
                                '.bashrc': { type: 'file', content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w$ "\nalias ll="ls -la"\nalias vim="nvim"' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir', children: {
                        'bummylnx-release': { type: 'file', content: 'NAME="bummylnx"\nVERSION="2026.03 (Rolling)"\nID=bummylnx\nID_LIKE=arch\nHOME_URL="https://bummy1337.github.io"\nBUG_REPORT_URL="https://github.com/bummy1337"' },
                        'hostname': { type: 'file', content: 'bummylnx' }
                    }
                },
                'bin': {
                    type: 'dir', children: {
                        'ls': { type: 'exec' }, 'cd': { type: 'exec' }, 'cat': { type: 'exec' },
                        'echo': { type: 'exec' }, 'clear': { type: 'exec' }, 'help': { type: 'exec' },
                        'whoami': { type: 'exec' }, 'pwd': { type: 'exec' }, 'neofetch': { type: 'exec' },
                        'github': { type: 'exec' }, 'about': { type: 'exec' }, 'uname': { type: 'exec' }
                    }
                }
            }
        }
    };

    function getNode(path) {
        const parts = path.split('/').filter(Boolean);
        let node = fileSystem['/'];
        for (const p of parts) {
            if (node.children && node.children[p]) {
                node = node.children[p];
            } else {
                return null;
            }
        }
        return node;
    }

    function resolvePath(p) {
        let resolved = p.startsWith('/') ? p : currentPath + (currentPath.endsWith('/') ? '' : '/') + p;
        const parts = resolved.split('/').filter(Boolean);
        const stack = [];
        for (const part of parts) {
            if (part === '..') { stack.pop(); }
            else if (part !== '.') { stack.push(part); }
        }
        return '/' + stack.join('/');
    }

    function writeTerminal(html) {
        termOutput.innerHTML += html;
        termOutput.scrollTop = termOutput.scrollHeight;
    }

    function updatePrompt() {
        const displayPath = currentPath === '/home/user' ? '~' : currentPath.replace('/home/user', '~');
        termPrompt.innerHTML = `${username}@${hostname}:<span class="term-path">${displayPath}</span>$ `;
        termInput.focus();
    }

    async function execCommand(line) {
        const displayPath = currentPath === '/home/user' ? '~' : currentPath.replace('/home/user', '~');
        writeTerminal(`<span class="term-prompt">${username}@${hostname}:<span class="term-path">${displayPath}</span>$ </span>${escapeHtml(line)}\n`);

        if (!line.trim()) { updatePrompt(); return; }

        commandHistory.push(line);
        historyIndex = commandHistory.length;

        const parts = line.trim().split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                writeTerminal(`<span class="ansi-bold">Available commands:</span>
  <span class="ansi-cyan">help</span>      — show this help
  <span class="ansi-cyan">clear</span>     — clear terminal
  <span class="ansi-cyan">ls</span>        — list directory
  <span class="ansi-cyan">cd</span>        — change directory
  <span class="ansi-cyan">cat</span>       — show file contents
  <span class="ansi-cyan">echo</span>      — print text
  <span class="ansi-cyan">pwd</span>       — current directory
  <span class="ansi-cyan">whoami</span>    — current user
  <span class="ansi-cyan">uname</span>     — system info
  <span class="ansi-cyan">neofetch</span>  — system overview
  <span class="ansi-cyan">github</span>    — open GitHub repos
  <span class="ansi-cyan">about</span>     — about me
`);
                break;

            case 'clear':
                termOutput.innerHTML = '';
                break;

            case 'ls': {
                const target = args[0] ? resolvePath(args[0]) : currentPath;
                const node = getNode(target);
                if (node && node.type === 'dir') {
                    let out = '';
                    for (const name of Object.keys(node.children)) {
                        const child = node.children[name];
                        if (child.type === 'dir') out += `<span class="ansi-blue">${name}/</span>  `;
                        else if (child.type === 'exec') out += `<span class="ansi-green">${name}</span>  `;
                        else out += `${name}  `;
                    }
                    writeTerminal(out + '\n');
                } else {
                    writeTerminal(`<span class="ansi-red">ls: cannot access '${escapeHtml(args[0] || '.')}': No such file or directory</span>\n`);
                }
                break;
            }

            case 'cd':
                if (!args[0] || args[0] === '~') {
                    currentPath = '/home/user';
                } else {
                    const np = resolvePath(args[0]);
                    const node = getNode(np);
                    if (node && node.type === 'dir') {
                        currentPath = np;
                    } else {
                        writeTerminal(`<span class="ansi-red">cd: no such directory: ${escapeHtml(args[0])}</span>\n`);
                    }
                }
                break;

            case 'cat':
                if (!args[0]) {
                    writeTerminal(`<span class="ansi-red">cat: missing operand</span>\n`);
                } else {
                    const fp = resolvePath(args[0]);
                    const node = getNode(fp);
                    if (node && node.type === 'file') {
                        writeTerminal(escapeHtml(node.content) + '\n');
                    } else if (node && node.type === 'dir') {
                        writeTerminal(`<span class="ansi-red">cat: ${escapeHtml(args[0])}: Is a directory</span>\n`);
                    } else {
                        writeTerminal(`<span class="ansi-red">cat: ${escapeHtml(args[0])}: No such file or directory</span>\n`);
                    }
                }
                break;

            case 'echo':
                writeTerminal(escapeHtml(args.join(' ')) + '\n');
                break;

            case 'pwd':
                writeTerminal(currentPath + '\n');
                break;

            case 'whoami':
                writeTerminal(username + '\n');
                break;

            case 'uname':
                if (args.includes('-a')) {
                    writeTerminal('Linux bummylnx 6.6.6-zen #1 ZEN SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n');
                } else {
                    writeTerminal('Linux\n');
                }
                break;

            case 'neofetch':
                writeTerminal(`<span class="ansi-cyan">
      /\\
     /  \\
    /    \\
   /      \\
  /   ,,   \\
 /   |  |   \\
/_-''    ''-_\\
</span>  <span class="ansi-blue">${username}</span>@<span class="ansi-green">${hostname}</span>
  ──────────────
  <span class="ansi-yellow">OS</span>:       bummylnx rolling
  <span class="ansi-yellow">Kernel</span>:   6.6.6-zen
  <span class="ansi-yellow">Uptime</span>:   since 2024
  <span class="ansi-yellow">Packages</span>: 1337 (pacman)
  <span class="ansi-yellow">Shell</span>:    zsh 5.9
  <span class="ansi-yellow">DE</span>:       Hyprland
  <span class="ansi-yellow">CPU</span>:      AMD Ryzen 5 9600X
  <span class="ansi-yellow">GPU</span>:      NVIDIA RTX 3060
  <span class="ansi-yellow">Memory</span>:   4.2G / 32G

`);
                break;

            case 'github':
                openWindow('github');
                if (allRepos.length === 0) fetchGitHubRepos();
                writeTerminal('<span class="ansi-green">Opening GitHub repositories...</span>\n');
                break;

            case 'about':
                openWindow('about');
                writeTerminal('<span class="ansi-green">Opening About Me...</span>\n');
                break;

            default:
                writeTerminal(`<span class="ansi-red">${escapeHtml(cmd)}: command not found</span>\n`);
                break;
        }

        updatePrompt();
    }

    termInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const line = termInput.value;
            termInput.value = '';
            await execCommand(line);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                termInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                termInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                termInput.value = '';
            }
        }
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =============================
    // GITHUB REPOS
    // =============================
    const reposList = document.getElementById('github-repos-list');
    const githubFilters = document.getElementById('github-filters');
    const githubSearch = document.getElementById('github-search-input');

    const langColors = {
        'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5',
        'HTML': '#e34c26', 'CSS': '#563d7c', 'C++': '#f34b7d', 'C#': '#178600',
        'C': '#555555', 'Java': '#b07219', 'Go': '#00ADD8', 'Rust': '#dea584',
        'Shell': '#89e051', 'Lua': '#000080', 'PHP': '#4F5D95', 'Kotlin': '#A97BFF',
        'Vue': '#41b883', 'Dart': '#00B4AB', 'Ruby': '#701516',
    };

    async function fetchGitHubRepos() {
        reposList.innerHTML = '<div class="github-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading repositories...</div>';
        try {
            const resp = await fetch('https://api.github.com/users/bummy1337/repos?sort=updated&per_page=100');
            if (!resp.ok) throw new Error(resp.statusText);
            allRepos = await resp.json();
            buildFilters();
            renderRepoList(allRepos);
        } catch (err) {
            reposList.innerHTML = `<div class="github-loading" style="color:var(--red);">
                <i class="fas fa-exclamation-triangle"></i> Failed to load.
                <a href="https://github.com/bummy1337" target="_blank" style="color:var(--accent);margin-left:8px;">Open GitHub</a>
            </div>`;
        }
    }

    function buildFilters() {
        const langs = new Set();
        allRepos.forEach(r => { if (r.language) langs.add(r.language); });
        let html = '<button class="ghf-btn active" data-filter="all">All</button>';
        langs.forEach(l => {
            html += `<button class="ghf-btn" data-filter="${escapeHtml(l)}">${escapeHtml(l)}</button>`;
        });
        githubFilters.innerHTML = html;

        githubFilters.querySelectorAll('.ghf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                githubFilters.querySelectorAll('.ghf-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterRepos();
            });
        });
    }

    function filterRepos() {
        const activeFilter = githubFilters.querySelector('.ghf-btn.active')?.dataset.filter || 'all';
        const search = githubSearch.value.toLowerCase().trim();
        let filtered = allRepos;
        if (activeFilter !== 'all') {
            filtered = filtered.filter(r => r.language === activeFilter);
        }
        if (search) {
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(search) ||
                (r.description || '').toLowerCase().includes(search)
            );
        }
        renderRepoList(filtered);
    }

    githubSearch.addEventListener('input', filterRepos);

    function renderRepoList(repos) {
        if (!repos.length) {
            reposList.innerHTML = '<div class="github-loading">No repositories found.</div>';
            return;
        }

        reposList.innerHTML = repos.map(r => {
            const lang = r.language || '';
            const color = langColors[lang] || '#8b949e';
            return `<div class="repo-item" data-repo-id="${r.id}">
                <div class="repo-item-header">
                    <span class="repo-item-name"><i class="fas fa-cube"></i>${escapeHtml(r.name)}</span>
                    <span class="repo-item-stars"><i class="fas fa-star"></i> ${r.stargazers_count}</span>
                </div>
                <div class="repo-item-desc">${escapeHtml(r.description || 'No description.')}</div>
                <div class="repo-item-meta">
                    ${lang ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${escapeHtml(lang)}</span>` : ''}
                    <span class="repo-meta-item"><i class="fas fa-code-branch"></i> ${r.forks_count}</span>
                    <span class="repo-meta-item"><i class="fas fa-eye"></i> ${r.watchers_count}</span>
                </div>
            </div>`;
        }).join('');

        // Click to open detail
        reposList.querySelectorAll('.repo-item').forEach(el => {
            el.addEventListener('click', () => {
                const repoId = parseInt(el.dataset.repoId);
                const repo = allRepos.find(r => r.id === repoId);
                if (repo) openRepoDetail(repo);
            });
        });
    }

    // =============================
    // REPO DETAIL
    // =============================
    async function openRepoDetail(repo) {
        currentRepo = repo;
        const detailTitle = document.getElementById('repo-detail-title');
        detailTitle.innerHTML = `<i class="fab fa-github"></i> ${escapeHtml(repo.name)}`;
        openWindow('repo-detail');
        switchRepoTab('files');
    }

    // Tab switching
    document.querySelectorAll('.repo-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.repo-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            switchRepoTab(tab.dataset.section);
        });
    });

    async function switchRepoTab(section) {
        const content = document.getElementById('repo-detail-content');
        if (!currentRepo) return;

        content.innerHTML = '<div class="github-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading...</div>';

        switch (section) {
            case 'files': await renderRepoFiles(currentRepo, ''); break;
            case 'readme': await renderRepoReadme(currentRepo); break;
            case 'releases': await renderRepoReleases(currentRepo); break;
        }
    }

    async function renderRepoFiles(repo, path) {
        const content = document.getElementById('repo-detail-content');
        try {
            const resp = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents${path}`);
            if (!resp.ok) throw new Error(resp.statusText);
            const items = await resp.json();

            let html = `<div class="clone-box">
                <code>git clone ${escapeHtml(repo.clone_url)}</code>
                <button onclick="navigator.clipboard.writeText('${repo.clone_url}');this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)">Copy</button>
            </div>`;

            if (path) {
                html += `<div class="rd-dir-item" data-path="${path.substring(0, path.lastIndexOf('/')) || ''}">
                    <i class="fas fa-folder"></i> ..
                </div>`;
            }

            items.forEach(item => {
                if (item.type === 'dir') {
                    html += `<div class="rd-dir-item" data-path="${path}/${item.name}"><i class="fas fa-folder"></i> ${escapeHtml(item.name)}</div>`;
                } else {
                    html += `<div class="rd-file-item" data-url="${item.download_url || ''}"><i class="fas fa-file"></i> ${escapeHtml(item.name)}</div>`;
                }
            });

            content.innerHTML = html;

            content.querySelectorAll('.rd-dir-item').forEach(el => {
                el.addEventListener('click', () => renderRepoFiles(repo, el.dataset.path));
            });

            content.querySelectorAll('.rd-file-item').forEach(el => {
                el.addEventListener('click', async () => {
                    const url = el.dataset.url;
                    if (!url) return;
                    const name = el.textContent.trim();
                    content.innerHTML = '<div class="github-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading file...</div>';
                    try {
                        const r = await fetch(url);
                        const text = await r.text();
                        if (text.length > 100 * 1024) {
                            content.innerHTML = `<p style="color:var(--yellow)">File too large. <a href="${url}" target="_blank" style="color:var(--accent)">Download</a></p>`;
                        } else {
                            content.innerHTML = `<h3>${escapeHtml(name)}</h3><pre><code>${escapeHtml(text)}</code></pre>`;
                        }
                    } catch (e) {
                        content.innerHTML = `<p style="color:var(--red)">Error: ${escapeHtml(e.message)}</p>`;
                    }
                });
            });

        } catch (err) {
            content.innerHTML = `<p style="color:var(--red)">Failed to load files: ${escapeHtml(err.message)}</p>`;
        }
    }

    async function renderRepoReadme(repo) {
        const content = document.getElementById('repo-detail-content');
        try {
            const resp = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`);
            if (!resp.ok) {
                content.innerHTML = '<p>No README found.</p>';
                return;
            }
            const data = await resp.json();
            const decoded = decodeURIComponent(escape(atob(data.content)));
            content.innerHTML = marked.parse(decoded);
        } catch (err) {
            content.innerHTML = `<p style="color:var(--red)">Error: ${escapeHtml(err.message)}</p>`;
        }
    }

    async function renderRepoReleases(repo) {
        const content = document.getElementById('repo-detail-content');
        try {
            const resp = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases`);
            if (!resp.ok) throw new Error(resp.statusText);
            const releases = await resp.json();

            if (!releases.length) {
                content.innerHTML = '<p>No releases found.</p>';
                return;
            }

            content.innerHTML = releases.map(rel => `
                <div class="release-card">
                    <h4>${escapeHtml(rel.tag_name)} — ${new Date(rel.published_at).toLocaleDateString()}</h4>
                    <p>${escapeHtml(rel.name || '')}</p>
                    ${rel.assets.map(a => `<a href="${a.browser_download_url}" target="_blank">
                        <i class="fas fa-download"></i> ${escapeHtml(a.name)} (${(a.size / 1024 / 1024).toFixed(2)} MB)
                    </a><br>`).join('')}
                </div>
            `).join('');
        } catch (err) {
            content.innerHTML = `<p style="color:var(--red)">Error: ${escapeHtml(err.message)}</p>`;
        }
    }

    // =============================
    // FILE MANAGER
    // =============================
    function renderFileManager(path) {
        const main = document.getElementById('files-main');
        const titleEl = document.querySelector('#window-files .window-title');
        titleEl.innerHTML = `<i class="fas fa-folder-open"></i> File Manager — ${path}`;

        // Update sidebar active
        document.querySelectorAll('.files-sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.path === path);
        });

        const node = getNode(path);
        if (!node || node.type !== 'dir') {
            main.innerHTML = '<div style="padding:20px;color:var(--text-muted)">Directory not found.</div>';
            return;
        }

        let html = '';
        // Add ".." if not root
        if (path !== '/') {
            const parent = path.substring(0, path.lastIndexOf('/')) || '/';
            html += `<div class="file-item is-dir" data-path="${parent}">
                <i class="fas fa-folder"></i><span>..</span>
            </div>`;
        }

        // Sort: dirs first
        const entries = Object.entries(node.children).sort((a, b) => {
            const aDir = a[1].type === 'dir' ? 0 : 1;
            const bDir = b[1].type === 'dir' ? 0 : 1;
            return aDir - bDir || a[0].localeCompare(b[0]);
        });

        entries.forEach(([name, child]) => {
            const isDir = child.type === 'dir';
            const fullPath = path === '/' ? '/' + name : path + '/' + name;
            const icon = isDir ? 'fa-folder' : (name.endsWith('.txt') || name.endsWith('.md') ? 'fa-file-alt' : 'fa-file');
            html += `<div class="file-item ${isDir ? 'is-dir' : 'is-file'}" data-path="${fullPath}" data-type="${child.type}">
                <i class="fas ${icon}"></i><span>${name}</span>
            </div>`;
        });

        main.innerHTML = html;

        // Click handlers
        main.querySelectorAll('.file-item').forEach(el => {
            el.addEventListener('dblclick', () => {
                if (el.dataset.type === 'dir' || el.classList.contains('is-dir')) {
                    renderFileManager(el.dataset.path);
                } else {
                    // Open file in terminal
                    openWindow('terminal');
                    const filePath = el.dataset.path;
                    execCommand('cat ' + filePath);
                }
            });
        });
    }

    // Sidebar navigation
    document.querySelectorAll('.files-sidebar-item').forEach(item => {
        item.addEventListener('click', () => {
            renderFileManager(item.dataset.path);
        });
    });

    // =============================
    // INITIAL STATE
    // =============================
    updatePrompt();

    // Open terminal on load
    openWindow('terminal');

});
