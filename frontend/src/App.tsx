import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Header from './components/Header'
import { DocumentProvider } from './context/DocumentContext'
import TextDocumentEditorPage from './pages/TextDocumentEditorPage'
import AuthRequire from './components/AuthRequire'
import SharedWithMePage from './pages/SharedWithMePage'
import SharedTextDocumentPage from './pages/SharedTextDocumentPage'
import PresentationDocumentEditorPage from './pages/PresentationDocumentEditorPage'
import SharedPresentationDocumentPage from './pages/SharedPresentationDocumentPage'

const App = () => {
  return (
    <AuthProvider>
      <DocumentProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route element={<AuthRequire />}>
              <Route path='/' element={<HomePage />} />
              <Route path='/shared-with-me' element={<SharedWithMePage />} />
              <Route path='/textdocuments/new' element={<TextDocumentEditorPage />} />
              <Route path='/textdocuments/:id/edit' element={<TextDocumentEditorPage />} />
              <Route path='/presentationdocuments/new' element={<PresentationDocumentEditorPage />} />
              <Route path='/presentationdocuments/:id/edit' element={<PresentationDocumentEditorPage />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/textdocuments/view/:viewToken' element={<SharedTextDocumentPage />} />
            <Route path='/presentationdocuments/view/:viewToken' element={<SharedPresentationDocumentPage />} />
          </Routes>
        </BrowserRouter>
      </DocumentProvider>
    </AuthProvider>
  )
}

export default App
