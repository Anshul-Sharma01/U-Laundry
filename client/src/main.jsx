import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import store from "./Redux/store.js";
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
        <Toaster/>
        <App/>
    </BrowserRouter>
  </Provider>
)
