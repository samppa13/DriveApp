import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'

const SharedWithMePage = () => {
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

    return (
        <div>
            {!textDocs?.sharedTextDocuments.length ? (
                <h2>No text documents have been shared with you.</h2>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Created</th>
                            <th>Modified</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            textDocs?.sharedTextDocuments.map((textDocument) => (
                                <tr key={textDocument._id}>
                                    <th scope='row' onClick={() => handleEditDoc(textDocument._id)}>
                                        {textDocument.name}
                                    </th>
                                    <td>
                                        {
                                            new Date(textDocument.createdAt!).toLocaleDateString('fi')
                                        }
                                    </td>
                                    <td>
                                        {
                                            new Date(textDocument.updatedAt!).toLocaleDateString('fi')
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default SharedWithMePage
