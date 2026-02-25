import type React from 'react'
import type { IDocument } from '../types/types'
import { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'

interface ImageGridProps {
    image: IDocument
}

const ImageGrid: React.FC<ImageGridProps> = ({ image }) => {
    const [imgSrc, setImgSrc] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const imgRef = useRef<string | null>(null);
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!image.name) {
            return
        }

        const fetchImage = async () => {
            try {
                const response = await fetch(`http://localhost:9000/api/images/${image.name}/file`, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`
                    }
                })

                if (!response.ok) {
                    const data = await response.json()
                    setErrorMessage(data.error)
                    return
                }

                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                imgRef.current = url
                setImgSrc(url)
            } catch (error) {
                setErrorMessage('Failed to fetch image')
            }
        }
        fetchImage()

        return () => {
            if (imgRef.current) {
                URL.revokeObjectURL(imgRef.current);
            }
        }
    }, [image.path])

    if (errorMessage) {
        return (
            <p style={{ color: 'red' }}>
                {errorMessage}
            </p>
        )
    }
    
    return (
        <div>
            {imgSrc ? (
                <img
                    src={imgSrc}
                    alt={image.name}
                    style={{
                        width: 'auto',
                        height: 'auto',
                        maxHeight: '200px',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <p>Loading image...</p>
            )}
            <p>
                {image.name}
            </p>
        </div>
    )
}

export default ImageGrid
