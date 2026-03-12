import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Lato:wght@400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Global base styles
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Lato', sans-serif; color: #111827; background: #fff; }
  a { color: inherit; }
  button { font-family: 'Lato', sans-serif; }
  input, textarea, select { font-family: 'Lato', sans-serif; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
