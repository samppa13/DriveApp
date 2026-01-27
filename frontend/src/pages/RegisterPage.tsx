import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RegisterPage = () => {
    const [username, setUsername] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [message, setMessage] = useState<string>('')

    const navigate = useNavigate()

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
            console.log(data)
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed')
            }

            setMessage('Registration completed')
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
                && <p style={{ color: message === 'Registration completed' ? 'green' : 'red' }}>{message}</p>
            }
            <form onSubmit={handleRegister}>
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
                <button type='submit'>Register</button>
            </form>
        </div>
    )
}

export default RegisterPage
