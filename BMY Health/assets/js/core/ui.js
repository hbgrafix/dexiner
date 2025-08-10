import State from './state.js';
import { loadComponent, unloadComponent, clearAllComponents } from './loader.js';
import renderLayout from './render.js';

const ui = (() => {
  const selectors = {
    modal: '#modal',
    toggleSidebarBtn: '#toggleSidebar',
    darkModeBtn: '#darkModeToggle',
    sidebar: '#sidebar',
    navLinks: '#sidebar a, [data-load], [data-target]',
  };

  function init(role) {
    if (!role) return;
    renderSidebar();
    setupSidebarToggle();
    setupModalTriggers();
    setupAutoSidebarClose();
    setupDarkModeToggle();
    setupNavListeners();
    reactiveBindings();
    setupFirstLoad(role);
  }

  function setupFirstLoad(role) {
    const feature = State.get('route') || State.get('lastFeature') || role;
    firstload(feature);
  }

  function firstload(feature) {
    if (feature) {
      State.set('activeFeature', feature);
      State.set('route', feature);
      State.set('lastFeature', feature);
      loadComponent(`features/${feature}`, '#main', { replace: true });
      console.log('🚀 First load:', feature);
    }
  }









function pathToLabel(path) {
  // Take last segment after slash, replace hyphens/underscores, capitalize words
  const lastSegment = path.split('/').pop();
  return lastSegment
    .split(/[-_]/g)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderSidebar() {
  const sidebarList = document.getElementById('sidebar-list');
  if (!sidebarList) return;

  sidebarList.innerHTML = ''; // clear existing

  const allowedItems = [...(State.get('features') || [])];
  const activeFeature = State.get('activeFeature');
  const uniqueItems = [...new Set(allowedItems)];

  // Build a tree from the paths
  const tree = {};
  uniqueItems.forEach(path => {
    const parts = path.split('/');
    let current = tree;
    parts.forEach((part, idx) => {
      if (!current[part]) {
        current[part] = { __children: {}, __path: idx === parts.length - 1 ? path : null };
      }
      current = current[part].__children;
    });
  });

  // Recursive renderer
  function renderNode(node, parentEl, depth = 0) {
    const ul = document.createElement('ul');
    if (depth > 0) {
      ul.className = 'sidebar-sublist'; // children lists get this
    } else {
      ul.className = 'sidebar-list'; // root list gets this
    }

    for (const key in node) {
      if (!node.hasOwnProperty(key)) continue;
      const { __children, __path } = node[key];

      const li = document.createElement('li');
      li.className = depth === 0 ? 'sidebar-items' : 'sidebar-subitems';

      const a = document.createElement('a');
      a.href = '#';
      if (__path) a.dataset.target = __path;
      a.textContent = pathToLabel(key);

      if (__path && __path === activeFeature) {
        a.classList.add('active');
      }

      li.appendChild(a);

      if (Object.keys(__children).length > 0) {
        renderNode(__children, li, depth + 1);
      }

      ul.appendChild(li);
    }

    parentEl.appendChild(ul);
  }

  renderNode(tree, sidebarList);
}











  function reactiveBindings() {
    State.on('modalVisible', visible => {
      const modal = document.querySelector(selectors.modal);
      if (modal) modal.classList.toggle('visible', visible);
    });

    State.on('darkMode', isDark => {
      document.body.classList.toggle('dark', isDark);
    });

    State.on('activeFeature', async (feature) => {
      // first reset last feature
      const last = State.get('lastFeature');
      // Don't load same feature twice
      if (feature === last) return;

      const container = '#main'; // inside main.html

      if (!feature) {
        if (last) unloadComponent(`features/${last}`, container);
        State.set('lastFeature', null);
        return;
      }

      await unloadComponent(`features/${last}`, container);
      await loadComponent(`features/${feature}`, container, { replace: true });
      State.set('lastFeature', feature);
    });

    State.on('role', newRole => {
      // Clear all components
      clearAllComponents();

      // Render new sidebar items for that role
      renderSidebar();
      // sidebar toggle
      setupSidebarToggle();

      // Grab allowed features for role
      const allowed = State.get('features') || [];
      const current = State.get('activeFeature');

      // If current feature isn't allowed anymore → remove it
      if (!allowed.includes(current)) {
        log.warn(`Feature "${current}" removed due to role change`);
        State.set('activeFeature', null);
      }

      // Set role's default feature (first in config or null)
      const defaultFeature = allowed[0] || null;
      if (defaultFeature && current !== defaultFeature) {
        State.set('activeFeature', defaultFeature);
      }
    });

  }

  function setupModalTriggers() {
    document.addEventListener('click', e => {
      if (e.target.closest('[data-open-modal]')) {
        State.set('modalVisible', true);
      }
      if (e.target.closest('[data-close-modal]')) {
        State.set('modalVisible', false);
      }
    });
  }

  function setupSidebarToggle() {
    const toggleBtn = document.querySelector(selectors.toggleSidebarBtn);
    const sidebar = document.querySelector(selectors.sidebar);

    if (!toggleBtn) return; // no toggle in DOM → nothing to do

    if (!sidebar) {
      // Hide toggle if sidebar isn't in DOM
      toggleBtn.style.display = 'none';
      toggleBtn.classList.remove('active');
      return;
    }

    // Sidebar exists → show toggle
    toggleBtn.style.display = '';

    // Remove any old listeners to avoid duplicates
    const newToggleBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

    newToggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      sidebar.classList.toggle('closed', !isOpen);
      newToggleBtn.classList.toggle('active', isOpen);
    });
  }


  function setupAutoSidebarClose() {
    const toggleBtn = document.querySelector(selectors.toggleSidebarBtn);
    const sidebar = document.querySelector(selectors.sidebar);
    if (!toggleBtn || !sidebar) return;

    document.addEventListener('click', e => {
      const clickedOutside = !sidebar.contains(e.target) && !toggleBtn.contains(e.target);
      const isMobile = window.innerWidth < 769;
      if (clickedOutside && isMobile) {
        sidebar.classList.remove('open');
        sidebar.classList.add('closed');
        toggleBtn.classList.remove('active');
      }
    });
  }

  function setupDarkModeToggle() {
    const btn = document.querySelector(selectors.darkModeBtn);
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isDark = !document.body.classList.contains('dark');
      State.set('darkMode', isDark);
    });
  }









