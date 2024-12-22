import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from "./Pages/HomePage.jsx";
import Signin from './Pages/Auth/Signin.jsx';
import VerifyCode from './Pages/Auth/VerifyCode.jsx';
import Denied from './Pages/Denied.jsx';
import NotFound from './Pages/Notfound.jsx';
import ChangePassword from './Pages/Profile/ChangePassword.jsx';
import ForgotPassword from './Pages/Auth/ForgotPassword.jsx';

function App() {

  return (
    <Routes>
      <Route path='/'  element={<HomePage />} />
      <Route path='/auth/sign-in' element={<Signin/>} />
      <Route path='/auth/verify-code' element={<VerifyCode/>} />
      <Route path='/auth/forgot-password' element={<ForgotPassword/>}></Route>
      <Route path='/auth/change-password' element={<ChangePassword/>}></Route>


      <Route path='/denied' element={<Denied/>} ></Route>
      <Route path='*' element={<NotFound/>} ></Route>
    </Routes>
  )
}

export default App
