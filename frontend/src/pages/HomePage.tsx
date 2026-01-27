import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const HomePage = () => {
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        if (!auth?.user) {
            navigate('/login')
        }
    }, [auth?.user, navigate])

    if (!auth?.user) {
        return null
    }

    return (
        <div>
            <p>
                Username: {auth.user.username}, Id: {auth.user.id}
            </p>
        </div>
    )
}

export default HomePage
