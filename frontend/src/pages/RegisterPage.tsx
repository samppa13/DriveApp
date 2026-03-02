import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Button, Form } from 'react-bootstrap'

const RegisterPage = () => {
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
                <p>You are logged in as {auth.user.username}, you must log out before you can register a new user.</p>
                <button onClick={() => navigate('/')}>
                    Cancel
                </button>
                <button onClick={() => auth.logout()}>
                    Logout
                </button>
            </div>
        )
    }

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            const response: Response = await fetch('http://localhost:9000/api/users/register', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            setMessage(data.message)
            setTimeout(() => {
                navigate('/login')
            }, 2000)
        } catch (error: any) {
            setMessage(error.message)
        }
    }

    return (
        <div>
            <h1>
                Register
            </h1>
            {
                message
                && <p style={{ color: message === 'User registered successfully' ? 'green' : 'red' }}>{message}</p>
            }
            <Form onSubmit={handleRegister}>
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
                <Button variant='dark' type='submit'>Register</Button>
            </Form>
        </div>
    )
}

export default RegisterPage
