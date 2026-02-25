import React, { createContext, useContext, useRef, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { IDocument, INewDocument } from '../types/types'

interface DocumentContextSettings {
    ownedDocuments: IDocument[] | null
    loading: boolean
    sharedDocuments: IDocument[] | null
    fetchOwnedDocuments: () => Promise<void>
    fetchSharedDocuments: () => Promise<void>
    fetchDocument: (id: string, type: string) => Promise<IDocument>
    createDocument: (document: INewDocument) => Promise<IDocument>
    updateDocument: (document: INewDocument) => Promise<IDocument>
    deleteDocument: (id: string) => Promise<string>
    shareDocument: (docId: string, userId: string) => Promise<string>
    restoreDocument: (docId: string) => Promise<IDocument>
    restoreDocuments: (docs: IDocument[]) => Promise<string>
    createViewLink: (docId: string) => Promise<void>
    addDocLock: (docId: string) => Promise<void>
    deleteDocLock: (docId: string) => Promise<void>
    uploadImage: (formData: FormData) => Promise<string>
}

export const DocumentContext = createContext<DocumentContextSettings | undefined>(undefined)

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [ownedDocuments, setOwnedDocuments] = useState<IDocument[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [sharedDocuments, setSharedDocuments] = useState<IDocument[] | null>(null)

    const auth = useContext(AuthContext)
    const ctrlRef = useRef<AbortController | null>(null)

    const fetchOwnedDocuments = async () => {
        if (!auth.token) {
            return
        }
        if (ctrlRef.current) {
            ctrlRef.current.abort()
        }

        const abortctrl: AbortController = new AbortController()
        ctrlRef.current = abortctrl

        setLoading(true)

        try {
            const response: Response = await fetch(`http://localhost:9000/api/documents`, {
                method: 'GET',
                signal: abortctrl.signal,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Error fetching owned documents')
            }

            setOwnedDocuments(data)
        } finally {
            setLoading(false)
        }
    }

    const fetchSharedDocuments = async () => {
        if (!auth.token) {
            return
        }
        if (ctrlRef.current) {
            ctrlRef.current.abort()
        }

        const abortctrl: AbortController = new AbortController()
        ctrlRef.current = abortctrl

        setLoading(true)

        try {
            const response: Response = await fetch(`http://localhost:9000/api/documents/shared`, {
                method: 'GET',
                signal: abortctrl.signal,
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Error fetching shared documents')
            }

            setSharedDocuments(data)
        } finally {
            setLoading(false)
        }
    }

    const fetchDocument = async (id: string, type: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/${type.toLowerCase()}s/${id}`, {
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

    const createDocument = async (document: INewDocument) => {
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

    const updateDocument = async (document: INewDocument) => {
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

    const deleteDocument = async (id: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${id}`, {
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

    const restoreDocument = async (docId: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/restore`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error restoring document')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? prevDocs.concat(data)
            : [data]
        )

        return data
    }

    const restoreDocuments = async (docs: IDocument[]) => {
        const response: Response = await fetch('http://localhost:9000/api/documents/trash/restore', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error restoring documents')
        }

        setOwnedDocuments((prevDocs) => prevDocs
            ? [...prevDocs, ...docs]
            : [...docs]
        )

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

    const uploadImage = async (formData: FormData) => {
        const response: Response = await fetch('http://localhost:9000/api/images/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            },
            body: formData
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error uploading image')
        }

        fetchOwnedDocuments()
        return data.message
    }

    return (
        <DocumentContext.Provider value={{
            ownedDocuments,
            loading,
            sharedDocuments,
            fetchOwnedDocuments,
            fetchSharedDocuments,
            fetchDocument,
            createDocument,
            updateDocument,
            deleteDocument,
            shareDocument,
            restoreDocument,
            restoreDocuments,
            createViewLink,
            addDocLock,
            deleteDocLock,
            uploadImage
        }}>
            { children }
        </DocumentContext.Provider>
    )
}
