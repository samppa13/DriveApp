import { useEffect, useState, type MouseEvent } from 'react'
import type { ISlide } from '../types/types'

interface SlideshowProps {
    slides: ISlide[]
}

const Slideshow: React.FC<SlideshowProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                setCurrentIndex(prevIndex =>
                    Math.min(prevIndex + 1, slides.length - 1)
                )
            }
            else if (event.key === 'ArrowLeft') {
                setCurrentIndex(prevIndex =>
                    Math.max(prevIndex - 1, 0)
                )
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [slides.length])

    const handleClick = (event: MouseEvent<HTMLDivElement>) => {
        const screenWidth = window.innerWidth
        const clickX = event.clientX

        if (clickX > screenWidth / 2) {
            setCurrentIndex(prev =>
                Math.min(prev + 1, slides.length - 1)
            )
        } else {
            setCurrentIndex(prev =>
                Math.max(prev - 1, 0)
            )
        }
    }

    if (!slides.length) {
        return null
    }

    const slide = slides[currentIndex]

    return (
        <div
            onClick={handleClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                background: '#111111'
            }}
        >
            <h1>
                {slide.title}
            </h1>
            <ul>
                {slide.bullets.map((bullet, index) => (
                    <li key={index}>
                        {bullet}
                    </li>
                ))}
            </ul>
            <div>
                {currentIndex + 1} / {slides.length}
            </div>
        </div>
    )
}

export default Slideshow
