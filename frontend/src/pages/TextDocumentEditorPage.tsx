import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'
import type { ITextDocument } from '../types/types'
import TextDocumentEditor from '../components/TextDocumentEditor'

const TextDocumentEditorPage = () => {
    const [document, setDocument] = useState<ITextDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')

    const { id } = useParams()
    const navigate = useNavigate()
    const textDocs = useContext(TextDocumentContext)

    useEffect(() => {
        if (!id || !textDocs || textDocs.loading) {
            return
        }

        const existingDocument: ITextDocument | undefined = textDocs.textDocuments.find((doc) => doc._id === id)
        if (!existingDocument) {
            setNotFound(true)
            return
        }

        setDocument(existingDocument)
        setNotFound(false)
    }, [id, textDocs?.loading, textDocs?.textDocuments])

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
    if (!textDocs || textDocs.loading) {
        return <p>Loading...</p>
    }

    return (
        <TextDocumentEditor
            message={message}
            document={document}
            handleSave={handleSave}
            handleDelete={handleDelete}
        />
    )
}

export default TextDocumentEditorPage
