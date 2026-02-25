import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument, INewDocument } from '../types/types'
import PresentationDocumentEditor from '../components/PresentationDocumentEditor'
import Slideshow from '../components/Slideshow'
import { AuthContext } from '../context/AuthContext'

const PresentationDocumentEditorPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [lockError, setLockError] = useState<string | null>(null)
    const [isLockAdded, setIsLockAdded] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [isSlideshow, setIsSlideshow] = useState<boolean>(false)

    const lockRef = useRef<boolean>(false)
    const isDeletingRef = useRef<boolean>(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const docs = useContext(DocumentContext)
    const docType = 'PresentationDocument'

    if (!docs) {
        return null
    }

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
        if (!id || docs.loading) {
            return
        }

        const fetchPresentationDoc = async () => {
            try {
                const presentationDocument: IDocument = await docs.fetchDocument(id, docType)
                setDocument(presentationDocument)
                setNotFound(false)

                await docs.addDocLock(id)
                lockRef.current = true
                setIsLockAdded(true)
            } catch (error: any) {
                if (error.message === 'Presentation document not found') {
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

        fetchPresentationDoc()

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

    useEffect(() => {
        if (id && document && document.type !== 'PresentationDocument') {
            navigate(`/${document.type.toLowerCase()}s/${id}`)
        }
    }, [document])

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

    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!window.document.fullscreenElement) {
                setIsSlideshow(false)
            }
        }

        window.document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            window.document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    const handleSave = async (doc: INewDocument) => {
        if (!doc.name) {
            setErrorMessage('Document must have a name')
            return
        }
        try {
            if (!id) {
                const createdDoc = await docs.createDocument(doc)
                navigate(`/presentationdocuments/${createdDoc._id}/edit`)
            }
            else {
                const updatedDoc = await docs.updateDocument(doc)
                setDocument(updatedDoc)
                setMessage('Presentation document saved successfully')
                setTimeout(() => {
                    setMessage('')
                }, 2000)
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'An unknown error occurred')
        }
    }

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

    const handleStartSlideshow = async () => {
        if (!document || document.type !== 'PresentationDocument') {
            return
        }
        try {
            if (window.document.documentElement.requestFullscreen) {
                await window.document.documentElement.requestFullscreen()
            }
            setIsSlideshow(true)
        } catch (error) {
            console.error('Fullscreen failed:', error)
        }
    }

    if (isSlideshow && document && document.type === 'PresentationDocument' && document.slides) {
        return (
            <Slideshow
                slides={document.slides}
            />
        )
    }
    if (!id) {
        return (
            <PresentationDocumentEditor
                message={message}
                errorMessage={errorMessage}
                handleSave={handleSave}
                handleStartSlideshow={handleStartSlideshow}
            />
        )
    }
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
    if (isFetching || docs.loading) {
        return <p>Loading...</p>
    }
    if (lockError) {
        return <p style={{ color: 'red' }}>{lockError}</p>
    }

    const isOwner: boolean = document?.user === auth.user?._id

    return (
        <PresentationDocumentEditor
            document={document}
            message={message}
            errorMessage={errorMessage}
            handleSave={handleSave}
            handleDelete={isOwner ? handleDelete : undefined}
            handleStartSlideshow={handleStartSlideshow}
        />
    )
}

export default PresentationDocumentEditorPage
