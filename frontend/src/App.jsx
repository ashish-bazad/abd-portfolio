import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Results from './components/Results'
import { AuthProvider } from './utility/AuthContext'
function App() {

  return (
    <>
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
    </AuthProvider>
    </>
  )
}

export default App
