import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import type { ITextDocument } from '../types/types'

interface TextDocumentContextSettings {
    textDocuments: ITextDocument[]
    loading: boolean
    error: string
    createTextDocument: (textDocument: ITextDocument) => Promise<ITextDocument>
    updateTextDocument: (textDocument: ITextDocument) => Promise<ITextDocument>
    deleteTextDocument: (id: string) => Promise<string>
}

export const TextDocumentContext = createContext<TextDocumentContextSettings | undefined>(undefined)

export const TextDocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [textDocuments, setTextDocuments] = useState<ITextDocument[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string>('')

    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!auth.token) {
            return
        }
        const abortctrl: AbortController = new AbortController()

        const fetchData = async () => {
            try {
                const response: Response = await fetch('http://localhost:9000/api/textdocuments', {
                    method: 'GET',
                    signal: abortctrl.signal,
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching text documents')
                }

                setTextDocuments(data)
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

    const createTextDocument = async (textDocument: ITextDocument) => {
        const response: Response = await fetch('http://localhost:9000/api/textdocuments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(textDocument)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error creating text document')
        }

        setTextDocuments((prevDocs) => [...prevDocs, data])
        return data
    }

    const updateTextDocument = async (textDocument: ITextDocument) => {
        const response: Response = await fetch(`http://localhost:9000/api/textdocuments/${textDocument._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(textDocument)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error updating text document')
        }

        setTextDocuments((prevDocs) => prevDocs.map(
            (textDoc) => textDoc._id === data._id ? data : textDoc
        ))
        return data
    }

    const deleteTextDocument = async (id: string) => {
        const response: Response = await fetch(`http://localhost:9000/api/textdocuments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error deleting text document')
        }

        setTextDocuments((prevDocs) => prevDocs.filter(
            (textDoc) => textDoc._id !== id
        ))
        return data.message
    }

    return (
        <TextDocumentContext.Provider value={{
            textDocuments,
            loading,
            error,
            createTextDocument,
            updateTextDocument,
            deleteTextDocument
        }}>
            { children }
        </TextDocumentContext.Provider>
    )
}
