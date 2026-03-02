import type React from 'react'
import type { IDocument, INewDocument } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

interface TextDocumentEditorProps {
    document?: IDocument
    message: string
    errorMessage: string
    handleSave: (textDocument: INewDocument) => void
    handleDelete?: (id: string) => void
}

const TextDocumentEditor: React.FC<TextDocumentEditorProps> = ({ document, message, errorMessage, handleSave, handleDelete }) => {
    const [name, setName] = useState<string>(document?.name ?? '')
    const [text, setText] = useState<string>(document?.text ?? '')

    const navigate = useNavigate()

    // Update name and text when the document prop changes
    useEffect(() => {
        setName(document?.name ?? '')
        setText(document?.text ?? '')
    }, [document])

    const id = document?._id
    const docType = 'TextDocument'

    // Render the text document editor
    return (
        <div>
            {/* Input for document name and text */}
            <Form>
                <Form.Group>
                    <Form.Control
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder='Document name'
                    />
                    <Form.Control
                        as='textarea'
                        rows={10}
                        name="text"
                        id="text"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                    />
                </Form.Group>
            </Form>

            {/* Optional delete button */}
            {
                id
                && handleDelete
                && (
                    <Button variant='dark' onClick={() => handleDelete(id)}>
                        Delete
                    </Button>
                )
            }

            {/* Navigation and save buttons */}
            <Button variant='dark' onClick={() => navigate('/')}>
                Back to Home
            </Button>
            <Button variant='dark' onClick={() => handleSave({ ...document, name, text, type: docType })}>
                Save
            </Button>

            {/* Display messages */}
            {
                message
                && <p style={{ color: 'green' }}>
                    {message}
                </p>
            }
            {
                errorMessage
                && <p style={{ color: 'red' }}>
                    {errorMessage}
                </p>
            }
        </div>
    )
}

export default TextDocumentEditor
