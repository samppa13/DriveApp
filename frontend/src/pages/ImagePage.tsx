import { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DocumentContext } from '../context/DocumentContext'
import type { IDocument } from '../types/types'
import ImageGrid from '../components/ImageGrid'
import { AuthContext } from '../context/AuthContext'

const ImagePage = () => {
    const [image, setImage] = useState<IDocument | undefined>(undefined)
    const [notFound, setNotFound] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isFetching, setIsFetching] = useState<boolean>(true)

    const { id } = useParams()
    const navigate = useNavigate()
    const auth = useContext(AuthContext)
    const docs = useContext(DocumentContext)
    const docType = 'Image'

    // If docs context is not loaded, return nothing
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
        if (!errorMessage) {
            return
        }

        const timer = setTimeout(() => {
            setErrorMessage('')
        }, 2000)
        return () => clearTimeout(timer)
    }, [errorMessage])

    // Fetch the image document when ID or docs.loading changes
    useEffect(() => {
        if (!id || docs.loading) {
            return
        }

        const fetchImage = async () => {
            try {
                const img: IDocument = await docs.fetchDocument(id, docType)
                setImage(img)
                setNotFound(false)
            } catch (error: any) {
                if (error.message === 'Image not found') {
                    setNotFound(true)
                }
                else {
                    setErrorMessage(error.message)
                }
            } finally {
                setIsFetching(false)
            }
        }

        fetchImage()
    }, [id, docs.loading])

    // Redirect if the fetched document is not an image
    useEffect(() => {
        if (id && image && image.type !== 'Image') {
            navigate(`/${image.type.toLowerCase()}s/${id}`)
        }
    }, [id, image])

    // Handle deleting the image
    const handleDelete = async (id: string) => {
        try {
            const mess = await docs.deleteDocument(id)
            setMessage(mess)
            setNotFound(true)
            // Redirect to homepage after 2 seconds
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch (error: any) {
            setErrorMessage(error.message)
        }
    }

    // Render if image is not found
    if (notFound) {
        return (
            <div>
                {
                    message === 'Document moved to trash successfully'
                    ? (
                        <p style={{ color: 'green' }}>Image moved to trash successfully</p>
                    ) : (
                        <h2>
                            Image not found!
                        </h2>
                    )
                }
            </div>
        )
    }

    // Show loading state
    if (isFetching || docs.loading) {
        return <p>Loading...</p>
    }

    // Show error if ID or image is missing
    if (!id || !image) {
        return (
            <p style={{ color: 'red' }}>
                Id or image not found
            </p>
        )
    }

    // Check if current user owns this image
    const isOwner: boolean = image?.user === auth.user?._id
    // Construct image URL
    const imgUrl: string = `http://localhost:9000/api/images/${image._id}/file`

    return (
        <div>
            {
                errorMessage
                && <p style={{ color: 'red' }}>
                    {errorMessage}
                </p>
            }
            {/* Display the image grid */}
            <ImageGrid
                name={image.name}
                imgUrl={imgUrl}
                isProfile={false}
            />
            {/* Show delete button only to owner */}
            {
                isOwner
                && <button onClick={() => handleDelete(id)}>
                    Delete image
                </button>
            }
        </div>
    )
}

export default ImagePage