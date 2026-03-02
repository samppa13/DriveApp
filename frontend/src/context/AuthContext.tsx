import React, { createContext, useEffect, useState, type ReactNode } from 'react'
import type { IUser } from '../types/types'

interface AuthContextSettings {
    user: IUser | null
    token: string | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    uploadImage: (formData: FormData) => Promise<string>
    deleteImage: () => Promise<string>
    updateProfile: (username: string) => Promise<string>
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
    },
    uploadImage: () => {
        throw new Error('AuthContext not initialized')
    },
    deleteImage: () => {
        throw new Error('AuthContext not initialized')
    },
    updateProfile: () => {
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

        setToken(storedToken)

        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:9000/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${storedToken}`
                    }
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error)
                }

                setUser(data)
            } catch (error) {
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
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
            setUser({ _id: decoded.id, username: decoded.username })
        } catch (error) {
            throw new Error('Invalid token')
        }
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')
    }

    const uploadImage = async (formData: FormData) => {
        const response: Response = await fetch('http://localhost:9000/api/users/profile/image/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error uploading profile image')
        }

        setUser((prevUser) => prevUser
            ? { ...prevUser, profileImage: data.filename }
            : prevUser
        )
        return data.message
    }

    const deleteImage = async () => {
        const response: Response = await fetch('http://localhost:9000/api/users/profile/image', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error deleting profile image')
        }

        setUser((prevUser) => prevUser
            ? { ...prevUser, profileImage: null }
            : prevUser
        )
        return data.message
    }

    const updateProfile = async (username: string) => {
        const response: Response = await fetch('http://localhost:9000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                username
            })
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error updating profile')
        }

        setUser((prevUser) => prevUser
            ? { ...prevUser, username: data.username }
            : prevUser
        )
        return data.message
    }

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            uploadImage,
            deleteImage,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}
