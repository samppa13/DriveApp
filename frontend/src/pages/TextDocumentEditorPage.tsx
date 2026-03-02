import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument, INewDocument } from '../types/types'
import TextDocumentEditor from '../components/TextDocumentEditor'
import { AuthContext } from '../context/AuthContext'

const TextDocumentEditorPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [lockError, setLockError] = useState<string | null>(null)
    const [isLockAdded, setIsLockAdded] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const lockRef = useRef<boolean>(false)
    const isDeletingRef = useRef<boolean>(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const docs = useContext(DocumentContext)
    const docType = 'TextDocument'

    if (!docs) {
        return null
    }

    // Clear success message after 2 seconds
    useEffect(() => {
        if (!message) {
            return
        }

        const timer = setTimeout(() => {
            setMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [message])

    // Clear error message after 2 seconds
    useEffect(() => {
        if (!errorMessage) {
            return
        }

        const timer = setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [errorMessage])

    // Fetch document and add lock when id changes
    useEffect(() => {
        if (!id || docs.loading) {
            return
        }

        const fetchTextDoc = async () => {
            try {
                const textDocument: IDocument = await docs.fetchDocument(id, docType)
                setDocument(textDocument)
                setNotFound(false)

                await docs.addDocLock(id)
                lockRef.current = true
                setIsLockAdded(true)
                setLockError(null)
            } catch (error: any) {
                if (error.message === 'Text document not found') {
                    setNotFound(true)
                }
                if (error.message === 'Document is currently locked by another user') {
                    setLockError(error.message)
                }
                else {
                    setErrorMessage(error.message)
                }
            } finally {
                setIsFetching(false)
            }
        }

        fetchTextDoc()

        // Release lock when component unmounts
        return () => {
            const releaseLock = async () => {
                if (!lockRef.current || isDeletingRef.current) {
                    return
                }
                try {
                    await docs.deleteDocLock(id)
                } catch (error: any) {
                    console.log(`Failed to release lock: ${error}`)
                }
            }
            releaseLock()
        }
    }, [id, docs.loading])

    // Redirect if document type is not TextDocument
    useEffect(() => {
        if (id && document && document.type !== 'TextDocument') {
            navigate(`/${document.type.toLowerCase()}s/${id}`)
        }
    }, [document])

    // Keep document lock alive every 20 seconds
    useEffect(() => {
        if (!id || !isLockAdded || !document) {
            return
        }

        const intervalId = setInterval(async () => {
            try {
                await docs.addDocLock(id)
            } catch (error: any) {
                if (error.message === 'Document is currently locked by another user') {
                    setLockError(error.message)
                }
                else {
                    setErrorMessage(error.message)
                }
            }
        }, 20000)

        return () => clearInterval(intervalId)
    }, [id, docs, isLockAdded, document])

    // Save or update text document
    const handleSave = async (doc: INewDocument) => {
        if (!doc.name) {
            setErrorMessage('Document must have a name')
            return
        }
        try {
            if (!id) {
                const createdDoc = await docs.createDocument(doc)
                navigate(`/textdocuments/${createdDoc._id}/edit`)
            }
            else {
                const updatedDoc = await docs.updateDocument(doc)
                setDocument(updatedDoc)
                setMessage('Text document saved successfully')
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'An unknown error occurred')
        }
    }

    // Delete document and release lock
    const handleDelete = async (id: string) => {
        isDeletingRef.current = true

        try {
            if (lockRef.current) {
                await docs.deleteDocLock(id)
                lockRef.current = false
            }
            
            const mess = await docs.deleteDocument(id)
            setMessage(mess)
            setNotFound(true)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    // Render editor for new document
    if (!id) {
        return (
            <TextDocumentEditor
                message={message}
                errorMessage={errorMessage}
                handleSave={handleSave}
            />
        )
    }

    // Render message if document not found
    if (notFound) {
        return (
            <div>
                {
                    message === 'Document moved to trash successfully'
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

    // Show loading state
    if (isFetching || docs.loading) {
        return <p>Loading...</p>
    }

    // Show lock error if another user is editing
    if (lockError) {
        return <p style={{ color: 'red' }}>{lockError}</p>
    }

    const isOwner: boolean = document?.user === auth.user?._id

    // Render editor for existing document
    return (
        <TextDocumentEditor
            document={document}
            message={message}
            errorMessage={errorMessage}
            handleSave={handleSave}
            handleDelete={isOwner ? handleDelete : undefined}
        />
    )
}

export default TextDocumentEditorPage