function setupNavListeners() {
  document.addEventListener('click', async e => {
    const link = e.target.closest(selectors.navLinks);
    if (!link) return;
    if (link.tagName === 'A') e.preventDefault();

    const feature = link.dataset.target || link.dataset.load;
    const role = State.get('role');
    const allowed = State.get('permissions')?.[role] || [];

    // ---- Parent group (no data-target) ----
    if (!feature) {
      const li = link.closest('li');
      if (!li) return;

      const isActive = li.classList.contains('active');

      // Optional: close all other open parents (accordion behavior)
      li.parentElement.querySelectorAll(':scope > li.active').forEach(otherLi => {
        if (otherLi !== li) otherLi.classList.remove('active', 'open');
      });

      // Toggle clicked parent based on its previous state
      if (isActive) {
        li.classList.remove('active', 'open');
      } else {
        li.classList.add('active');
        if (li.querySelector('ul')) li.classList.add('open');
      }
      return;
    }

    // ---- Real feature link ----
    if (!allowed.includes(feature)) {
      alert('🚫 Access Denied');
      return;
    }

    // Clear old active flags
    document.querySelectorAll(selectors.navLinks).forEach(a => a.classList.remove('active'));
    document.querySelectorAll('#sidebar li.active').forEach(li => li.classList.remove('active'));

    // Activate link
    link.classList.add('active');

    // Mark ancestors active
    let ancestorLi = link.closest('li');
    while (ancestorLi) {
      ancestorLi.classList.add('active');
      ancestorLi = ancestorLi.parentElement?.closest('li');
    }

    // Close sidebar on mobile
    const sidebar = document.querySelector(selectors.sidebar);
    const toggleBtn = document.querySelector(selectors.toggleSidebarBtn);
    if (window.innerWidth < 769) {
      sidebar?.classList.remove('open');
      sidebar?.classList.add('closed');
      toggleBtn?.classList.remove('active');
    }

    // Update state
    if (feature !== State.get('activeFeature')) {
      State.set('activeFeature', feature);
    }
  });
}












  document.addEventListener('component-loaded', e => {
    const el = e.target;
    el.classList.add('fade');

    const { path, slot, id } = e.detail || {};
    if (path && slot && id) {
      log.success(`Feature loaded → path="${path}" slot="${slot}" id="${id}"`);
    } else {
      log.success(`Component loaded →`, e.detail);
    }
  });

  document.addEventListener('component-unloaded', e => {
    const { path, slot, id } = e.detail || {};
    if (path && slot && id) {
      log.info(`Feature unloaded → path="${path}" slot="${slot}" id="${id}"`);
    } else {
      log.info(`Component unloaded →`, e.detail);
    }
  });




  return { init };
})();

export default ui;
