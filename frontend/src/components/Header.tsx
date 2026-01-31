import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const Header = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    const handleLogout = () => {
        auth.logout()
        navigate('/')
    }

    return (
        <div>
            <ul>
                {auth?.user
                    ? (
                        <>
                            <li>
                                <button onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    )
                    : (
                        <>
                            <li>
                                <Link to='/login'>
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to='/register'>
                                    Register
                                </Link>
                            </li>
                        </>
                    )
                }
            </ul>
        </div>
    )
}

export default Header
