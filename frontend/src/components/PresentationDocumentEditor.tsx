import type React from 'react'
import type { IDocument, ISlide } from '../types/types'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PresentationDocumentEditorProps {
    document?: IDocument
    message: string
    handleSave: (presentationDocument: IDocument) => void
    handleDelete?: (id: string, type: string) => void
    handleStartSlideshow: () => void
}

const PresentationDocumentEditor: React.FC<PresentationDocumentEditorProps> = ({ document, message, handleSave, handleDelete, handleStartSlideshow }) => {
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
            <input
                type='text'
                name='name'
                id='name'
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder='Document name'
            />
            <button onClick={handleAddSlide}>
                Add slide
            </button>
            {slides.map((slide, slideId) => (
                <div key={slideId}>
                    <input
                        type='text'
                        value={slide.title}
                        onChange={(event) =>
                            handleSlideTitle(slideId, event.target.value)
                        }
                        placeholder='Slide title'
                    />
                    <ul>
                        {slide.bullets.map((bullet, bulletId) => (
                            <li key={bulletId}>
                                <input
                                    type="text"
                                    value={bullet}
                                    onChange={(event) =>
                                        handleBullet(slideId, bulletId, event.target.value)
                                    }
                                />
                                <button onClick={() =>
                                    handleDeleteBullet(slideId, bulletId)
                                }>
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() =>
                        handleAddBullet(slideId)
                    }>
                        Add bullet
                    </button>
                    <button onClick={() =>
                        handleDeleteSlide(slideId)
                    }>
                        Delete Slide
                    </button>
                </div>
            ))}
            {
                id
                && handleDelete
                && (
                    <button onClick={() => handleDelete(id, docType)}>
                        Delete
                    </button>
                )
            }
            <button onClick={() => navigate('/')}>
                Back to Home
            </button>
            <button onClick={handleSaveClick}>
                Save
            </button>
            {handleStartSlideshow && (
                <button onClick={handleStartSlideshow}>
                    Start Slideshow
                </button>
            )}
            {
                message
                && <p
                    style={{ color:
                        (message === 'Text document deleted successfully' || message === 'Text document saved successfully')
                        ? 'green'
                        : 'red'
                    }}
                >
                    {message}
                </p>
            }
        </div>
    )
}

export default PresentationDocumentEditor
