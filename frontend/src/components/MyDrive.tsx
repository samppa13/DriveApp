import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextDocumentContext } from '../context/TextDocumentContext'
import type { IUser } from '../types/types'
import { AuthContext } from '../context/AuthContext'

interface ISelectedUser {
    docId: string
    userId: string
}

const MyDrive = () => {
    const [message, setMessage] = useState<string>('')
    const [users, setUsers] = useState<IUser[]>([])
    const [selectedUsers, setSelectedUsers] = useState<ISelectedUser[]>([])

    const textDocs = useContext(TextDocumentContext)
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
                setMessage(error.message)
            }
        }

        fetchUsers()
    }, [auth.token, auth.user?._id])

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
        } catch (error: any) {
            setMessage(error.message)
        }
    }

    const handleShareDoc = async (docId: string | undefined) => {
        if (!docId) {
            setMessage('Text document id is undefined')
            return
        }

        const selectedUser = selectedUsers.find(
            (item) => item.docId === docId
        )
        if (!selectedUser) {
            setMessage('Please select a user to share with')
            return
        }

        if (!textDocs) {
            return
        }

        try {
            const mess = await textDocs.shareTextDocument(docId, selectedUser.userId)
            setMessage(mess)
            setSelectedUsers((prevUser) => prevUser.filter(
                (item) => item.docId !== docId
            ))
        } catch (error: any) {
            setMessage(error.message)
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

    return (
        <div>
            <div>
                <button onClick={() => navigate('/textdocuments/new')}>
                    Create a new document
                </button>
                {
                    message
                    && <p
                        style={{ color:
                            (message === 'Text document deleted successfully' || message === 'User has been granted edit permission successfully')
                            ? 'green'
                            : 'red'
                        }}
                    >
                        {message}
                    </p>
                }
                {!textDocs?.ownedTextDocuments.length ? (
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
                                textDocs?.ownedTextDocuments.map((textDocument) => (
                                    <tr key={textDocument._id}>
                                        <th onClick={() => handleEditDoc(textDocument._id)}>
                                            {textDocument.name}
                                        </th>
                                        <td>
                                            <button onClick={() => handleDeleteDoc(textDocument._id)}>
                                                Delete
                                            </button>
                                        </td>
                                        <td>
                                            <select
                                                value={selectedUsers.find((item) => item.docId === textDocument._id)?.userId || ''}
                                                onChange={(event) => handleSelectUser(textDocument._id!, event.target.value)}
                                            >
                                                <option value="">
                                                    Select user
                                                </option>
                                                {
                                                    users.map((user) => (
                                                        <option
                                                            key={`${textDocument._id}-${user._id}`}
                                                            value={user._id}
                                                        >
                                                            {user.username}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                            <button onClick={() => handleShareDoc(textDocument._id)}>
                                                Share
                                            </button>
                                        </td>
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
