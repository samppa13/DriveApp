import { useEffect, useState } from 'react'
import type { IDocument } from '../types/types'
import { useNavigate, useParams } from 'react-router-dom'

const SharedPresentationDocumentPage = () => {
    const [document, setDocument] = useState<IDocument | undefined>(undefined)
    const [error, setError] = useState<string>('')

    const navigate = useNavigate()
    const { viewToken } = useParams()

    useEffect(() => {
        if (!viewToken) {
            return
        }

        const fetchDoc = async () => {
            try {
                const response: Response = await fetch(`http://localhost:9000/api/presentationdocuments/${viewToken}/view`)
                
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
            <button onClick={() => navigate('/')}>
                Back to home
            </button>
            <div>
                <h2>{document.name}</h2>
                <div>
                    {document.slides?.map((slide, slideId) => (
                        <div key={slideId}>
                            <h2>
                                {slide.title}
                            </h2>
                            <ul>
                                {slide.bullets.map((bullet, bulletId) => (
                                    <li key={bulletId}>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SharedPresentationDocumentPage
