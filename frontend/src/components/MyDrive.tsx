import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'

const MyDrive = () => {
    const [message, setMessage] = useState<string>('')

    const textDocs = useContext(TextDocumentContext)
    const navigate = useNavigate()

    if (textDocs?.loading) {
        return (
            <p>Loading...</p>
        )
    }
    if (textDocs?.error) {
        return (
            <p style={{ color: 'red' }}>{textDocs.error}</p>
        )
    }

    const handleEditDoc = (id: string | undefined) => {
        navigate(`/textdocuments/${id}/edit`)
    }

    const handleDeleteDoc = async (id: string | undefined) => {
        if (!id) {
            setMessage('Id is undefined')
            return
        }
        if (!textDocs) {
            return
        }

        try {
            const mess = await textDocs.deleteTextDocument(id)
            setMessage(mess)
            setTimeout(() => {
                setMessage('')
            }, 2000)
        } catch (error: any) {
            setMessage(error.message)
        }
    }

    return (
        <div>
            <div>
                <button onClick={() => navigate('/textdocuments/new')}>
                    Create a new document
                </button>
                {
                    message
                    && <p style={{ color: message === 'Text document deleted successfully' ? 'green' : 'red' }}>{message}</p>
                }
                {!textDocs?.textDocuments ? (
                    <h2>You have not any text documents.</h2>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                textDocs?.textDocuments.map((textDocument) => (
                                    <tr key={textDocument._id}>
                                        <th onClick={() => handleEditDoc(textDocument._id)}>
                                            {textDocument.name}
                                        </th>
                                        <th>
                                            <button onClick={() => handleDeleteDoc(textDocument._id)}>
                                                Delete
                                            </button>
                                        </th>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default MyDrive
