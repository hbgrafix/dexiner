// 📁 core/config.js
export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Cannot load ${path}`);
  return await res.json();
}

export async function getRoleConfig(role, file) {
  const config = await loadJSON(`json/${file}.json`);
  return config[role] || [];
}