import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const LoginPage = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [message, setMessage] = useState<string>('')

    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    if (auth.loading) {
        return <p>Loading...</p>
    }

    if (auth.user) {
        return (
            <div>
                <p>You are logged in as {auth.user.username}, you must log out before you can log in as another user.</p>
                <button onClick={() => navigate('/')}>
                    Cancel
                </button>
                <button onClick={() => auth.logout()}>
                    Logout
                </button>
            </div>
        )
    }

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault()
        setMessage('')

        try {
            await auth.login(username, password)
            navigate('/')
        } catch (error: any) {
            setMessage(error.message)
        }
    }

    return (
        <div>
            <h1>
                Sign in
            </h1>
            {
                message
                && <p style={{ color: 'red' }}>{message}</p>
            }
            <form onSubmit={handleLogin}>
                <div>
                    <label htmlFor='username'>Username</label>
                    <input
                        type='text'
                        name='username'
                        id='username'
                        onChange={(event) => setUsername(event.target.value)}
                        value={username}
                    />
                </div>
                <div>
                    <label htmlFor='password'>Password</label>
                    <input
                        type='password'
                        name='password'
                        id='password'
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}
                    />
                </div>
                <button type='submit'>Sign in</button>
            </form>
        </div>
    )
}

export default LoginPage
