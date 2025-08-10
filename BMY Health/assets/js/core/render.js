import State from './state.js';
import { loadComponent, unloadComponent, clearAllComponents } from './loader.js';

let loaded = new Map();

async function renderLayout() {
  const role = State.get('role') || 'default';
  const config = await fetch('./json/config.json').then(r => r.json());
  const roleConfig = config[role] || config.default;

  // Clear all previously loaded components
  clearAllComponents();
  loaded.clear();

  // Load layout components (header, footer, sidebar, etc.)
  const layoutComponents = roleConfig.components || [];
  for (const name of layoutComponents) {
    const path = resolvePath('components', name);
    const html = await fetchHTML(path);
    const targetSelector = extractTargetFromHTML(html) || '#app'; // fallback if not declared
    await loadComponent(path, targetSelector);
    loaded.set(`${path}@${targetSelector}`, true);
  }

  // Save permission map
  State.set('permissions', {
    [role]: [...(roleConfig.features || []), ...(roleConfig.utilities || [])]
  });

  log(`Layout rendered for role: ${role}`);
}

// Resolve type path
function resolvePath(type, name) {
  return `${type}/${name}`;
}

// Fetch component template
async function fetchHTML(path) {
  const res = await fetch(`./templates/${path}.html`);
  if (!res.ok) throw new Error(`Failed to load template: ${path}`);
  return await res.text();
}

// Read data-target from first element in HTML
function extractTargetFromHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  return div.firstElementChild?.getAttribute('data-target');
}

export {
  renderLayout,
};

export default renderLayout;


