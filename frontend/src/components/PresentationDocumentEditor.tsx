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

    useEffect(() => {
        setName(document?.name ?? '')
        setSlides(document?.slides ?? [])
    }, [document])

    const id = document?._id
    const docType = 'PresentationDocument'

    const handleAddSlide = () => {
        setSlides((prevSlides) => [...prevSlides, { title: '', bullets: [] }])
    }

    const handleDeleteSlide = (index: number) => {
        setSlides((prevSlides) => prevSlides.filter(
            (_, i) => i !== index
        ))
    }

    const handleSlideTitle = (slideId: number, value: string) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) =>
            index === slideId ? { ...slide, title: value } : slide
        ))
    }

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

    const handleAddBullet = (slideId: number) => {
        setSlides((prevSlides) => prevSlides.map((slide, index) =>
            index === slideId
                ? { ...slide, bullets: [...slide.bullets, ''] }
                : slide
        ))
    }

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

    const handleSaveClick = () => {
        handleSave({
            ...document,
            name,
            slides,
            type: docType
        })
    }

    return (
        <div>
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
            {slides.map((slide, slideId) => (
                <div key={slideId}>
                    <Form.Control
                        type='text'
                        value={slide.title}
                        onChange={(event) =>
                            handleSlideTitle(slideId, event.target.value)
                        }
                        placeholder='Slide title'
                    />
                    <ul className='list-unstyled'>
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
                    <Button variant='dark' onClick={() =>
                        handleAddBullet(slideId)
                    }>
                        Add bullet
                    </Button>
                    <Button variant='dark' onClick={() =>
                        handleDeleteSlide(slideId)
                    }>
                        Delete Slide
                    </Button>
                </div>
            ))}
            <div>
                <Button variant='dark' onClick={handleAddSlide}>
                    Add slide
                </Button>
            </div>
            {
                id
                && handleDelete
                && (
                    <Button variant='dark' onClick={() => handleDelete(id)}>
                        Delete
                    </Button>
                )
            }
            <Button variant='dark' onClick={() => navigate('/')}>
                Back to Home
            </Button>
            <Button variant='dark' onClick={handleSaveClick}>
                Save
            </Button>
            {handleStartSlideshow && (
                <Button variant='dark' onClick={handleStartSlideshow}>
                    Start Slideshow
                </Button>
            )}
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
