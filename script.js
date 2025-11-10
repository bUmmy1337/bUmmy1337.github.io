document.addEventListener('DOMContentLoaded', () => {
    const githubReposDiv = document.getElementById('portfolio-content');
    const terminalOutput = document.querySelector('.terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const currentPromptSpan = document.getElementById('current-prompt');
    const terminalWindow = document.getElementById('terminal-window');
    const portfolioWindow = document.getElementById('portfolio-window');
    const terminalIcon = document.getElementById('terminal-icon');
    const githubIcon = document.getElementById('github-icon');
    const aboutIcon = document.getElementById('about-icon');
    const systemTimeSpan = document.getElementById('system-time');
    const catshadeIcon = document.getElementById('catshade-icon'); // New: CatShade icon
    const minecraftIcon = document.getElementById('minecraft-icon'); // New: Minecraft icon

    // Repo Detail Window elements
    const repoDetailWindow = document.getElementById('repo-detail-window');
    const repoDetailTitle = document.getElementById('repo-detail-title');
    const repoDetailContent = document.getElementById('repo-detail-content');
    const repoDetailNavItems = document.querySelectorAll('.repo-detail-nav-item');

    let currentRepo = null; // To store the currently viewed repository

    // Widget elements
    const cpuOutput = document.getElementById('cpu-output');
    const memOutput = document.getElementById('mem-output');
    const netOutput = document.getElementById('net-output');

    let activeWindow = null;
    let commandHistory = [];
    let historyIndex = -1;
    const username = 'user';
    const hostname = 'bummy1337'; // Updated hostname
    let currentPath = '/home/user'; // Simulate current directory

    // Simulate a file system
    const fileSystem = {
        '/': {
            type: 'directory',
            children: {
                'home': {
                    type: 'directory',
                    children: {
                        'user': {
                            type: 'directory',
                            children: {
                                'portfolio.txt': {
                                    type: 'file',
                                    content: 'Welcome to my Arch Linux Portfolio!\nType \'help\' for available commands.\n'
                                },
                                'projects': {
                                    type: 'directory',
                                    children: {}
                                },
                                'about.txt': {
                                    type: 'file',
                                    content: 'Hello! I\'m a software engineer with a passion for creating robust and scalable applications. I enjoy working with various technologies and constantly learning new things.\n\nThis portfolio is designed to mimic an Arch Linux desktop environment, showcasing my projects in a unique way.'
                                }
                            }
                        }
                    }
                },
                'bin': {
                    type: 'directory',
                    children: {
                        'ls': { type: 'executable' },
                        'cd': { type: 'executable' },
                        'cat': { type: 'executable' },
                        'echo': { type: 'executable' },
                        'clear': { type: 'executable' },
                        'help': { type: 'executable' },
                        'whoami': { type: 'executable' },
                        'pwd': { type: 'executable' },
                        'github': { type: 'executable' },
                        'about': { type: 'executable' },
                        'neofetch': { type: 'executable' } // Added neofetch
                    }
                }
            }
        }
    };

    // Matrix effect canvas
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;

    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0F0'; // Green text
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
            const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 30);

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const newColumns = canvas.width / fontSize;
        drops.length = newColumns; // Adjust drops array size
        for (let i = 0; i < newColumns; i++) {
            if (drops[i] === undefined) drops[i] = 1;
        }
    });


    // Update system time
    function updateSystemTime() {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit', hour12: false };
        systemTimeSpan.textContent = now.toLocaleTimeString('en-US', options);
    }
    setInterval(updateSystemTime, 1000);
    updateSystemTime(); // Initial call

    // Simulate system monitoring data (for demonstration purposes)
    function updateSystemWidgets() {
        // CPU Usage
        let cpuData = `CPU: Ryzen 7 2700   3.2 GHz\n`;
        for (let i = 0; i < 8; i++) { // Simulate 8 cores
            const percent = Math.floor(Math.random() * 100);
            const temp = Math.floor(Math.random() * (80 - 40) + 40); // 40-80°C
            const bar = '█'.repeat(Math.floor(percent / 10)).padEnd(10, '░');
            cpuData += `C${i}: ${percent.toString().padStart(3)}% [${bar}] ${temp}°C\n`;
        }
        cpuOutput.textContent = cpuData;

        // Memory Usage
        const totalMem = 32; // GB
        const usedMem = (Math.random() * totalMem * 0.7).toFixed(1); // Up to 70% used
        const freeMem = (totalMem - usedMem).toFixed(1);
        const memPercent = ((usedMem / totalMem) * 100).toFixed(0);
        const memBar = '█'.repeat(Math.floor(memPercent / 10)).padEnd(10, '░');

        memOutput.textContent = `MEM: Total: ${totalMem}GB\nUsed: ${usedMem}GB (${memPercent}%)\nFree: ${freeMem}GB\n[${memBar}]`;

        // Network Activity
        const downloadSpeed = (Math.random() * 1000).toFixed(0); // KB/s
        const uploadSpeed = (Math.random() * 500).toFixed(0); // KB/s
        const totalDown = (Math.random() * 10000).toFixed(0); // MB
        const totalUp = (Math.random() * 5000).toFixed(0); // MB

        netOutput.textContent = `NET: eth0\nDownload: ${downloadSpeed} KB/s (Total: ${totalDown} MB)\nUpload: ${uploadSpeed} KB/s (Total: ${totalUp} MB)`;
    }
    setInterval(updateSystemWidgets, 2000); // Update every 2 seconds
    updateSystemWidgets(); // Initial call

    // Terminal functions
    function writeOutput(text) {
        terminalOutput.innerHTML += ansiToHtml(text);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function writePrompt() {
        currentPromptSpan.innerHTML = `${username}@${hostname}:<span class="path">${currentPath}</span>$ `;
        terminalInput.focus();
    }

    // Function to convert ANSI escape codes to HTML
    function ansiToHtml(text) {
        const ansiColors = {
            '30': 'black', '31': 'red', '32': 'green', '33': 'yellow',
            '34': 'blue', '35': 'magenta', '36': 'cyan', '37': 'white',
            '90': 'bright-black', '91': 'bright-red', '92': 'bright-green', '93': 'bright-yellow',
            '94': 'bright-blue', '95': 'bright-magenta', '96': 'bright-cyan', '97': 'bright-white'
        };
        const ansiStyles = {
            '1': 'bold', '4': 'underline'
        };

        let html = '';
        let openTags = [];

        // Regex to find ANSI escape codes
        const regex = /\x1b\[([0-9;]*)m/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Add text before the escape code
            if (match.index > lastIndex) {
                html += text.substring(lastIndex, match.index);
            }

            const codes = match[1].split(';');
            codes.forEach(code => {
                if (code === '0' || code === '') { // Reset
                    while (openTags.length > 0) {
                        html += `</span>`;
                        openTags.pop();
                    }
                } else if (ansiColors[code]) {
                    html += `<span class="ansi-${ansiColors[code]}">`;
                    openTags.push('span');
                } else if (ansiStyles[code]) {
                    html += `<span class="ansi-${ansiStyles[code]}">`;
                    openTags.push('span');
                }
            });
            lastIndex = regex.lastIndex;
        }

        // Add any remaining text
        if (lastIndex < text.length) {
            html += text.substring(lastIndex);
        }

        // Close any remaining open tags
        while (openTags.length > 0) {
            html += `</span>`;
            openTags.pop();
        }

        return html;
    }

    function getDirectory(path) {
        let parts = path.split('/').filter(p => p !== '');
        let current = fileSystem;
        for (let i = 0; i < parts.length; i++) {
            if (current.children && current.children[parts[i]]) {
                current = current.children[parts[i]];
            } else {
                return null; // Path not found
            }
        }
        return current;
    }

    function resolvePath(path) {
        let resolved;
        if (path.startsWith('/')) {
            resolved = path;
        } else {
            resolved = currentPath + (currentPath.endsWith('/') ? '' : '/') + path;
        }

        // Handle '..' and '.'
        let parts = resolved.split('/').filter(p => p !== '');
        let newParts = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i] === '..') {
                if (newParts.length > 0) {
                    newParts.pop();
                }
            } else if (parts[i] !== '.') {
                newParts.push(parts[i]);
            }
        }
        return '/' + newParts.join('/');
    }

    async function executeCommand(commandLine) {
        writeOutput(`<span class="prompt">${username}@${hostname}:<span class="path">${currentPath}</span>$ </span>${commandLine}\n`);

        if (commandLine.trim() === '') {
            writePrompt();
            return;
        }

        commandHistory.push(commandLine);
        historyIndex = commandHistory.length;

        const parts = commandLine.split(' ').filter(p => p !== '');
        const command = parts[0];
        const args = parts.slice(1);

        switch (command) {
            case 'help':
                writeOutput(`Available commands:\n`);
                writeOutput(`  help - display this help message\n`);
                writeOutput(`  clear - clear the terminal screen\n`);
                writeOutput(`  ls - list directory contents\n`);
                writeOutput(`  cd [directory] - change the current directory\n`);
                writeOutput(`  cat [file] - display file contents\n`);
                writeOutput(`  echo [text] - display a line of text\n`);
                writeOutput(`  whoami - print effective userid\n`);
                writeOutput(`  pwd - print name of current working directory\n`);
                writeOutput(`  github [username] - fetch and display GitHub repositories\n`);
                writeOutput(`  about - display information about me\n`);
                writeOutput(`  neofetch - display system information\n`);
                break;
            case 'neofetch':
                displayNeofetch();
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                break;
            case 'ls':
                const targetPath = args[0] ? resolvePath(args[0]) : currentPath;
                const dir = getDirectory(targetPath);
                if (dir && dir.type === 'directory') {
                    for (const item in dir.children) {
                        const child = dir.children[item];
                        const color = child.type === 'directory' ? 'lightblue' : (child.type === 'executable' ? 'lightgreen' : 'white');
                        writeOutput(`<span style="color: ${color}">${item}</span>  `);
                    }
                    writeOutput('\n');
                } else if (dir && dir.type === 'file') {
                    writeOutput(`${args[0]}\n`);
                } else {
                    writeOutput(`ls: cannot access '${args[0] || '.'}': No such file or directory\n`);
                }
                break;
            case 'cd':
                if (args.length === 0 || args[0] === '~') {
                    currentPath = '/home/user';
                } else {
                    const newPath = resolvePath(args[0]);
                    const targetDir = getDirectory(newPath);
                    if (targetDir && targetDir.type === 'directory') {
                        currentPath = newPath;
                    } else {
                        writeOutput(`cd: no such file or directory: ${args[0]}\n`);
                    }
                }
                break;
            case 'cat':
                if (args.length === 0) {
                    writeOutput('cat: missing operand\n');
                } else {
                    const filePath = resolvePath(args[0]);
                    const file = getDirectory(filePath);
                    if (file && file.type === 'file') {
                        writeOutput(file.content + '\n');
                    } else if (file && file.type === 'directory') {
                        writeOutput(`cat: ${args[0]}: Is a directory\n`);
                    } else {
                        writeOutput(`cat: ${args[0]}: No such file or directory\n`);
                    }
                }
                break;
            case 'echo':
                writeOutput(args.join(' ') + '\n');
                break;
            case 'whoami':
                writeOutput(`${username}\n`);
                break;
            case 'pwd':
                writeOutput(`${currentPath}\n`);
                break;
            case 'github':
                const githubUsername = args[0] || 'bummy1337'; // Default username
                await fetchGitHubRepos(githubUsername);
                openWindow(portfolioWindow, `GitHub Repositories for ${githubUsername}`);
                break;
            case 'about':
                displayAboutMe();
                openWindow(portfolioWindow, 'About Me');
                break;
            default:
                writeOutput(`Command not found: ${commandLine}\n`);
                break;
        }
        writePrompt();
    }

    // Function to display neofetch output
    function displayNeofetch() {
        const os = 'bummylnx';
        const kernel = '6.6.6-zen';
        const uptime = '2h 30m'; // Simplified uptime
        const packages = '1337 (pacman)';
        const shell = 'bash';
        const resolution = `${window.innerWidth}x${window.innerHeight}`;
        const desktopEnv = 'hyprland'; // Example DE
        const wm = 'Xfwm4'; // Example WM
        const theme = 'Adwaita-dark [GTK2/3]';
        const icons = 'Adwaita [GTK2/3]';
        const terminal = 'Terminal.js';
        const cpu = 'AMD Ryzen 7 2700 (16) @ 3.200GHz';
        const gpu = 'NVIDIA GeForce RTX 3060';
        const memory = '16GB';

        const neofetchOutput = `\x1b[32m
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠠⠀⠠⠀⠄⠠⠠⠀⠤⠀⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⠐⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠑⠀⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠀⢀⠔⠁⠀⠀⠀⢀⠤⠀⠀⠀⠀⠀⠀⠠⢀⠀⠀⠀⠀⡈⠢⡀⠀⢀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢀⠔⠁⠤⠑⡖⠁⠀⠀⠀⠀⠔⠀⠀⠀⠀⢀⠀⠀⠀⠀⠀⠑⢄⠀⠀⠈⠠⡘⢖⠁⠈⠐⡄⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢠⠂⡐⠀⠀⡊⠀⠀⠀⠀⠀⡡⠒⠀⠀⠀⢀⠆⢣⠀⠀⠀⠀⠀⢄⠡⡀⠀⠀⠈⢌⢆⠂⠄⠈⢢⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠆⠐⠀⠀⡜⢀⠀⠀⠀⠀⡔⠀⠀⠀⠀⡠⠃⠀⠀⠣⡀⠀⠀⠀⠀⠐⢵⡀⠀⠀⠈⡌⡂⠈⠆⠀⢢⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡘⠀⠉⠀⢀⡇⠌⠀⠀⠀⡔⠀⠀⠀⣀⠖⠀⠀⠀⠀⠀⠈⠦⣀⠀⠀⠀⠀⠇⠀⠀⠀⠘⢧⠀⠸⠀⠀⢇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⡁⠀⠀⠀⢸⢢⠁⠀⠀⠐⠀⠀⡠⠚⠀⠉⠂⠀⠀⠀⠀⠀⠘⠀⠸⢅⠀⠀⠸⠀⠀⠀⠀⣿⡀⠀⡇⠀⠈⠄⠀⠀⠀⠀
⢰⠠⣤⠄⠸⠀⠀⠀⣀⡜⡌⠀⠀⠀⢸⠉⣅⣤⣀⣒⠄⠀⠀⠀⠀⠀⠀⠠⢐⣠⣤⣤⣱⠒⡇⠀⠀⠀⢸⡡⠀⠃⠤⠤⢤⡄⠖⢒⠆
⠀⠱⢄⠈⢅⠒⢐⠠⢄⠈⡇⠀⠀⠐⢻⠟⢋⠟⢋⠙⣗⡄⠀⠀⠀⠀⠀⢐⡟⢉⠙⢮⠙⢷⡟⠀⠀⠀⢸⢀⠄⠂⢠⠍⠀⢀⠄⠊⠀
⠀⠀⢀⠕⠠⡀⠈⠂⠣⠀⠆⠀⠀⠀⠸⠂⢸⣀⠻⢇⢸⠀⠀⠀⠀⠀⠀⠸⣀⠿⢄⢸⠀⢁⠃⠀⠀⠠⢸⢨⠀⠀⠀⡠⠔⢡⠀⠀⠀
⠀⢀⠌⠀⠀⠑⠠⡀⠀⠂⡆⡆⠀⠀⡀⡆⠈⢫⢀⠸⠊⠀⠀⠀⠀⠀⠀⠀⠫⢄⠨⠊⠀⡘⠀⠀⠀⢰⢸⠈⢀⡠⠐⠁⠀⠈⡆⠀⠀
⢀⠎⢀⠎⠀⠀⡘⠘⠈⠐⢣⢰⡀⠀⠸⣜⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⢥⠆⠀⡠⢨⠎⠉⢡⠐⠀⠀⠀⠀⢰⠀⠀
⡎⠰⢉⠀⠀⠀⣣⠂⠀⠀⠀⠻⠔⠄⡀⢯⡘⠂⠀⠀⠀⠀⠀⠰⣓⡄⠀⠀⠀⠀⠨⡰⢀⡞⠠⠊⠻⠊⠀⠀⠈⠰⠀⠀⠀⠆⢰⠀⠀
⡇⡆⢈⠀⡇⠀⠃⠀⠀⠀⠀⠀⠀⠀⠈⠉⠑⠢⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡠⠘⠁⠀⠀⠀⠀⠀⠀⠀⢰⣸⠀⠀⡘⢀⡌⠀⠀
⠈⠣⠨⡐⠘⠆⡘⢄⡀⠀⠀⠀⠀⠀⢨⠑⡀⠀⠀⢀⣸⢲⡆⠠⠀⠤⢒⣾⣻⣄⠎⡇⢀⠞⠠⠀⠀⠀⠀⠀⢋⠆⢀⠔⠡⠋⠀⠀⠀
⠀⠀⠀⠈⠁⠀⠈⠁⠀⠀⠀⠐⢏⠢⡠⢆⠱⡔⠒⠉⢾⢱⢫⢉⠉⠉⠛⠘⠁⣷⠀⢎⡍⢀⢦⠔⢋⠄⠀⠀⠉⠀⠁⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡠⢄⡊⠢⡀⠙⠂⠐⣄⠀⠋⣾⢨⠿⠿⠀⢀⡠⡸⢞⠀⠈⠀⠚⢁⠄⠋⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢉⠢⢀⡈⠁⡠⠐⡐⠈⠐⠁⡩⠏⡚⠛⠙⣂⣏⠓⠚⠐⠄⠐⢀⠀⣀⡠⢝⡗⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⢠⠖⠋⠮⡥⣴⡀⠀⠐⠁⠀⡠⠃⠀⠀⠀⠀⠊⠀⠀⡁⠢⠀⠀⠁⠀⢀⡺⢩⡞⡂⢄⠓⢄⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡴⠖⡡⡎⣸⠈⡌⠀⠀⡴⢊⠀⠀⠀⠀⠀⠀⠀⢀⠚⠀⠀⠀⠱⢣⠈⢡⠃⡈⡃⡄⠀⠐⠈⢄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠰⠁⢀⠃⢇⢉⠆⠱⡀⡴⠁⡘⠀⠀⠀⠀⠀⠀⢀⠊⠀⠀⠀⠀⣆⡈⡢⠊⢠⡡⡱⠁⠀⠀⠀⢸⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⢰⠀⠈⠀⠈⢦⠉⡢⡈⠑⡺⠃⠀⠀⠀⠀⢀⠔⠁⠀⠀⠀⠀⠀⠈⠣⣅⠔⢔⠔⠁⠀⠀⠀⠀⠜⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠱⡀⠀⠀⠀⠉⢢⣼⠏⠀⠀⠀⠀⠀⡠⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠈⢗⠤⠀⣀⡀⡠⠊⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠂⠤⠄⠊⠒⠁⠧⠀⠀⠀⠀⠘⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠺⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
\x1b[0m
        \x1b[36m${username}\x1b[0m@\x1b[32m${hostname}\x1b[0m
        ------------------
        \x1b[33mOS\x1b[0m: ${os}
        \x1b[33mKernel\x1b[0m: ${kernel}
        \x1b[33mUptime\x1b[0m: ${uptime}
        \x1b[33mPackages\x1b[0m: ${packages}
        \x1b[33mShell\x1b[0m: ${shell}
        \x1b[33mResolution\x1b[0m: ${resolution}
        \x1b[33mDE\x1b[0m: ${desktopEnv}
        \x1b[33mWM\x1b[0m: ${wm}
        \x1b[33mTheme\x1b[0m: ${theme}
        \x1b[33mIcons\x1b[0m: ${icons}
        \x1b[33mTerminal\x1b[0m: ${terminal}
        \x1b[33mCPU\x1b[0m: ${cpu}
        \x1b[33mGPU\x1b[0m: ${gpu}
        \x1b[33mMemory\x1b[0m: ${memory}
        `;
        writeOutput(`<pre>${neofetchOutput}</pre>\n`);
    }

    // Function to fetch GitHub repositories
    async function fetchGitHubRepos(ghUsername) {
        githubReposDiv.innerHTML = 'Fetching repositories...';
        try {
            const response = await fetch(`https://api.github.com/users/${ghUsername}/repos`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const repos = await response.json();
            displayRepos(repos);
        } catch (error) {
            githubReposDiv.innerHTML = `<p style="color: red;">Error fetching repositories: ${error.message}. Please check the username or try again later.</p>`;
            console.error('Error fetching GitHub repositories:', error);
        }
    }

    // Function to display repositories
    function displayRepos(repos) {
        if (repos.length === 0) {
            githubReposDiv.innerHTML = '<p>No public repositories found for this user.</p>';
            return;
        }

        githubReposDiv.innerHTML = '<h2>My GitHub Repositories</h2>';
        repos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.classList.add('repo-card');
            repoCard.innerHTML = `
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'No description provided.'}</p>
                <p>Language: ${repo.language || 'N/A'}</p>
                <p>Stars: ${repo.stargazers_count}</p>
            `;
            repoCard.addEventListener('click', () => openRepoDetail(repo)); // Add click listener
            githubReposDiv.appendChild(repoCard);
        });
    }

    // Function to open repository detail window
    async function openRepoDetail(repo) {
        currentRepo = repo;
        openWindow(repoDetailWindow, repo.name);
        repoDetailTitle.textContent = repo.name;
        // Default to showing files
        switchRepoDetailSection('files');
    }

    // Function to switch between repo detail sections (Files, README, Releases)
    async function switchRepoDetailSection(section) {
        repoDetailNavItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`.repo-detail-nav-item[data-section="${section}"]`).classList.add('active');

        repoDetailContent.innerHTML = 'Loading...';

        switch (section) {
            case 'files':
                await renderRepoFiles(currentRepo);
                break;
            case 'readme':
                await renderReadme(currentRepo);
                break;
            case 'releases':
                await renderReleases(currentRepo);
                break;
        }
    }

    // Function to render repository files and directories
    async function renderRepoFiles(repo, path = '') {
        repoDetailContent.innerHTML = `<h3>Files & Directories for ${repo.name}${path}</h3>`;
        repoDetailContent.innerHTML += `<div class="clone-command">
                                            <span>git clone ${repo.clone_url}</span>
                                            <button class="copy-clone-btn" data-clone-url="${repo.clone_url}">Copy</button>
                                        </div>`;
        try {
            const response = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents${path}`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const contents = await response.json();

            if (path !== '') {
                repoDetailContent.innerHTML += `<div class="dir-item" data-path="${path.substring(0, path.lastIndexOf('/')) || ''}"><i class="fas fa-folder"></i> ..</div>`;
            }

            contents.forEach(item => {
                if (item.type === 'dir') {
                    repoDetailContent.innerHTML += `<div class="dir-item" data-path="${path}/${item.name}"><i class="fas fa-folder"></i> ${item.name}</div>`;
                } else {
                    repoDetailContent.innerHTML += `<div class="file-item" data-url="${item.download_url}"><i class="fas fa-file"></i> ${item.name}</div>`;
                }
            });

            // Add event listeners for directory navigation
            repoDetailContent.querySelectorAll('.dir-item').forEach(dirItem => {
                dirItem.addEventListener('click', () => {
                    renderRepoFiles(repo, dirItem.dataset.path);
                });
            });

            // Add event listeners for file viewing
            repoDetailContent.querySelectorAll('.file-item').forEach(fileItem => {
                fileItem.addEventListener('click', async () => {
                    const fileUrl = fileItem.dataset.url;
                    const fileName = fileItem.textContent.trim();
                    if (fileUrl) {
                        repoDetailContent.innerHTML = `<h3>${fileName}</h3><p>Loading file content...</p>`;
                        try {
                            const response = await fetch(fileUrl);
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            const fileContent = await response.text();

                            // Limit display size for very large files to prevent crashes
                            const MAX_DISPLAY_SIZE = 100 * 1024; // 100 KB
                            if (fileContent.length > MAX_DISPLAY_SIZE) {
                                repoDetailContent.innerHTML = `<h3>${fileName}</h3>
                                    <p style="color: yellow;">File is too large to display directly (${(fileContent.length / 1024).toFixed(2)} KB). Please download it to view full content.</p>
                                    <a href="${fileUrl}" target="_blank" class="download-link"><i class="fas fa-download"></i> Download ${fileName}</a>`;
                            } else {
                                repoDetailContent.innerHTML = `<h3>${fileName}</h3><pre>${escapeHtml(fileContent)}</pre>`;
                            }
                        } catch (error) {
                            repoDetailContent.innerHTML = `<p style="color: red;">Error fetching file content: ${error.message}</p>`;
                            console.error('Error fetching file content:', error);
                        }
                    }
                });
            });

            // Add event listener for copy clone button
            repoDetailContent.querySelector('.copy-clone-btn').addEventListener('click', (e) => {
                copyToClipboard(e.target.dataset.cloneUrl);
                e.target.textContent = 'Copied!';
                setTimeout(() => e.target.textContent = 'Copy', 2000);
            });

        } catch (error) {
            repoDetailContent.innerHTML = `<p style="color: red;">Error fetching repository contents: ${error.message}</p>`;
            console.error('Error fetching repo contents:', error);
        }
    }

    // Function to render README content
    async function renderReadme(repo) {
        repoDetailContent.innerHTML = `<h3>README.md for ${repo.name}</h3>`;
        try {
            const response = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`);
            if (!response.ok) {
                if (response.status === 404) {
                    repoDetailContent.innerHTML += '<p>No README.md found for this repository.</p>';
                    return;
                }
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const readmeData = await response.json();
            const base64Content = readmeData.content;
            // Decode Base64 to a binary string, then convert to UTF-8
            const readmeContent = decodeURIComponent(escape(atob(base64Content)));
            // Use marked.js to convert Markdown to HTML
            repoDetailContent.innerHTML += marked.parse(readmeContent);
        } catch (error) {
            repoDetailContent.innerHTML = `<p style="color: red;">Error fetching README: ${error.message}</p>`;
            console.error('Error fetching README:', error);
        }
    }

    // Function to render releases
    async function renderReleases(repo) {
        repoDetailContent.innerHTML = `<h3>Releases for ${repo.name}</h3>`;
        try {
            const response = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases`);
            if (!response.ok) {
                if (response.status === 404) {
                    repoDetailContent.innerHTML += '<p>No releases found for this repository.</p>';
                    return;
                }
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const releases = await response.json();

            if (releases.length === 0) {
                repoDetailContent.innerHTML += '<p>No releases found for this repository.</p>';
                return;
            }

            releases.forEach(release => {
                repoDetailContent.innerHTML += `
                    <div class="repo-release-card">
                        <h4>${release.tag_name} - ${new Date(release.published_at).toLocaleDateString()}</h4>
                        <p>${release.name || 'No title'}</p>
                        <p>${release.body || 'No description'}</p>
                        <ul>
                            ${release.assets.map(asset => `
                                <li><a href="${asset.browser_download_url}" target="_blank"><i class="fas fa-download"></i> ${asset.name} (${(asset.size / 1024 / 1024).toFixed(2)} MB)</a></li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            });
        } catch (error) {
            repoDetailContent.innerHTML = `<p style="color: red;">Error fetching releases: ${error.message}</p>`;
            console.error('Error fetching releases:', error);
        }
    }

    // Utility function to escape HTML for displaying raw file content
    function escapeHtml(unsafe) {
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }

    // Utility function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    // Add event listeners for repo detail navigation
    repoDetailNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            switchRepoDetailSection(e.target.dataset.section);
        });
    });

    // Display About Me content
    function displayAboutMe() {
        githubReposDiv.innerHTML = `
            <h2>About Me</h2>
            <p>Hello! I'm a software engineer with a passion for creating robust and scalable applications. I enjoy working with various technologies and constantly learning new things.</p>
            <p>This portfolio is designed to mimic an desktop environment, showcasing my projects in a unique way.</p>
        `;
    }

    // Handle input from the terminal input field
    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const commandLine = terminalInput.value.trim();
            terminalInput.value = '';
            await executeCommand(commandLine);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });

    // Focus the terminal input when the terminal window is active
    terminalWindow.addEventListener('click', () => {
        terminalInput.focus();
    });

    // Also focus when the document is clicked, if terminal is open
    document.addEventListener('click', () => {
        if (terminalWindow.style.display === 'flex') {
            terminalInput.focus();
        }
    });


    // Window management functions
    function openWindow(windowElement, title) {
        windowElement.style.display = 'flex';
        windowElement.querySelector('.window-title').textContent = title;
        bringWindowToFront(windowElement);
        // If opening terminal, focus its input
        if (windowElement === terminalWindow) {
            terminalInput.focus();
        }
    }

    function closeWindow(windowElement) {
        windowElement.style.display = 'none';
        if (activeWindow === windowElement) {
            activeWindow = null;
        }
    }

    function minimizeWindow(windowElement) {
        windowElement.style.display = 'none'; // For simplicity, just hide it
    }

    function maximizeWindow(windowElement) {
        // Toggle maximize state
        if (windowElement.classList.contains('maximized')) {
            windowElement.classList.remove('maximized');
            windowElement.style.width = windowElement._originalWidth || '700px';
            windowElement.style.height = windowElement._originalHeight || '500px';
            windowElement.style.top = windowElement._originalTop || '100px';
            windowElement.style.left = windowElement._originalLeft || '200px';
        } else {
            windowElement.classList.add('maximized');
            windowElement._originalWidth = windowElement.style.width;
            windowElement._originalHeight = windowElement.style.height;
            windowElement._originalTop = windowElement.style.top;
            windowElement._originalLeft = windowElement.style.left;

            windowElement.style.width = '100vw';
            windowElement.style.height = 'calc(100vh - 40px)'; /* Adjust for panel height */
            windowElement.style.top = '40px';
            windowElement.style.left = '0';
        }
    }

    function bringWindowToFront(windowElement) {
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
            win.style.zIndex = 99;
        });
        windowElement.classList.add('active');
        windowElement.style.zIndex = 101;
        activeWindow = windowElement;
    }

    // Make windows draggable
    function makeDraggable(windowElement) {
        let isDragging = false;
        let offsetX, offsetY;

        const header = windowElement.querySelector('.window-header');

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-button')) return; // Don't drag if clicking buttons
            isDragging = true;
            offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - windowElement.getBoundingClientRect().top;
            windowElement.style.cursor = 'grabbing';
            bringWindowToFront(windowElement);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            windowElement.style.left = `${e.clientX - offsetX}px`;
            windowElement.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowElement.style.cursor = 'grab';
        });
    }

    makeDraggable(terminalWindow);
    makeDraggable(portfolioWindow);
    makeDraggable(repoDetailWindow); // Make the new repo detail window draggable

    // Attach event listeners for window buttons
    document.querySelectorAll('.window-button.close').forEach(button => {
        button.addEventListener('click', (e) => {
            closeWindow(e.target.closest('.window'));
        });
    });

    document.querySelectorAll('.window-button.minimize').forEach(button => {
        button.addEventListener('click', (e) => {
            minimizeWindow(e.target.closest('.window'));
        });
    });

    document.querySelectorAll('.window-button.maximize').forEach(button => {
        button.addEventListener('click', (e) => {
            maximizeWindow(e.target.closest('.window'));
        });
    });

    // Desktop icon click handlers
    terminalIcon.addEventListener('click', () => {
        openWindow(terminalWindow, 'Terminal');
    });

    githubIcon.addEventListener('click', () => {
        fetchGitHubRepos('bummy1337'); // Fetch repos on GitHub icon click
        openWindow(portfolioWindow, 'GitHub Repositories');
    });

    aboutIcon.addEventListener('click', () => {
        displayAboutMe();
        openWindow(portfolioWindow, 'About Me');
    });

    // New desktop icon click handlers
    catshadeIcon.addEventListener('click', () => {
        window.open('https://catshade.ru', '_blank');
    });

    minecraftIcon.addEventListener('click', () => {
        window.open('https://legacymirror.space', '_blank');
    });

    // Initial setup
    // Initial messages are now in index.html, just write the prompt
    writePrompt();

    // Automatically fetch GitHub repos and display them in the portfolio window
    fetchGitHubRepos('bummy1337');
    openWindow(portfolioWindow, 'GitHub Repositories');
});
