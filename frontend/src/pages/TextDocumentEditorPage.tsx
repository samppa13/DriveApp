import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'
import type { ITextDocument } from '../types/types'
import TextDocumentEditor from '../components/TextDocumentEditor'

const TextDocumentEditorPage = () => {
    const [document, setDocument] = useState<ITextDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [isLockAdded, setIsLockAdded] = useState<boolean>(false)

    const { id } = useParams()
    const navigate = useNavigate()
    const textDocs = useContext(TextDocumentContext)

    useEffect(() => {
        if (!id || !textDocs || textDocs.loading) {
            return
        }

        const ownedDocument: ITextDocument | undefined = textDocs.ownedTextDocuments.find((doc) => doc._id === id)
        const sharedDocument: ITextDocument | undefined = textDocs.sharedTextDocuments.find((doc) => doc._id === id)

        const existingDocument: ITextDocument | undefined = ownedDocument || sharedDocument
        if (!existingDocument) {
            setNotFound(true)
            return
        }

        const addLock = async () => {
            try {
                await textDocs.addTextDocLock(id)
                setIsLockAdded(true)
            } catch (error: any) {
                setMessage(error.message)
            }
        }
        addLock()

        setDocument(existingDocument)
        setNotFound(false)

        return () => {
            const releaseLock = async () => {
                if (!isLockAdded) {
                    return
                }
                try {
                    await textDocs.deleteTextDocLock(id)
                } catch (error: any) {
                    console.log(`Failed to release lock: ${error}`)
                }
            }
            releaseLock()
        }
    }, [id, textDocs?.loading, textDocs?.ownedTextDocuments, textDocs?.sharedTextDocuments, isLockAdded])

    useEffect(() => {
        if (!id || !textDocs || !isLockAdded) {
            return
        }

        const intervalId = setInterval(async () => {
            try {
                await textDocs.addTextDocLock(id)
            } catch (error: any) {
                setMessage(error.message)
            }
        }, 20000)

        return () => clearInterval(intervalId)
    }, [id, textDocs, isLockAdded])

    const handleSave = async (doc: ITextDocument) => {
        if (!doc.name) {
            setMessage('Document must have a name')
            return
        }
        try {
            if (!id && textDocs) {
                const createdDoc = await textDocs.createTextDocument(doc)
                navigate(`/textdocuments/${createdDoc._id}/edit`)
            }
            else if (textDocs) {
                const updatedDoc = await textDocs.updateTextDocument(doc)
                setDocument(updatedDoc)
                setMessage('Text document saved successfully')
                setTimeout(() => {
                    setMessage('')
                }, 2000)
            }
        } catch (error: any) {
            setMessage(error.message || 'An unknown error occurred')
        }
    }

    const handleDelete = async (id: string) => {
        if (!textDocs) {
            return
        }

        try {
            const mess = await textDocs.deleteTextDocument(id)
            setMessage(mess)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            setMessage(error.message)
        }
    }

    if (!id) {
        return (
            <TextDocumentEditor
                message={message}
                handleSave={handleSave}
            />
        )
    }
    if (!textDocs || textDocs.loading || !document) {
        return <p>Loading...</p>
    }
    if (notFound) {
        return (
            <div>
                {
                    message === 'Text document deleted successfully'
                    ? (
                        <p style={{ color: 'green' }}>{message}</p>
                    ) : (
                        <h2>
                            Document not found!
                        </h2>
                    )
                }
            </div>
        )
    }
    if (message === 'Text document is currently locked by another user') {
        return <p style={{ color: 'red' }}>{message}</p>
    }

    const isOwner = textDocs.ownedTextDocuments.some(
        (textDoc) => textDoc._id === id
    )

    return (
        <TextDocumentEditor
            message={message}
            document={document}
            handleSave={handleSave}
            handleDelete={isOwner ? handleDelete : undefined}
        />
    )
}

export default TextDocumentEditorPage
