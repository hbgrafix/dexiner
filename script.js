document.addEventListener('DOMContentLoaded', () => {
  const schemesData = [
      { name: 'Default', primary: '#007bff', secondary: '#b0b0b0', accent: '#17a2b8', light: '#f8f9fa', dark: '#343a40' },
      { name: 'Scheme1', primary: '#1E2022', secondary: '#707070', accent: '#1E88E5', light: '#F9F9F9', dark: '#000000' },
      { name: 'Scheme2', primary: '#9370DB', secondary: '#BA55D3', accent: '#FFA07A', light: '#F5DEB3', dark: '#800080' },
      { name: 'Scheme3', primary: '#32CD32', secondary: '#00CED1', accent: '#FF6347', light: '#FFFFFF', dark: '#000000' },
      { name: 'Scheme4', primary: '#707070', secondary: '#999999', accent: '#FFC107', light: '#F2F2F2', dark: '#333333' }
  ];

  let activeScheme = schemesData[0];
  let isDarkMode = false;

  const schemesList = document.querySelector('.schemes');
  const selectedScheme = document.querySelector('.active-scheme');
  const colorPicker = document.getElementById('colorPicker');
  const saveSchemeButton = document.getElementById('saveScheme');
  const togglePanelButton = document.getElementById('togglePanel');
  const panel = document.querySelector('.panel');
  const switchScheme = document.getElementsByClassName('switch-scheme');

  function populateSchemes() {
      schemesList.innerHTML = '';
      schemesData.forEach((scheme) => {
          const schemeListItem = document.createElement('li');
          schemeListItem.classList.add('scheme');
          schemeListItem.dataset.type = scheme.name;
          schemeListItem.textContent = scheme.name;
          schemesList.appendChild(schemeListItem);
      });
  }

  function updateSelectedSchemeName(name) {
      selectedScheme.textContent = `Scheme: ${name}`;
  }

  function updateUIColors(scheme) {
      document.documentElement.style.setProperty('--primary-color', scheme.primary);
      document.documentElement.style.setProperty('--secondary-color', scheme.secondary);
      document.documentElement.style.setProperty('--accent-color', scheme.accent);
      document.documentElement.style.setProperty('--light-color', scheme.light);
      const themeSwitch = document.getElementById('themeSwitch');
      document.documentElement.style.setProperty('--dark-color', scheme.dark);

      document.querySelectorAll('.clr').forEach(clrElem => {
          const colorName = clrElem.id;
          clrElem.querySelector('.display').style.backgroundColor = scheme[colorName];
          clrElem.querySelector('.hex').textContent = scheme[colorName];
      });
  }

  schemesList.addEventListener('click', (event) => {
      const schemeElement = event.target.closest('.scheme');
      if (schemeElement) {
          const schemeName = schemeElement.dataset.type;
          activeScheme = schemesData.find(scheme => scheme.name === schemeName);
          updateSelectedSchemeName(activeScheme.name);
          document.querySelector('.schemes .active')?.classList.remove('active');
          schemeElement.classList.add('active');
          updateUIColors(activeScheme);
      }
  });

  document.querySelectorAll('.display').forEach(displayElem => {
      displayElem.addEventListener('click', (event) => {
          const colorName = displayElem.parentElement.id;
          colorPicker.value = rgbToHex(displayElem.style.backgroundColor);
          colorPicker.click();

          colorPicker.addEventListener('input', () => {
              const newColor = colorPicker.value;
              displayElem.style.backgroundColor = newColor;
              activeScheme[colorName] = newColor;
              document.documentElement.style.setProperty(`--${colorName}-color`, newColor);
              displayElem.nextElementSibling.textContent = newColor;
          }, { once: false });
      });
  });

  saveSchemeButton.addEventListener('click', () => {
      const newScheme = { ...activeScheme, name: `Custom${schemesData.length}` };
      schemesData.push(newScheme);
      populateSchemes();
  });

  togglePanelButton.addEventListener('click', () => {
      panel.classList.toggle('hidden');
      togglePanelButton.textContent = panel.classList.contains('hidden') ? 'Show Panel' : 'Hide Panel';
  });

  function rgbToHex(rgb) {
      const result = rgb.match(/\d+/g).map(Number);
      return `#${result.map(c => c.toString(16).padStart(2, '0')).join('')}`;
  }


    // Function to toggle between light and dark modes
    function toggleMode() {
      isDarkMode = !isDarkMode;
      if (isDarkMode) {
          document.body.classList.add('dark-mode');
          document.body.classList.remove('light-mode')
      } else {
          document.body.classList.add('light-mode')
          document.body.classList.remove('dark-mode');
      }
  }

  // Event listener for the theme switch toggle button
  themeSwitch.addEventListener('change', toggleMode);

  populateSchemes();
  updateUIColors(activeScheme);
});
