import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const AuthRequire = () => {
    const auth = useContext(AuthContext)

    // Render loading text while authentication state is being checked
    if (auth.loading) {
        return <p>Loading...</p>
    }

    // If user is not logged in, redirect to login page
    if (!auth.user) {
        return <Navigate to='/login' replace />
    }

    // If user is authenticated, render child routes
    return <Outlet />
}

export default AuthRequire
