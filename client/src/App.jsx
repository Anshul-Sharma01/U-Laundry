import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from "./Pages/HomePage.jsx";
import Signin from './Pages/Auth/Signin.jsx';
import VerifyCode from './Pages/Auth/VerifyCode.jsx';
import Denied from './Pages/Denied.jsx';

function App() {

  return (
    <Routes>
      <Route path='/'  element={<HomePage />} />
      <Route path='/auth/sign-in' element={<Signin/>} />
      <Route path='/auth/verify-code' element={<VerifyCode/>} />



      <Route path='*' element={<Denied/>} ></Route>
    </Routes>
  )
}

export default App
