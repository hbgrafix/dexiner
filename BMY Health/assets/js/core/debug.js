// debug.js
const SESSION_ID = Date.now();
const LOG_KEY = 'logs_' + SESSION_ID;
let DEBUG_MODE = false; // Off by default

// 🔹 Store log in localStorage
function storeLog(level, file, message) {
    try {
        const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
        logs.push({
            time: new Date().toISOString(),
            session: SESSION_ID,
            level,
            file,
            message
        });
        localStorage.setItem(LOG_KEY, JSON.stringify(logs));
    } catch (err) {
        console.warn('Log storage failed:', err);
    }
}

// 🔹 Auto-detect caller file
function getCallerFile() {
    const err = new Error();
    // index [0] is this, index [1] is getCallerFile, index [2] is log(), [3] is helper, [4] is *actual caller*
    const stackLine = (err.stack?.split('\n')[4] || '').trim();
    const match = stackLine.match(/\/([^/]+\.js):\d+/);
    return match ? match[1] : 'unknown';
}

// 🔹 Core logger
function logMessage(level, ...args) {
    const file = getCallerFile();
    const message = args.join(' ');

    const colors = {
        info: 'color: #3498db',
        warn: 'color: #f39c12',
        success: 'color: #2ecc71',
        error: 'color: #e74c3c',
        group: 'color: #9b59b6'
    };

    if (DEBUG_MODE || level === 'error') {
        console.log(`%c${level.toUpperCase()} @${file}:`, colors[level] || '', message);
    }

    storeLog(level, file, message);
}

// 🔹 API
const log = (...args)       => logMessage('info', ...args);
log.info     = (...args)    => logMessage('info', ...args);
log.warn     = (...args)    => logMessage('warn', ...args);
log.success  = (...args)    => logMessage('success', ...args);
log.error    = (...args)    => logMessage('error', ...args);
log.group    = (label)      => { if (DEBUG_MODE) console.group(label); storeLog('group', getCallerFile(), label); };
log.groupEnd = ()           => { if (DEBUG_MODE) console.groupEnd(); };

// 🔹 Enable / Disable / Check mode
log.enable  = () => { DEBUG_MODE = true;  log.info('Debug mode enabled'); };
log.disable = () => { DEBUG_MODE = false; log.info('Debug mode disabled'); };
log.isDebug = () => DEBUG_MODE;

// 🔹 Download logs
log.download = () => {
    try {
        const logs = localStorage.getItem(LOG_KEY) || '';
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${LOG_KEY}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Failed to download logs:', err);
    }
};

// 🔹 Clear logs
log.clear = () => {
    localStorage.removeItem(LOG_KEY);
};

// 🔹 Auto-attach to window
if (typeof window !== 'undefined') {
    window.log = log;
}

export default log;


// Usage:
// log('Hello, world!');
// log.info('Hello, world!');
// log.warn('Hello, world!');
// log.success('Hello, world!');
// log.error('Hello, world!');
// log.group('Hello, world!');
// log.groupEnd();
// log.enable();
// log.disable();
// log.isDebug();
// log.download();
// log.clear();

// If not shipping this debug.js file, paste follwoing line in head of index.html:
// <script>window.log = new Proxy(() => {}, { get: () => () => {} });</script>