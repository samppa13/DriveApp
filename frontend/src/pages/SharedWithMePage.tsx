import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'
import type { ITextDocument } from '../types/types'

const SharedWithMePage = () => {
    const [sortTerm, setSortTerm] = useState<string>('created-desc')

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
    if (textDocs?.sharedTextDocuments === null) {
        return <p>Loading...</p>
    }

    const handleEditDoc = (id: string | undefined) => {
        navigate(`/textdocuments/${id}/edit`)
    }

    let sortedDocuments: ITextDocument[] = []
    if (textDocs) {
        sortedDocuments = [...textDocs?.sharedTextDocuments].sort((doc1, doc2) => {
            if (sortTerm === 'created-desc') {
                const time1 = doc1.createdAt ? new Date(doc1.createdAt).getTime() : 0
                const time2 = doc2.createdAt ? new Date(doc2.createdAt).getTime() : 0
                return time2 - time1
            }
            else if (sortTerm === 'created-asc') {
                const time1 = doc1.createdAt ? new Date(doc1.createdAt).getTime() : 0
                const time2 = doc2.createdAt ? new Date(doc2.createdAt).getTime() : 0
                return time1 - time2
            }
            else if (sortTerm === 'updated-desc') {
                const time1 = doc1.updatedAt ? new Date(doc1.updatedAt).getTime() : 0
                const time2 = doc2.updatedAt ? new Date(doc2.updatedAt).getTime() : 0
                return time2 - time1
            }
            else if (sortTerm === 'updated-asc') {
                const time1 = doc1.updatedAt ? new Date(doc1.updatedAt).getTime() : 0
                const time2 = doc2.updatedAt ? new Date(doc2.updatedAt).getTime() : 0
                return time1 - time2
            }
            else if (sortTerm === 'name-asc') {
                return doc1.name
                    .toLowerCase()
                    .localeCompare(doc2.name.toLowerCase())
            }
            else if (sortTerm === 'name-desc') {
                return doc2.name
                    .toLowerCase()
                    .localeCompare(doc1.name.toLowerCase())
            }
            return 0
        })
    }

    return (
        <div>
            <label htmlFor="sort">Sort</label>
            <select
                name='sort'
                id='sort'
                value={sortTerm}
                onChange={(event) => setSortTerm(event.target.value)}
            >
                <option value='created-desc'>Created (new first)</option>
                <option value='created-asc'>Created (oldest first)</option>
                <option value='updated-desc'>Updated (new first)</option>
                <option value='updated-asc'>Updated (oldest first)</option>
                <option value='name-asc'>Name (A-Z)</option>
                <option value='name-desc'>Name (Z-A)</option>
            </select>
            {!sortedDocuments.length ? (
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
                            sortedDocuments.map((textDocument) => (
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
