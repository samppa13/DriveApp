import '../styles/TrashPage.css'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import type { IDocument } from '../types/types'
import { DocumentContext } from '../context/DocumentContext'
import { Button, Pagination, Table } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

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

    // Clear success message after 2 seconds
    useEffect(() => {
        if (!message) {
            return
        }

        const timer = setTimeout(() => {
            setMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [message])

    // Clear error message after 2 seconds
    useEffect(() => {
        if (!error) {
            return
        }

        const timer = setTimeout(() => {
            setError('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [error])

    // Fetch deleted documents from trash when component mounts
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

    // Permanently delete a single document
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

    // Permanently delete all documents in trash
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

    // Restore a single document from trash
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

    // Restore all documents from trash
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

    // Show loading state while documents are being fetched
    if (!documents) {
        return <p>Loading...</p>
    }

    // Pagination logic
    const indexOfLastDoc: number = currentPage * 10
    const indexOfFirstDoc: number = indexOfLastDoc - 10
    const currentDocs: IDocument[] = documents.slice(indexOfFirstDoc, indexOfLastDoc)
    const totalPages: number = Math.ceil(documents.length / 10)

    // Generate page numbers for pagination
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

    // Render trash page content
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
                        <Button variant='dark' onClick={handleDeleteAllDocs}>
                            Empty trash
                        </Button>
                        <Button variant='dark' onClick={handleRestoreDocs}>
                            Restore all documents
                        </Button>
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
                        <div className='table-wrapper'>
                            <Table striped bordered hover variant='dark'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created</th>
                                        <th>Modified</th>
                                        <th></th>
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
                                                    <Button variant='dark' onClick={() => handleDeleteDoc(document._id)}>
                                                        Delete
                                                    </Button>
                                                </td>
                                                <td>
                                                    <Button variant='dark' onClick={() => handleRestoreDoc(document._id)}>
                                                        Restore
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </div>
                        <Pagination size='sm'>
                            <Pagination.Item
                                onClick={() => setCurrentPage((prevCurrentPage) => prevCurrentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Pagination.Item>
                            {getPageNumbers().map((pageNumber) => (
                                <Pagination.Item
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    disabled={currentPage === pageNumber}
                                >
                                    {pageNumber}
                                </Pagination.Item>
                            ))}
                            <Pagination.Item
                                onClick={() => setCurrentPage((prevCurrentPage) => prevCurrentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Pagination.Item>
                        </Pagination>
                    </>
                )
            }
        </div>
    )
}

export default TrashPage
