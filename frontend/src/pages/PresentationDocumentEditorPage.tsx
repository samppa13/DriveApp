import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument } from '../types/types'
import PresentationDocumentEditor from '../components/PresentationDocumentEditor'
import Slideshow from '../components/Slideshow'

const PresentationDocumentEditorPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [isLockAdded, setIsLockAdded] = useState<boolean>(false)
    const [isFetching, setIsFetching] = useState<boolean>(true)
    const [isSlideshow, setIsSlideshow] = useState<boolean>(false)

    const lockRef = useRef<boolean>(false)
    const { id } = useParams()
    const navigate = useNavigate()
    const docs = useContext(DocumentContext)
    const docType = 'PresentationDocument'

    useEffect(() => {
        if (!id || !docs || docs.loading) {
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
                setMessage(error.message)
            } finally {
                setIsFetching(false)
            }
        }

        fetchPresentationDoc()

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
        if (id && document && document.type !== 'PresentationDocument') {
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
                setMessage(error.message)
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

    const handleSave = async (doc: IDocument) => {
        if (!doc.name) {
            setMessage('Document must have a name')
            return
        }
        try {
            if (!id && docs) {
                const createdDoc = await docs.createDocument(doc)
                navigate(`/presentationdocuments/${createdDoc._id}/edit`)
            }
            else if (docs) {
                const updatedDoc = await docs.updateDocument(doc)
                setDocument(updatedDoc)
                setMessage('Presentation document saved successfully')
                setTimeout(() => {
                    setMessage('')
                }, 2000)
            }
        } catch (error: any) {
            setMessage(error.message || 'An unknown error occurred')
        }
    }

    const handleDelete = async (id: string, type: string) => {
        if (!docs) {
            return
        }

        try {
            const mess = await docs.deleteDocument(id, type)
            setMessage(mess)
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            setMessage(error.message)
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
                handleSave={handleSave}
                handleStartSlideshow={handleStartSlideshow}
            />
        )
    }
    if (notFound) {
        return (
            <div>
                {
                    message === 'Presentation document deleted successfully'
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
    if (message === 'Document is currently locked by another user') {
        return <p style={{ color: 'red' }}>{message}</p>
    }

    const isOwner: boolean = docs?.ownedDocuments?.some(
        (textDoc) => textDoc._id === id
    ) ?? false

    return (
        <PresentationDocumentEditor
            document={document}
            message={message}
            handleSave={handleSave}
            handleDelete={isOwner ? handleDelete : undefined}
            handleStartSlideshow={handleStartSlideshow}
        />
    )
}

export default PresentationDocumentEditorPage
