import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const AuthRequire = () => {
    const auth = useContext(AuthContext)

    if (auth.loading) {
        return <p>Loading...</p>
    }
    if (!auth.user) {
        return <Navigate to='/login' replace />
    }

    return <Outlet />
}

export default AuthRequire
