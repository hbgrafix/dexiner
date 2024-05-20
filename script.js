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
    primary: '#1E2022',
    secondary: '#292B2F',
    accent: '#1E88E5',
    light: '#F9F9F9',
    dark: '#000000'
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
    primary: '#707070',
    secondary: '#999999',
    accent: '#FFC107',
    light: '#F2F2F2',
    dark: '#333333'
  },
  {
    name: 'Scheme5',
    primary: '#E67E22',
    secondary: '#F1C40F',
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
    accent: '#0055FF',
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
let activeScheme = schemesData[3];

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


// Function to update the hex codes in the .hex divs
function updateHexCodes() {
  // Select all .hex divs
  const hexDivs = document.querySelectorAll('.hex');

  // Loop through the .hex divs and update their content
  hexDivs.forEach(hexDiv => {
    // Get the color name from the class of the parent .clr div
    const colorName = hexDiv.parentElement.id;

    // Find the corresponding color code in the active scheme
    const colorCode = activeScheme[colorName];

    // Update the inner content of the .hex div with the color code
    hexDiv.textContent = colorCode;
  });
}

// Call the updateHexCodes function initially to set the hex codes for the default scheme
updateHexCodes();


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

    // Update the hex color codes
    updateHexCodes();
  });
});




// Add click event listener to the Selected Scheme Element
selectedScheme.addEventListener('click', togglePanel);

function togglePanel() {
  schemes.style.display = (schemes.style.display === 'none') ? 'block' : 'none';
}








// Select all .display elements
const displayElems = document.querySelectorAll('.display');

// Color picker element
const colorPicker = document.getElementById('colorPicker');

// Function to set the color of a .display element
function setColor(displayElem, color) {
  displayElem.style.backgroundColor = color;
  const colorName = displayElem.parentElement.id;
  activeScheme[colorName] = color;

  // Update the corresponding color code in the .hex div
  const hexDiv = displayElem.nextElementSibling;
  hexDiv.textContent = color;
}

// Event listener for hover to show color picker cursor
displayElems.forEach(displayElem => {
  displayElem.addEventListener('mouseenter', () => {
    displayElem.style.cursor = 'pointer';
  });

  displayElem.addEventListener('mouseleave', () => {
    displayElem.style.cursor = 'auto';
  });
});

// Function to position the color picker and set its initial value
function openColorPicker(displayElem, mouseX, mouseY) {
  // Set initial value of color picker to the clicked element's color
  const initialColor = displayElem.style.backgroundColor;
  colorPicker.value = initialColor;

  // Calculate the position for the color picker
  const pickerWidth = colorPicker.offsetWidth;
  const pickerHeight = colorPicker.offsetHeight;
  const x = mouseX - pickerWidth / 2;
  const y = mouseY - pickerHeight / 2;

  // Position the color picker
  colorPicker.style.left = `${x}px`;
  colorPicker.style.top = `${y}px`;

  // Show the color picker tool
  colorPicker.click();

  // Event listener for color picker change
  colorPicker.addEventListener('input', () => {
    const color = colorPicker.value;
    setColor(displayElem, color);
  });
}

// Event listener for click to open color picker tool
displayElems.forEach(displayElem => {
  displayElem.addEventListener('click', (event) => {
    // Get the mouse position when the element was clicked
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Open the color picker with initial value and position
    openColorPicker(displayElem, mouseX, mouseY);
  });
});
