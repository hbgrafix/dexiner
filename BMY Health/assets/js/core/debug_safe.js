// safeLogger.js
let log;

if (window.DEBUG_MODE_ENABLED) {
    // Real debug logger
    log = (await import('./assets/js/core/debug.js')).default;
} else {
    // Silent stub with same API
    const noop = () => {};
    log = Object.assign(noop, {
        info: noop,
        warn: noop,
        success: noop,
        error: noop,
        group: noop,
        groupEnd: noop,
        download: noop,
        clear: noop
    });
}

export default log;
