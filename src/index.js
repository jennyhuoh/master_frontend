import React from 'react';
import ReactDOM from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material';
import './index.css';
import App from './App';
// import { ApiProvider } from '@reduxjs/toolkit/dist/query/react';
// import { apiSlice } from './features/api/apiSlice';
import { BrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F6BD58',//黃
    },
    info: {
      main: '#5A81A8'//light blue
    },
    secondary: {
      main: '#FFFFFF',
    },
    warning: {
      main: '#2B3143'
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <ApiProvider api={apiSlice}>
    <BrowserRouter>
      {/* <CssBaseLine /> */}
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  // </ApiProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
