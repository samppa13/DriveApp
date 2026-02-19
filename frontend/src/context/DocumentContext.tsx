import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { IDocument } from '../types/types'

interface DocumentContextSettings {
    ownedDocuments: IDocument[] | null
    loading: boolean
    error: string
    sharedDocuments: IDocument[] | null
    fetchDocument: (docId: string, type: string) => Promise<IDocument>
    createDocument: (document: IDocument) => Promise<IDocument>
    updateDocument: (document: IDocument) => Promise<IDocument>
    deleteDocument: (id: string, type: string) => Promise<string>
    shareDocument: (docId: string, userId: string) => Promise<string>
    createViewLink: (docId: string) => Promise<void>
    addDocLock: (docId: string) => Promise<void>
    deleteDocLock: (docId: string) => Promise<void>
}

export const DocumentContext = createContext<DocumentContextSettings | undefined>(undefined)

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ownedDocuments, setOwnedDocuments] = useState<IDocument[] | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')
    const [sharedDocuments, setSharedDocuments] = useState<IDocument[] | null>(null)

    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!auth.token) {
            setLoading(false)
            return
        }
        const abortctrl: AbortController = new AbortController()

        const fetchData = async () => {
            try {
                const response: Response = await fetch('http://localhost:9000/api/documents', {
                    method: 'GET',
                    signal: abortctrl.signal,
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching documents')
                }

                setError('')
                setOwnedDocuments(data.ownedDocs)
                setSharedDocuments(data.sharedDocs)
                setLoading(false)
            } catch (error: unknown) {
                if (error instanceof Error) {
                    if (error.name === 'AbortError') {
                        setError('Fetch aborted')
                    }
                    else {
                        setError(error.message)
                        setLoading(false)
                    }
                }
            }
        }

        fetchData()
        return () => abortctrl.abort()
    }, [auth.token])

    const fetchDocument = async (docId: string, type: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/${type.toLowerCase()}s/${docId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error fetching document')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? prevDocs.map(
                (doc) => doc._id === data._id ? data : doc
            )
            : prevDocs
        )
        setSharedDocuments((prevDocs) => prevDocs
            ? prevDocs.map(
                (doc) => doc._id === data._id ? data : doc
            )
            : prevDocs
        )
        return data
    }

    const createDocument = async (document: IDocument) => {
        const response: Response = await fetch(`http://localhost:9000/api/${document.type.toLowerCase()}s`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(document)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error creating document')
        }

        setOwnedDocuments((prevDocs) =>
            prevDocs ? [...prevDocs, data] : [data]
        )
        return data
    }

    const updateDocument = async (document: IDocument) => {
        const response: Response = await fetch(`http://localhost:9000/api/${document.type.toLowerCase()}s/${document._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(document)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error updating document')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? prevDocs.map(
                (doc) => doc._id === data._id ? data : doc
            )
            : prevDocs
        )
        setSharedDocuments((prevDocs) => prevDocs
            ? prevDocs.map(
                (doc) => doc._id === data._id ? data : doc
            )
            : prevDocs
        )
        return data
    }

    const deleteDocument = async (id: string, type: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/${type.toLowerCase()}s/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error deleting document')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? prevDocs.filter(
                (doc) => doc._id !== id
            )
            : prevDocs
        )
        return data.message
    }

    const shareDocument = async (docId: string, userId: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/permissions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ userId })
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error updating permissions')
        }

        return data.message
    }

    const createViewLink = async (docId: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/permissions/view`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error creating share view link')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? prevDocs.map(
                (doc) => doc._id === docId
                    ? { ...doc, viewToken: data }
                    : doc
            )
            : prevDocs
        )

        return
    }

    const addDocLock = async (docId: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/lock`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error adding lock')
        }
    }

    const deleteDocLock = async (docId: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/lock`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error releasing document lock')
        }
    }

    return (
        <DocumentContext.Provider value={{
            ownedDocuments,
            loading,
            error,
            sharedDocuments,
            fetchDocument,
            createDocument,
            updateDocument,
            deleteDocument,
            shareDocument,
            createViewLink,
            addDocLock,
            deleteDocLock
        }}>
            { children }
        </DocumentContext.Provider>
    )
}
