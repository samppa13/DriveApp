import { useEffect, useState, type MouseEvent } from 'react'
import type { ISlide } from '../types/types'
import { Button } from 'react-bootstrap'

interface SlideshowProps {
    slides: ISlide[]
}

const Slideshow: React.FC<SlideshowProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [touchStart, setTouchStart] = useState<number | null>(null)

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowRight' || event.key === ' ') {
                setCurrentIndex(prev =>
                    Math.min(prev + 1, slides.length - 1)
                )
            } else if (event.key === 'ArrowLeft') {
                setCurrentIndex(prev =>
                    Math.max(prev - 1, 0)
                )
            } else if (event.key === 'Escape') {
                handleExitFullscreen()
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

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX)
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return

        const diff = e.changedTouches[0].clientX - touchStart

        if (diff < -50) {
            setCurrentIndex(prev =>
                Math.min(prev + 1, slides.length - 1)
            )
        }

        if (diff > 50) {
            setCurrentIndex(prev =>
                Math.max(prev - 1, 0)
            )
        }

        setTouchStart(null)
    }

    const handleExitFullscreen = async () => {
        if (document.fullscreenElement) {
            await document.exitFullscreen()
        }
    }

    if (!slides.length) {
        return null
    }

    const slide = slides[currentIndex]

    return (
        <div
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100dvh',
                zIndex: 9999,
                background: '#111111',
                color: '#ffffff',
                flexDirection: 'column',
                alignItems: 'flex-start',
                display: 'flex'
            }}
        >
            <Button
                variant='dark'
                onClick={(e) => {
                    e.stopPropagation()
                    handleExitFullscreen()
                }}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    border: 'none',
                    fontSize: '1.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'pointer'
                }}
            >
                ✕
            </Button>
            <h1>
                {slide.title}
            </h1>
            <ul
                style={{
                    listStylePosition: 'inside',
                    paddingLeft: 0,
                    margin: 0,
                    alignSelf: 'flex-start',
                    textAlign: 'left'
                }}
            >
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
