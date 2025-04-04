import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from "./Pages/HomePage.jsx";
import Signin from './Pages/Auth/Signin.jsx';
import VerifyCode from './Pages/Auth/VerifyCode.jsx';
import Denied from './Pages/Denied.jsx';
import NotFound from './Pages/Notfound.jsx';
import ChangePassword from './Pages/Profile/ChangePassword.jsx';
import ForgotPassword from './Pages/Auth/ForgotPassword.jsx';
import ResetPassword from './Pages/Auth/ResetPassword.jsx';
import UserProfile from './Pages/Profile/UserProfile.jsx';
import UpdateAvatar from './Components/Profile/UpdateAvatar.jsx';
import UpdateUserDetails from './Components/Profile/UpdateUserDetails.jsx';
import PlaceOrder from "./Components/Orders/PlaceOrder.jsx"
import UserOrders from './Pages/Orders/UserOrders.jsx';
import AllOrders from './Components/Admin/AllOrders.jsx';

function App() {


  return (
    <Routes>
      <Route path='/'  element={<HomePage />} />
      <Route path='/auth/sign-in' element={<Signin/>} />
      <Route path='/auth/verify-code' element={<VerifyCode/>} />
      <Route path='/auth/forgot-password' element={<ForgotPassword/>}></Route>
      <Route path='/auth/reset-password/:resetToken' element={<ResetPassword/>}></Route>
      <Route path='/auth/change-password' element={<ChangePassword/>}></Route>

      <Route path='/user/me' element={<UserProfile/>}></Route>
      
      <Route path='/modal/check' element={<UpdateUserDetails/>}></Route>



      {/* Order routes */}
      <Route path='/orders/place-new-order' element={<PlaceOrder />}></Route>
      <Route path='/orders/my-orders' element={<UserOrders/>}></Route>

      {/* laundry moderator routes */}
      <Route path='/admin/all-orders'  element={<AllOrders/>}></Route>


      <Route path='/denied' element={<Denied/>} ></Route>
      <Route path='*' element={<NotFound/>} ></Route>
    </Routes>
  )
}

export default App
