import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';
import { mark, measure } from './utils/perf';

mark('app_boot_start');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

mark('app_boot_end');
measure('app_boot_total', 'app_boot_start', 'app_boot_end');
