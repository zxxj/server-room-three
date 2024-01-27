import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import 'normalize.css';
import './index.css';

const container = ReactDOM.createRoot(document.getElementById('root')!);

container.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
