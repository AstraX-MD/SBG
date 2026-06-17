export default (db) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${db.botname} Dashboard</title>
    <style>
        :root {
            --bg: #141311;
            --card: #1c1b18;
            --gold: #E1B64E;
            --text: #e0e0e0;
            --muted: #888;
            --neon: #E1B64E;
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            padding-bottom: 80px;
            overflow-x: hidden;
        }
        .header {
            padding: 20px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 { color: var(--gold); font-size: 1.2rem; margin: 0; }
        .status-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: #4caf50; display: inline-block;
            box-shadow: 0 0 10px #4caf50;
        }

        .container { padding: 15px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .card {
            background: var(--card);
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .card-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }
        .card-value { font-size: 1.2rem; font-weight: bold; color: var(--gold); margin-top: 5px; }

        .tab-content { display: none; animation: fadeIn 0.3s ease; }
        .tab-content.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .list-item {
            background: var(--card);
            border: 1px solid #333;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 8px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .list-item span:first-child { color: var(--gold); font-family: monospace; }

        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; font-size: 0.8rem; color: var(--muted); margin-bottom: 5px; }
        input {
            width: 100%; background: #222; border: 1px solid #444;
            color: white; padding: 12px; border-radius: 8px; outline: none;
        }
        .btn {
            background: var(--gold); color: black; border: none;
            padding: 12px; border-radius: 8px; width: 100%;
            font-weight: bold; margin-top: 10px; cursor: pointer;
        }
        .toggle-group { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        
        .mode-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .mode-btn {
            background: #222; border: 1px solid #444; color: white;
            padding: 10px 5px; border-radius: 8px; font-size: 0.7rem;
            cursor: pointer;
        }
        .mode-btn.active { border-color: var(--gold); color: var(--gold); background: #2a2824; }

        .nav {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: #1c1b18; border-top: 1px solid #333;
            display: flex; justify-content: space-around;
            padding: 10px 0; z-index: 100;
        }
        .nav-item {
            text-align: center; color: var(--muted); font-size: 0.6rem;
            text-decoration: none; cursor: pointer;
        }
        .nav-item.active { color: var(--gold); }
        .nav-item svg { width: 20px; height: 20px; margin-bottom: 4px; display: block; margin: 0 auto; }

        .history-item { font-size: 0.8rem; border-left: 2px solid var(--gold); padding-left: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦚 ${db.botname}</h1>
        <div><span class="status-dot"></span> <span style="font-size: 0.8rem; color: #4caf50;">ONLINE</span></div>
    </div>

    <div class="container">
        <!-- Dashboard Summary -->
        <div class="grid">
            <div class="card">
                <div class="card-label">Used Today</div>
                <div id="stat-today" class="card-value">0</div>
            </div>
            <div class="card">
                <div class="card-label">Total Used</div>
                <div id="stat-total" class="card-value">0</div>
            </div>
            <div class="card">
                <div class="card-label">Current Mode</div>
                <div id="stat-mode" class="card-value">${db.mode.toUpperCase()}</div>
            </div>
            <div class="card">
                <div class="card-label">Commands</div>
                <div id="stat-cmds" class="card-value">0</div>
            </div>
        </div>

        <!-- Tab Content: Stats -->
        <div id="tab-stats" class="tab-content active">
            <h3 style="font-size: 0.9rem; color: var(--muted);">TOP COMMANDS</h3>
            <div id="top-commands"></div>
            <h3 style="font-size: 0.9rem; color: var(--muted); margin-top: 20px;">LAST USAGE</h3>
            <div id="usage-history"></div>
        </div>

        <!-- Tab Content: Settings -->
        <div id="tab-settings" class="tab-content">
            <div class="form-group">
                <label>BOT NAME</label>
                <input type="text" id="input-botname" value="${db.botname}">
                <button class="btn" onclick="updateField('botname', 'input-botname')">SAVE NAME</button>
            </div>
            <div class="form-group">
                <label>PREFIX</label>
                <input type="text" id="input-prefix" value="${db.prefix}">
                <button class="btn" onclick="updateField('prefix', 'input-prefix')">SAVE PREFIX</button>
            </div>
            <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
            <div class="toggle-group">
                <span>No Prefix</span>
                <input type="checkbox" id="check-noprefix" ${db.noprefix ? 'checked' : ''} onchange="updateToggle('noprefix', this.checked)">
            </div>
            <div class="toggle-group">
                <span>Cmd Reactions</span>
                <input type="checkbox" id="check-cmdreact" ${db.cmdreact ? 'checked' : ''} onchange="updateToggle('cmdreact', this.checked)">
            </div>
            <div class="toggle-group">
                <span>Confirm Msgs</span>
                <input type="checkbox" id="check-confirm" ${db.confirmMsg ? 'checked' : ''} onchange="updateToggle('confirmMsg', this.checked)">
            </div>
        </div>

        <!-- Tab Content: Modes -->
        <div id="tab-modes" class="tab-content">
            <div class="mode-grid">
                <button class="mode-btn ${db.mode === 'public' ? 'active' : ''}" onclick="setMode('public')">🌍 PUBLIC</button>
                <button class="mode-btn ${db.mode === 'private' ? 'active' : ''}" onclick="setMode('private')">🔒 PRIVATE</button>
                <button class="mode-btn ${db.mode === 'groups' ? 'active' : ''}" onclick="setMode('groups')">👥 GROUPS</button>
                <button class="mode-btn ${db.mode === 'dms' ? 'active' : ''}" onclick="setMode('dms')">📩 DMS</button>
                <button class="mode-btn ${db.mode === 'silent' ? 'active' : ''}" onclick="setMode('silent')">🔕 SILENT</button>
                <button class="mode-btn ${db.mode === 'onlynum' ? 'active' : ''}" onclick="setMode('onlynum')">📱 NUMBER</button>
            </div>
            <div id="mode-target-container" style="margin-top: 20px; display: none;">
                <label style="font-size: 0.8rem; color: var(--muted);">TARGET VALUE</label>
                <input type="text" id="input-target" placeholder="255xxx / JID">
                <button class="btn" onclick="applyModeWithTarget()">APPLY TARGET</button>
            </div>
        </div>

        <!-- Tab Content: Info -->
        <div id="tab-info" class="tab-content">
            <div class="list-item"><span>Platform</span> <span>${db.platform}</span></div>
            <div class="list-item"><span>Uptime</span> <span id="info-uptime">0s</span></div>
            <div class="list-item"><span>RAM Usage</span> <span id="info-ram">0MB</span></div>
            <div class="list-item"><span>OS Memory</span> <span id="info-os">0GB</span></div>
        </div>
    </div>

    <div class="nav">
        <div class="nav-item active" onclick="switchTab('stats', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
            STATS
        </div>
        <div class="nav-item" onclick="switchTab('settings', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            SETTINGS
        </div>
        <div class="nav-item" onclick="switchTab('modes', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            MODES
        </div>
        <div class="nav-item" onclick="switchTab('info', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            INFO
        </div>
    </div>

    <script>
        function switchTab(id, el) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.getElementById('tab-' + id).classList.add('active');
            el.classList.add('active');
        }

        async function updateField(field, inputId) {
            const val = document.getElementById(inputId).value;
            await fetch('/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value: val })
            });
            alert('Updated!');
        }

        async function updateToggle(field, value) {
            await fetch('/api/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field, value })
            });
        }

        async function setMode(mode) {
            if (['onlynum', 'onlytag', 'onlyjid'].includes(mode)) {
                document.getElementById('mode-target-container').style.display = 'block';
                window.pendingMode = mode;
            } else {
                await updateField('mode', mode);
                document.getElementById('stat-mode').innerText = mode.toUpperCase();
            }
        }

        async function refreshStats() {
            const res = await fetch('/api/stats');
            const data = await res.json();
            document.getElementById('stat-today').innerText = data.today;
            document.getElementById('stat-total').innerText = data.total;
            document.getElementById('stat-cmds').innerText = data.totalCommands;

            const top = Object.entries(data.commands).sort((a,b) => b[1]-a[1]).slice(0, 5);
            document.getElementById('top-commands').innerHTML = top.map(c => \`
                <div class="list-item"><span>\${c[0]}</span> <span>\${c[1]} uses</span></div>
            \`).join('');

            document.getElementById('usage-history').innerHTML = data.history.map(h => \`
                <div class="list-item history-item"><span>\${h.name}</span> <span style="font-size: 0.6rem; color: #888;">\${h.time}</span></div>
            \`).join('');
        }

        async function refreshInfo() {
            const res = await fetch('/api/info');
            const data = await res.json();
            document.getElementById('info-uptime').innerText = Math.floor(data.uptime) + 's';
            document.getElementById('info-ram').innerText = Math.round(data.memory.rss / 1024 / 1024) + 'MB';
            document.getElementById('info-os').innerText = Math.round(data.os.total / 1024 / 1024 / 1024) + 'GB';
        }

        setInterval(refreshStats, 5000);
        setInterval(refreshInfo, 30000);
        refreshStats();
        refreshInfo();
    </script>
</body>
</html>
`
