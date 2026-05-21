import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import './App.css'
import Home from './pages/Home'
import Navbar from './pages/Navbar'
import MyPet from './pages/MyPet'
import Vet from './pages/Vet'
import Calendar from './pages/Calendar'
import QuickNotes from "./pages/QuickNotes";
import MedicationForm from "./pages/MedicationForm"
import MedicationDetail from "./pages/MedicationDetail"
import NotesDetail from "./pages/NotesForm.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/Signup.jsx";
import ForgotPasswordEmail from "./pages/ForgotPasswordEmail";
import ForgotPasswordPhone from "./pages/ForgotPasswordPhone";
import OTPVerification from "./pages/OTPVerification";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/UserProfile.jsx";
import VetClinicDetail from "./pages/VetClinicDetail.jsx";
import { CacheProvider } from './utils/CacheContext.jsx';

function App() {
  const isLogin = 
  localStorage.getItem("isLogin") === "true";
  
  if(!isLogin){
    return(
      <Routes>
        <Route path="*" element={<Login />}/>
        <Route path="/forgot-password-email" element={<ForgotPasswordEmail />}/>
        <Route path="/forgot-password-phone" element={<ForgotPasswordPhone />}/>
        <Route path="/otp-verification" element={<OTPVerification />}/>          
        <Route path="/reset-password" element={<ResetPassword />} />    
        <Route path="/signup" element={<SignUp />}/>
      </Routes>
    )
  }
  
  return (
    <CacheProvider>
      <>
        <Layout>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/quick-notes" element={<QuickNotes />} />
          <Route path="/mypet" element={<MyPet />} />
          <Route path="/medication-form/:id" element={<MedicationForm />} />
          <Route path="/medication-form/:id/:logId" element={<MedicationForm />}/>
          <Route path="/notes-form/:id" element={<NotesDetail />}/>
          <Route path="/mypet/:id" element={<MedicationDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/vet" element={<Vet />} />
          <Route path="/vet/:id" element={<VetClinicDetail />} />
          <Route path="/vet-clinic/:clinic_id" element={<VetClinicDetail />} />
        </Routes>
        </Layout>
      </>
    </CacheProvider>
  )
}

export default App