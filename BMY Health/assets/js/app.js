// app.js

// 🛡 Safe log stub if debug.js is not shipped
if(!window.log) window.log = new Proxy(() => {}, { get: () => () => {} });

import State from './core/state.js';
import renderLayout from './core/render.js';
import ui from './core/ui.js';
import log from './core/debug.js';

export async function initApp(role = 'admin') {
  window.State = State;
  // 🔹 Set debug state (hardcoded for now)
  State.set('debug', true); // TODO: make role-based from config.json
  log[State.get('debug') ? 'enable' : 'disable']();
  log.info(`Debug mode ${State.get('debug') ? 'enabled' : 'disabled'}`);

  // 🔹 Try to load config.json (silent fail if missing)
  try {
    const res = await fetch('/json/config.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const config = await res.json();
    State.set('config', config);
    log.success('Config loaded from config.json' + (State.get('debug') ? `: ${JSON.stringify(config)}` : ''));
  } catch (err) {
    //log.warn('No config.json found, using defaults');
    State.set('config', {}); // fallback empty config
  }

  // 🔹 Set role & route

  // Set data-role attribute on <body> to allow for custom styling per role
  document.body.setAttribute('data-role', role);

  const getRoleConfig = (role, type) => State.get('config')[role]?.[type] || State.get('config').default[type];

  // Generate lists of config items
  State.set('components', await getRoleConfig(role, 'components'));
  State.set('features', await getRoleConfig(role, 'features'));
  State.set('utilities', await getRoleConfig(role, 'utilities'));

  State.set('activeFeature', State.get('features')[0] || null);
  State.set('route', State.get('features')[0] || 'dashboard');



  // 🔹 Render and init UI
  await renderLayout();
  ui.init(role);
  log.success(`App initialized for role: ${role}, route: ${State.get('route')}`);
}
