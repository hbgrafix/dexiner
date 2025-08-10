// core/paths.js
const BASE_PATHS = {
  components: 'templates/components/',
  ui: 'templates/components/ui/',
  shared: 'templates/components/shared/',
  features: 'features/',
  proposals: 'features/proposals/',
  forms: 'features/forms/',
  utils: 'utilities/',
  json: 'json/'
};

export const CATEGORY_HINTS = {
  // category → fallback folder list (order matters)
  components: ['ui', 'shared'],
  sub: ['shared', 'features', 'ui'],
  utils: ['utilities'],
};

export default BASE_PATHS;
