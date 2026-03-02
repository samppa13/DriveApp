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
import TrashPage from './pages/TrashPage'
import SpreadsheetDocumentEditorPage from './pages/SpreadsheetDocumentEditorPage'
import SharedSpreadsheetDocumentPage from './pages/SharedSpreadsheetDocumentPage'
import ImagePage from './pages/ImagePage'
import ProfilePage from './pages/ProfilePage'

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
              <Route path='/spreadsheetdocuments/new' element={<SpreadsheetDocumentEditorPage />} />
              <Route path='/spreadsheetdocuments/:id/edit' element={<SpreadsheetDocumentEditorPage />} />
              <Route path='/trash' element={<TrashPage />} />
              <Route path='/images/:id/edit' element={<ImagePage />} />
              <Route path='/profile' element={<ProfilePage />} />
            </Route>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/textdocuments/view/:viewToken' element={<SharedTextDocumentPage />} />
            <Route path='/presentationdocuments/view/:viewToken' element={<SharedPresentationDocumentPage />} />
            <Route path='/spreadsheetdocuments/view/:viewToken' element={<SharedSpreadsheetDocumentPage />} />
          </Routes>
        </BrowserRouter>
      </DocumentProvider>
    </AuthProvider>
  )
}

export default App
