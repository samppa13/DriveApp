import type React from 'react'
import type { ITextDocument } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface TextDocumentEditorProps {
    document?: ITextDocument
    message: string
    handleSave: (textDocument: ITextDocument) => void
    handleDelete?: (id: string) => void
}

const TextDocumentEditor: React.FC<TextDocumentEditorProps> = ({ document, message, handleSave, handleDelete }) => {
    const [name, setName] = useState<string>(document?.name ?? '')
    const [text, setText] = useState<string>(document?.text ?? '')

    const navigate = useNavigate()

    useEffect(() => {
        setName(document?.name ?? '')
        setText(document?.text ?? '')
    }, [document])

    const id = document?._id

    return (
        <div>
            <input
                type="text"
                name="name"
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='Document name'
            />
            <textarea
                name="text"
                id="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
            />
            {
                id
                && handleDelete
                && (
                    <button onClick={() => handleDelete(id)}>
                        Delete
                    </button>
                )
            }
            <button onClick={() => navigate('/')}>
                Back to Home
            </button>
            <button onClick={() => handleSave({ ...document, name, text })}>
                Save
            </button>
            {
                message
                && <p
                    style={{ color:
                        (message === 'Text document deleted successfully' || message === 'Text document saved successfully')
                        ? 'green'
                        : 'red'
                    }}
                >
                    {message}
                </p>
            }
        </div>
    )
}

export default TextDocumentEditor
