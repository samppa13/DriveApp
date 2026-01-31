import React, { createContext, useEffect, useState, type ReactNode } from 'react'

interface IUser {
    id: string
    username: string
}

interface AuthContextSettings {
    user: IUser | null
    token: string | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

export const AuthContext = createContext<AuthContextSettings>({
    user: null,
    token: null,
    loading: true,
    login: async () => {
        throw new Error('AuthContext not initialized')
    },
    logout: () => {
        throw new Error('AuthContext not initialized')
    }
})

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (!storedToken) {
            setLoading(false)
            return
        }

        try {
            const decoded = JSON.parse(atob(storedToken.split('.')[1]))
            setToken(storedToken)
            setUser({ id: decoded.id, username: decoded.username })
        } catch (error) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }, [])

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
        localStorage.setItem('token', data.token)
        
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
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}
