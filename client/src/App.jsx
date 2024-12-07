import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from "./Pages/HomePage.jsx";
import Signin from './Pages/Auth/Signin.jsx';

function App() {

  return (
    <Routes>
      <Route path='/'  element={<HomePage />} />
      <Route path='/auth/sign-in' element={<Signin/>} />
    </Routes>
  )
}

export default App
