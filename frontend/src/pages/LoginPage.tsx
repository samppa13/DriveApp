import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button, Form } from 'react-bootstrap'

const LoginPage = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [message, setMessage] = useState<string>('')

    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    // Show loading text if auth is still loading
    if (auth.loading) {
        return <p>Loading...</p>
    }

    // If user is already logged in, show info and options
    if (auth.user) {
        return (
            <div>
                <p>You are logged in as {auth.user.username}, you must log out before you can log in as another user.</p>
                {/* Navigate back to home */}
                <button onClick={() => navigate('/')}>
                    Cancel
                </button>
                {/* Logout current user */}
                <button onClick={() => auth.logout()}>
                    Logout
                </button>
            </div>
        )
    }

    // Function to handle form submission and login
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
            {/* Show error message if exists */}
            {
                message
                && <p style={{ color: 'red' }}>{message}</p>
            }
            {/* Login form */}
            <Form onSubmit={handleLogin}>
                <Form.Group>
                    <Form.Label htmlFor='username'>Username</Form.Label>
                    <Form.Control
                        type='text'
                        name='username'
                        id='username'
                        onChange={(event) => setUsername(event.target.value)}
                        value={username}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label htmlFor='password'>Password</Form.Label>
                    <Form.Control
                        type='password'
                        name='password'
                        id='password'
                        onChange={(event) => setPassword(event.target.value)}
                        value={password}
                    />
                </Form.Group>
                {/* Submit button */}
                <Button variant='dark' type='submit'>Sign in</Button>
            </Form>
        </div>
    )
}

export default LoginPage