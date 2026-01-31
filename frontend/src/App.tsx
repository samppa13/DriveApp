import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import { TextDocumentProvider } from './context/TextDocumentContext'
import TextDocumentEditorPage from './pages/TextDocumentEditorPage'
import AuthRequire from './components/AuthRequire'

const App = () => {
  return (
    <AuthProvider>
      <TextDocumentProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route element={<AuthRequire />}>
              <Route path='/' element={<HomePage />} />
              <Route path='/textdocuments/new' element={<TextDocumentEditorPage />} />
              <Route path='/textdocuments/:id/edit' element={<TextDocumentEditorPage />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
          </Routes>
        </BrowserRouter>
      </TextDocumentProvider>
    </AuthProvider>
  )
}

export default App
