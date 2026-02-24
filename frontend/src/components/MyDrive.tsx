import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument, IUser } from '../types/types'
import { AuthContext } from '../context/AuthContext'

interface ISelectedUser {
    docId: string
    userId: string
}

const MyDrive = () => {
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [users, setUsers] = useState<IUser[]>([])
    const [selectedUsers, setSelectedUsers] = useState<ISelectedUser[]>([])
    const [sortTerm, setSortTerm] = useState<string>('created-desc')
    const [docType, setDocType] = useState<string>('')
    const [currentPage, setCurrentPage] = useState<number>(1)

    const docs = useContext(DocumentContext)
    const auth = useContext(AuthContext)
    const navigate = useNavigate()

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
        if (!errorMessage) {
            return
        }

        const timer = setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [errorMessage])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response: Response = await fetch('http://localhost:9000/api/users', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${auth.token}`
                    }
                })

                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching users')
                }

                setUsers(data.filter(
                    (user: IUser) => user._id !== auth.user?._id
                ))
            } catch (error: any) {
                setErrorMessage(error.message)
            }
        }

        fetchUsers()
    }, [auth.token, auth.user?._id])

    if (docs?.loading) {
        return (
            <p>Loading...</p>
        )
    }
    if (docs?.error) {
        return (
            <p style={{ color: 'red' }}>{docs.error}</p>
        )
    }
    if (docs?.ownedDocuments === null) {
        return <p>Loading...</p>
    }

    const handleEditDoc = (id: string | undefined, type: string) => {
        navigate(`/${type.toLowerCase()}s/${id}/edit`)
    }

    const handleDeleteDoc = async (id: string | undefined) => {
        if (!id) {
            setErrorMessage('Id is undefined')
            return
        }
        if (!docs) {
            return
        }

        try {
            const mess = await docs.deleteDocument(id)
            setMessage(mess)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    const handleShareDoc = async (docId: string | undefined) => {
        if (!docId) {
            setErrorMessage('Document id is undefined')
            return
        }

        const selectedUser = selectedUsers.find(
            (item) => item.docId === docId
        )
        if (!selectedUser) {
            setErrorMessage('Please select a user to share with')
            return
        }

        if (!docs) {
            return
        }

        try {
            const mess = await docs.shareDocument(docId, selectedUser.userId)
            setMessage(mess)
            setSelectedUsers((prevUser) => prevUser.filter(
                (item) => item.docId !== docId
            ))
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    const handleSelectUser = (docId: string, userId: string) => {
        setSelectedUsers((prevUsers) => {
            let updated: boolean = false
            const newState: ISelectedUser[] = prevUsers.map((item) => {
                if (item.docId === docId) {
                    updated = true
                    return { ...item, userId }
                }
                return item
            })
            if (!updated) {
                newState.push({ docId, userId })
            }
            return newState
        })
    }

    const handleCreateViewLink = async (docId: string | undefined) => {
        if (!docId) {
            setErrorMessage('Document id is undefined')
            return
        }
        if (!docs) {
            return
        }

        try {
            await docs.createViewLink(docId)
            setMessage('Document share view link created successfully')
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    const handleCreateDoc = () => {
        if (docType.length === 0) {
            setErrorMessage('You do not select document type')
            return
        }
        navigate(`/${docType}s/new`)
    }

    let sortedDocuments: IDocument[] = []
    if (docs) {
        sortedDocuments = [...docs?.ownedDocuments].sort((doc1, doc2) => {
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

    const indexOfLastDoc: number = currentPage * 10
    const indexOfFirstDoc: number = indexOfLastDoc - 10
    const currentDocs: IDocument[] = sortedDocuments.slice(indexOfFirstDoc, indexOfLastDoc)
    const totalPages: number = Math.ceil(sortedDocuments.length / 10)

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
            <div>
                <select
                    name='create-document'
                    id='create-document'
                    value={docType}
                    onChange={(event) => setDocType(event.target.value)}
                >
                    <option value=''>Select document type</option>
                    <option value='textdocument'>Text document</option>
                    <option value='presentationdocument'>Presentation document</option>
                    <option value='spreadsheetdocument'>Spreadsheet document</option>
                </select>
                <button onClick={handleCreateDoc}>
                    Create a new document
                </button>
                <label htmlFor='sort'>Sort</label>
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
                {!(sortedDocuments.length > 0) ? (
                    <h2>You have not any documents.</h2>
                ) : (
                    <>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Created</th>
                                        <th>Modified</th>
                                        <th></th>
                                        <th></th>
                                        <th></th>
                                        <th>View link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        currentDocs.map((document) => (
                                            <tr key={document._id}>
                                                <th scope='row' onClick={() => handleEditDoc(document._id, document.type)}>
                                                    {document.name}
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
                                                    <select
                                                        value={selectedUsers.find((item) => item.docId === document._id)?.userId || ''}
                                                        onChange={(event) => handleSelectUser(document._id!, event.target.value)}
                                                    >
                                                        <option value="">
                                                            Select user
                                                        </option>
                                                        {
                                                            users.map((user) => (
                                                                <option
                                                                    key={`${document._id}-${user._id}`}
                                                                    value={user._id}
                                                                >
                                                                    {user.username}
                                                                </option>
                                                            ))
                                                        }
                                                    </select>
                                                    <button onClick={() => handleShareDoc(document._id)}>
                                                        Share
                                                    </button>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleCreateViewLink(document._id)}>
                                                        Create view link
                                                    </button>
                                                </td>
                                                <td>
                                                    {
                                                        document.viewToken
                                                        && <p>
                                                            http://localhost:5173/{document.type.toLowerCase()}s/view/{document.viewToken}
                                                        </p>
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
        </div>
    )
}

export default MyDrive
