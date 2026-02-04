import { useEffect, useState } from 'react'
import type { ITextDocument } from '../types/types'
import { useParams } from 'react-router-dom'

const SharedTextDocumentPage = () => {
    const [document, setDocument] = useState<ITextDocument | undefined>(undefined)
    const [error, setError] = useState<string>('')

    const { viewToken } = useParams()

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

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>
    }
    if (!document) {
        return <p>Loading...</p>
    }

    return (
        <div>
            <h2>{document.name}</h2>
            <p>{document.text}</p>
        </div>
    )
}

export default SharedTextDocumentPage
