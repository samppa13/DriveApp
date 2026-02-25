import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import type { IDocument } from '../types/types'
import { DocumentContext } from '../context/DocumentContext'

const TrashPage = () => {
    const [documents, setDocuments] = useState<IDocument[] | null>(null)
    const [message, setMessage] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)

    const auth = useContext(AuthContext)
    const docs = useContext(DocumentContext)

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
        if (!error) {
            return
        }

        const timer = setTimeout(() => {
            setError('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [error])

    useEffect(() => {
        const fetchTrashDocuments = async () => {
            try {
                const response: Response = await fetch('http://localhost:9000/api/documents/trash', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                })
            
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching trash')
                }

                setDocuments(data)
            } catch (error: any) {
                setError(error.message)
            }
        }
        fetchTrashDocuments()
    }, [auth.token])

    const handleDeleteDoc = async (docId: string) => {
        try {
            const response: Response = await fetch(`http://localhost:9000/api/documents/${docId}/permanent`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Error deleting document')
            }

            setDocuments((prevDocs) => prevDocs
                ? prevDocs.filter(
                    (doc) => doc._id !== docId
                )
                : prevDocs
            )
            setMessage(data.message)
        } catch (error: any) {
            setError(error.message)
        }
    }

    const handleDeleteAllDocs = async () => {
        try {
            const response: Response = await fetch(`http://localhost:9000/api/documents/trash/empty`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                }
            })

            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Error deleting documents')
            }

            setDocuments([])
            setMessage(data.message)
        } catch (error: any) {
            setError(error.message)
        }
    }

    const handleRestoreDoc = async (docId: string) => {
        try {
            const restoredDoc: IDocument = await docs.restoreDocument(docId)
            setDocuments((prevDocs) => prevDocs
                ? prevDocs.filter((doc) => doc._id !== restoredDoc._id)
                : prevDocs
            )
            if (restoredDoc.type === 'Image') {
                setMessage(`Image ${restoredDoc.name} restored successfully`)
            }
            else {
                setMessage(`Document ${restoredDoc.name} restored successfully`)
            }
        } catch (error: any) {
            setError(error.message)
        }
    }

    const handleRestoreDocs = async () => {
        try {
            if (!documents || documents.length === 0) {
                return
            }

            const restoredDocs: IDocument[] = documents.map((doc) => ({
                ...doc,
                isDeleted: false
            }))

            const mess: string = await docs.restoreDocuments(restoredDocs)
            setDocuments([])
            setMessage(mess)
        } catch (error: any) {
            setError(error.message)
        }
    }

    if (!documents) {
        return <p>Loading...</p>
    }

    const indexOfLastDoc: number = currentPage * 10
    const indexOfFirstDoc: number = indexOfLastDoc - 10
    const currentDocs: IDocument[] = documents.slice(indexOfFirstDoc, indexOfLastDoc)
    const totalPages: number = Math.ceil(documents.length / 10)

    const getPageNumbers = () => {
        const pageNumbers: number[] = []

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        }
        else {
            pageNumbers.push(1)

            let startNumber: number = Math.max(currentPage - 2, 2)
            let endNumber: number = Math.min(currentPage + 2, totalPages - 1)

            if (currentPage <= 3) {
                endNumber = 6
            }
            if (currentPage >= totalPages - 2) {
                startNumber = totalPages - 5
            }

            for (let i = startNumber; i <= endNumber; i++) {
                pageNumbers.push(i)
            }

            pageNumbers.push(totalPages)
        }

        return pageNumbers
    }

    return (
        <div>
            {documents.length === 0
                ? (
                    <>
                        {message.length === 0
                            ? (
                                <h2>Trash is empty</h2>
                            ) : (
                                <p style={{ color: 'green' }}>
                                    {message}
                                </p>
                            )
                        }
                    </>
                ) : (
                    <>
                        <button onClick={handleDeleteAllDocs}>
                            Empty trash
                        </button>
                        <button onClick={handleRestoreDocs}>
                            Restore all documents
                        </button>
                        {
                            message
                            && <p style={{ color: 'green' }}>
                                {message}
                            </p>
                        }
                        {
                            error
                            && <p style={{ color: 'red' }}>
                                {error}
                            </p>
                        }
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created</th>
                                        <th>Modified</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentDocs.map((document) => (
                                            <tr key={document._id}>
                                                <th scope='row'>
                                                    {document.type === 'Image'
                                                        ? document.originalName
                                                        : document.name
                                                    }
                                                </th>
                                                <td>
                                                    {
                                                        new Date(document.createdAt!).toLocaleDateString('fi')
                                                    }
                                                </td>
                                                <td>
                                                    {
                                                        new Date(document.updatedAt!).toLocaleDateString('fi')
                                                    }
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDeleteDoc(document._id)}>
                                                        Delete
                                                    </button>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleRestoreDoc(document._id)}>
                                                        Restore
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <button
                                onClick={() => setCurrentPage((prevCurrentPage) => prevCurrentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {getPageNumbers().map((pageNumber) => (
                                <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    disabled={currentPage === pageNumber}
                                >
                                    {pageNumber}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prevCurrentPage) => prevCurrentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
                )
            }
        </div>
    )
}

export default TrashPage
