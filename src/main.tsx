import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/tokens.css';
import './styles/base.css';
import './styles/glass.css';
import './styles/light.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// In development, surface content mistakes in the console as you edit (npm run validate does the same in the terminal).
if (import.meta.env.DEV) {
  import('./content/validate').then(({ validateContent }) => {
    const issues = validateContent(() => true);
    for (const i of issues) console.warn(`[content] ${i.level}: ${i.where} — ${i.message}`);
  });
}
