import { initApp } from './assets/js/app.js';
import State from './assets/js/core/state.js';

document.addEventListener('DOMContentLoaded', async () => {
  window.State = State;
  initApp(State.get('role'));
  
  State.on('role', newRole => {
    initApp(newRole);
  });
});
