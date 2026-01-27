import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
