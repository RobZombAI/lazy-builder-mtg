import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DeckProvider } from './context/DeckContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeckProvider>
      <App />
    </DeckProvider>
  </React.StrictMode>
);
