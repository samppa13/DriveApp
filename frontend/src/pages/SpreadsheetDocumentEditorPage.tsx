import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument, INewDocument } from '../types/types'
import SpreadsheetDocumentEditor from '../components/SpreadsheetDocumentEditor'
import { AuthContext } from '../context/AuthContext'

const SpreadsheetDocumentEditorPage = () => {
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
    const docType = 'SpreadsheetDocument'

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

    // Fetch document and add lock when page loads or id changes
    useEffect(() => {
        if (!id || docs.loading) {
            return
        }

        const fetchTextDoc = async () => {
            try {
                const spreadsheetDocument: IDocument = await docs.fetchDocument(id, docType)
                setDocument(spreadsheetDocument)
                setNotFound(false)

                await docs.addDocLock(id)
                lockRef.current = true
                setIsLockAdded(true)
            } catch (error: any) {
                if (error.message === 'Spreadsheet document not found') {
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

    // Redirect if document type is not SpreadsheetDocument
    useEffect(() => {
        if (id && document && document.type !== 'SpreadsheetDocument') {
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

    // Function to save or update a spreadsheet document
    const handleSave = async (doc: INewDocument) => {
        if (!doc.name) {
            setErrorMessage('Document must have a name')
            return
        }
        try {
            if (!id) {
                const createdDoc = await docs.createDocument(doc)
                navigate(`/spreadsheetdocuments/${createdDoc._id}/edit`)
            }
            else {
                const updatedDoc = await docs.updateDocument(doc)
                setDocument(updatedDoc)
                setMessage('Spreadsheet document saved successfully')
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'An unknown error occurred')
        }
    }

    // Function to delete a spreadsheet document and release lock
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
            <SpreadsheetDocumentEditor
                message={message}
                errorMessage={errorMessage}
                handleSave={handleSave}
            />
        )
    }

    // Show message if document not found
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

    // Show loading state while fetching
    if (isFetching || docs.loading) {
        return <p>Loading...</p>
    }

    // Show lock error if another user has locked the document
    if (lockError) {
        return <p style={{ color: 'red' }}>{lockError}</p>
    }

    const isOwner: boolean = document?.user === auth.user?._id

    // Render editor for existing document
    return (
        <SpreadsheetDocumentEditor
            document={document}
            message={message}
            errorMessage={errorMessage}
            handleSave={handleSave}
            handleDelete={isOwner ? handleDelete : undefined}
        />
    )
}

export default SpreadsheetDocumentEditorPage
