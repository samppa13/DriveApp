import React, { createContext, useState, type ReactNode } from 'react'

interface IUser {
    id: string
    username: string
}

interface AuthContextSettings {
    user: IUser | null
    token: string | null
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextSettings | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [token, setToken] = useState<string | null>(null)

    const login = async (username: string, password: string) => {
        const response: Response = await fetch('http://localhost:9000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Login failed')
        }

        setToken(data.token)
        
        try {
            const decoded = JSON.parse(atob(data.token.split('.')[1]))
            setUser({ id: decoded.id, username: decoded.username })
        } catch (error) {
            throw new Error('Invalid token')
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
