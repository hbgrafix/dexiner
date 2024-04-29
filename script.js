const menuBtn = document.querySelector('.hamburger-menu');
const menu = document.querySelector('.menu');

let menuOpen = false;

menuBtn.addEventListener('click', () => {
  if (!menuOpen) {
    menuBtn.classList.add('active');
    menu.classList.add('active');
    menuOpen = true;
  } else {
    menuBtn.classList.remove('active');
    menu.classList.remove('active');
    menuOpen = false;
  }
});




// Get the panel and schemes elements
const panel = document.querySelector('.panel');
const selectedScheme = document.querySelector('.active-scheme');
const schemes = document.querySelector('.schemes');

// Define the color schemes
const schemesData = [
  {
    name: 'Scheme1',
    primary: '#707070',
    secondary: '#999999',
    accent: '#FFC107',
    light: '#F2F2F2',
    dark: '#333333'
  },
  {
    name: 'Scheme2',
    primary: '#9370DB',
    secondary: '#BA55D3',
    accent: '#FFA07A',
    light: '#F5DEB3',
    dark: '#800080'
  },
  {
    name: 'Scheme3',
    primary: '#32CD32',
    secondary: '#00CED1',
    accent: '#FF6347',
    light: '#FFFFFF',
    dark: '#000000'
  },
  {
    name: 'Scheme4',
    primary: '#1E2022',
    secondary: '#292B2F',
    accent: '#1E88E5',
    light: '#F9F9F9',
    dark: '#000000'
  },
  {
    name: 'Scheme5',
    primary: '#F1C40F',
    secondary: '#E67E22',
    accent: '#8E44AD',
    light: '#FFFFFF',
    dark: '#2C3E50'
  },
  {
    name: 'Scheme6',
    primary: '#2196F3',
    secondary: '#0277BD',
    accent: '#FFC107',
    light: '#F5F5F5',
    dark: '#37474F'
  },
  {
    name: 'Scheme7',
    primary: '#F44336',
    secondary: '#EF5350',
    accent: '#FF9800',
    light: '#FFFFFF',
    dark: '#212121'
  },
  {
    name: 'Scheme8',
    primary: '#9C27B0',
    secondary: '#673AB7',
    accent: '#FFC107',
    light: '#F5F5F5',
    dark: '#212121'
  }
];



const schemesContainer = document.querySelector('.schemes-container');
const schemesList = schemesContainer.querySelector('.schemes');

// Loop through schemesData and create a new list item for each scheme
schemesData.forEach((scheme, index) => {
  const schemeListItem = document.createElement('li');
  schemeListItem.classList.add('scheme', `scheme${index+1}`);
  schemeListItem.dataset.type = scheme.name;

  const colorsDiv = document.createElement('div');
  colorsDiv.classList.add('colors');

  // Create a new span element for each color in the scheme
  Object.keys(scheme).forEach(key => {
    if (key !== 'name') {
      const colorSpan = document.createElement('span');
      colorSpan.classList.add('color', key);
      colorsDiv.appendChild(colorSpan);
    }
  });

  // Add the colorsDiv to the schemeListItem and the schemeListItem to the schemesList
  schemeListItem.appendChild(colorsDiv);
  schemesList.appendChild(schemeListItem);
});


// Set the default active scheme to be the first one
schemesList.firstElementChild.classList.add('active');

// Set the default scheme
let activeScheme = schemesData[0];

// Update the selected scheme name
selectedScheme.textContent = "Scheme: Default";



// Select all color elements
const colorElems = document.querySelectorAll('.color');

// Loop through color elements
colorElems.forEach(colorElem => {
  // Get the parent scheme element and its data-type attribute
  const schemeElem = colorElem.closest('.scheme');
  const schemeName = schemeElem.dataset.type;

  // Find the matching scheme in schemesData
  const schemeData = schemesData.find(scheme => scheme.name === schemeName);

  // Set the background color of the color element using the corresponding color from schemesData
  colorElem.style.backgroundColor = schemeData[colorElem.classList[1]];
});


// Add click event listener to each scheme
schemes.querySelectorAll('li').forEach((scheme, index) => {
  scheme.addEventListener('click', () => {
    // Set the active scheme
    activeScheme = schemesData[index];

    // Set the color of selectedScheme to the primary color of active Scheme
    selectedScheme.style.backgroundColor = activeScheme.primary;

    // Set the active class on the clicked scheme
    schemes.querySelector('.active').classList.remove('active');
    scheme.classList.add('active');

    // Update the colors of all the color elements in the active scheme
    const colorElemsInScheme = scheme.querySelectorAll('.color');
    colorElemsInScheme.forEach(colorElem => {
      colorElem.style.backgroundColor = activeScheme[colorElem.classList[1]];
    });

    // Update root variables with active scheme colors
    document.documentElement.style.setProperty('--primary-color', activeScheme.primary);
    document.documentElement.style.setProperty('--secondary-color', activeScheme.secondary);
    document.documentElement.style.setProperty('--accent-color', activeScheme.accent);
    document.documentElement.style.setProperty('--light-color', activeScheme.light);
    document.documentElement.style.setProperty('--dark-color', activeScheme.dark);

    // Update the selected scheme name
    selectedScheme.textContent = activeScheme.name;
  });
});




// Add click event listener to the Selected Scheme Element
selectedScheme.addEventListener('click', togglePanel);

function togglePanel() {
  schemes.style.display = (schemes.style.display === 'none') ? 'block' : 'none';
}




