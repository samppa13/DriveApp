import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument } from '../types/types'

const SharedWithMePage = () => {
    const [sortTerm, setSortTerm] = useState<string>('created-desc')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [searchTerm, setSearchTerm] = useState<string>('')

    const docs = useContext(DocumentContext)
    const navigate = useNavigate()

    if (!docs) {
        return null
    }

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                await docs.fetchSharedDocuments()
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    setErrorMessage(error.message)
                }
            }
        }
        fetchDocs()
    }, [])

    if (docs.loading) {
        return (
            <p>Loading...</p>
        )
    }
    if (docs.sharedDocuments === null) {
        return <p>Loading...</p>
    }

    const handleEditDoc = (id: string | undefined, type: string) => {
        navigate(`/${type.toLowerCase()}s/${id}/edit`)
    }

    const sortedDocuments: IDocument[] = [...docs.sharedDocuments].sort((doc1, doc2) => {
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

    const filteredDocuments: IDocument[] = sortedDocuments.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLocaleLowerCase())
    )

    const indexOfLastDoc: number = currentPage * 10
    const indexOfFirstDoc: number = indexOfLastDoc - 10
    const currentDocs: IDocument[] = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc)
    const totalPages: number = Math.ceil(filteredDocuments.length / 10)

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
            {
                errorMessage
                && <p style={{ color: 'red' }}>
                    {errorMessage}
                </p>
            }
            <div>
                <input
                    type='text'
                    name='searchTerm'
                    id='searchTerm'
                    placeholder='Search by name'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
            </div>
            {!filteredDocuments.length ? (
                <h2>
                    {sortedDocuments.length === 0
                        ? 'No text documents have been shared with you.'
                        : 'Documents not found.'
                    }
                </h2>
            ) : (
                <>
                    <div>
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
                                    currentDocs.map((document) => (
                                        <tr key={document._id}>
                                            <th scope='row' onClick={() => handleEditDoc(document._id, document.type)}>
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
            )}
        </div>
    )
}

export default SharedWithMePage
