import type React from 'react'
import type { IDocument, INewDocument, ISlide } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

interface PresentationDocumentEditorProps {
    document?: IDocument
    message: string
    errorMessage: string
    handleSave: (presentationDocument: INewDocument) => void
    handleDelete?: (id: string) => void
    handleStartSlideshow: () => void
}

const PresentationDocumentEditor: React.FC<PresentationDocumentEditorProps> = ({ document, message, errorMessage, handleSave, handleDelete, handleStartSlideshow }) => {
    const [name, setName] = useState<string>(document?.name ?? '')
    const [slides, setSlides] = useState<ISlide[]>(document?.slides ?? [])

    const navigate = useNavigate()

    // Update state when document prop changes
    useEffect(() => {
        setName(document?.name ?? '')
        setSlides(document?.slides ?? [])
    }, [document])

    const id = document?._id
    const docType = 'PresentationDocument'

    // Add a new slide
    const handleAddSlide = () => {
        setSlides((prevSlides) => [...prevSlides, { title: '', bullets: [] }])
    }

    // Delete a slide by index
    const handleDeleteSlide = (index: number) => {
        setSlides((prevSlides) => prevSlides.filter(
            (_, i) => i !== index
        ))
    }

    // Update slide title
    const handleSlideTitle = (slideId: number, value: string) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) =>
            index === slideId ? { ...slide, title: value } : slide
        ))
    }

    // Update bullet text
    const handleBullet = (slideId: number, bulletId: number, value: string) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) => {
            if (index !== slideId) {
                return slide
            }
            const newBullets = slide.bullets.map(
                (bullet, bulletIndex) => bulletIndex === bulletId ? value : bullet
            )
            return { ...slide, bullets: newBullets }
        }))
    }

    // Add a bullet to a slide
    const handleAddBullet = (slideId: number) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) =>
            index === slideId
                ? { ...slide, bullets: [...slide.bullets, ''] }
                : slide
        ))
    }

    // Delete a bullet from a slide
    const handleDeleteBullet = (slideId: number, bulletId: number) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) => {
            if (index !== slideId) {
                return slide
            }
            return {
                ...slide,
                bullets: slide.bullets.filter(
                    (_, bulletIndex) => bulletIndex !== bulletId
                )
            }
        }))
    }

    // Save document using parent handler
    const handleSaveClick = () => {
        handleSave({
            ...document,
            name,
            slides,
            type: docType
        })
    }

    // Render the presentation document editor UI
    return (
        <div>
            {/* Document name input */}
            <Form>
                <Form.Group>
                    <Form.Control
                        type="text"
                        name="name"
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder='Document name'
                    />
                </Form.Group>
            </Form>

            {/* Slides rendering */}
            {slides.map((slide, slideId) => (
                <div key={slideId}>
                    {/* Slide title input */}
                    <Form.Control
                        type='text'
                        value={slide.title}
                        onChange={(event) =>
                            handleSlideTitle(slideId, event.target.value)
                        }
                        placeholder='Slide title'
                    />
                    <ul className='list-unstyled'>
                        {/* Bullets for each slide */}
                        {slide.bullets.map((bullet, bulletId) => (
                            <li
                                key={bulletId}
                                className='d-flex align-items-center gap-2 mb-2'
                            >
                                <span>.</span>
                                <Form.Control
                                    type="text"
                                    value={bullet}
                                    onChange={(event) =>
                                        handleBullet(slideId, bulletId, event.target.value)
                                    }
                                    className='flex-grow-1'
                                />
                                <Button variant='dark' onClick={() =>
                                    handleDeleteBullet(slideId, bulletId)
                                }>
                                    X
                                </Button>
                            </li>
                        ))}
                    </ul>
                    {/* Add bullet button */}
                    <Button variant='dark' onClick={() =>
                        handleAddBullet(slideId)
                    }>
                        Add bullet
                    </Button>
                    {/* Delete slide button */}
                    <Button variant='dark' onClick={() =>
                        handleDeleteSlide(slideId)
                    }>
                        Delete Slide
                    </Button>
                </div>
            ))}

            {/* Add new slide button */}
            <div>
                <Button variant='dark' onClick={handleAddSlide}>
                    Add slide
                </Button>
            </div>

            {/* Delete document button if available */}
            {
                id
                && handleDelete
                && (
                    <Button variant='dark' onClick={() => handleDelete(id)}>
                        Delete
                    </Button>
                )
            }

            {/* Navigation and save buttons */}
            <Button variant='dark' onClick={() => navigate('/')}>
                Back to Home
            </Button>
            <Button variant='dark' onClick={handleSaveClick}>
                Save
            </Button>

            {/* Start slideshow button */}
            {handleStartSlideshow && (
                <Button variant='dark' onClick={handleStartSlideshow}>
                    Start Slideshow
                </Button>
            )}

            {/* Display messages */}
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
        </div>
    )
}

export default PresentationDocumentEditor
