import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument, INewDocument } from '../types/types'
import SpreadsheetDocumentEditor from '../components/SpreadsheetDocumentEditor'

const SpreadsheetDocumentEditorPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [lockError, setLockError] = useState<string | null>(null)
    const [isLockAdded, setIsLockAdded] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const lockRef = useRef<boolean>(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const docs = useContext(DocumentContext)
    const docType = 'SpreadsheetDocument'

    useEffect(() => {
        if (!message) {
            return
        }

        const timer = setTimeout(() => {
            setMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [message])

    useEffect(() => {
        if (!errorMessage) {
            return
        }

        const timer = setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [errorMessage])

    useEffect(() => {
        if (!id || !docs || docs.loading) {
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

        return () => {
            const releaseLock = async () => {
                if (!lockRef.current) {
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
    }, [id, docs?.loading])

    useEffect(() => {
        if (id && document && document.type !== 'SpreadsheetDocument') {
            navigate(`/${document.type.toLowerCase()}s/${id}`)
        }
    }, [document])

    useEffect(() => {
        if (!id || !docs || !isLockAdded || !document) {
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

    const handleSave = async (doc: INewDocument) => {
        if (!doc.name) {
            setErrorMessage('Document must have a name')
            return
        }
        try {
            if (!id && docs) {
                const createdDoc = await docs.createDocument(doc)
                navigate(`/spreadsheetdocuments/${createdDoc._id}/edit`)
            }
            else if (docs) {
                const updatedDoc = await docs.updateDocument(doc)
                setDocument(updatedDoc)
                setMessage('Spreadsheet document saved successfully')
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'An unknown error occurred')
        }
    }

    const handleDelete = async (id: string) => {
        if (!docs) {
            return
        }

        try {
            const mess = await docs.deleteDocument(id)
            setMessage(mess)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    if (!id) {
        return (
            <SpreadsheetDocumentEditor
                message={message}
                errorMessage={errorMessage}
                handleSave={handleSave}
            />
        )
    }
    if (notFound) {
        return (
            <div>
                {
                    message === 'Spreadsheet document deleted successfully'
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
    if (isFetching || docs?.loading) {
        return <p>Loading...</p>
    }
    if (lockError) {
        return <p style={{ color: 'red' }}>{lockError}</p>
    }

    const isOwner: boolean = docs?.ownedDocuments?.some(
        (textDoc) => textDoc._id === id
    ) ?? false

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
