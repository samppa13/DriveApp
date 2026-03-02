import { useEffect, useState } from 'react'
import type { IDocument } from '../types/types'
import { useNavigate, useParams } from 'react-router-dom'

const SharedTextDocumentPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [error, setError] = useState<string>('')

    const navigate = useNavigate()
    const { viewToken } = useParams()

    // Fetch shared text document using viewToken when component mounts or token changes
    useEffect(() => {
        if (!viewToken) {
            return
        }

        const fetchDoc = async () => {
            try {
                const response: Response = await fetch(`http://localhost:9000/api/textdocuments/${viewToken}/view`)
                
                const data = await response.json()
                if (!response.ok) {
                    throw new Error(data.error || 'Error fetching text document')
                }

                setDocument(data)
            } catch (err: any) {
                setError(err.message)
            }
        }

        fetchDoc()
    }, [viewToken])

    // Render error message if fetching fails
    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }

    // Render loading message while document is being fetched
    if (!document) {
        return <p>Loading...</p>
    }

    // Render the shared text document
    return (
        <div>
            <button onClick={() => navigate('/')}>
                Back to home
            </button>
            <div>
                <h2>{document.name}</h2>
                <p>{document.text}</p>
            </div>
        </div>
    )
}

export default SharedTextDocumentPage
