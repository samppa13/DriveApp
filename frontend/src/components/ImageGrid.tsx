import type React from 'react'
import { useState, useEffect, useContext, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'

interface ImageGridProps {
    name: string
    imgUrl: string
    isProfile: boolean
}

const ImageGrid: React.FC<ImageGridProps> = ({ name, imgUrl, isProfile }) => {
    const [imgSrc, setImgSrc] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const imgRef = useRef<string | null>(null);
    const auth = useContext(AuthContext)

    useEffect(() => {
        if (!name || !imgUrl ) {
            return
        }

        const fetchImage = async () => {
            try {
                const response = await fetch(imgUrl, {
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
    }, [name, imgUrl])

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
                    alt={name}
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
            {
                !isProfile
                && <p>
                    {name}
                </p>
            }
        </div>
    )
}

export default ImageGrid
