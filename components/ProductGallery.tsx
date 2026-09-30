'use client'

import { useRef, useState } from 'react'

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  if (images.length === 0) {
    return <div className="flex h-full w-full items-center justify-center text-sm text-stone">нет фото</div>
  }

  if (images.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={images[0]} alt={alt}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
    )
  }

  function goTo(i: number) {
    const track = trackRef.current
    if (!track) return
    const next = (i + images.length) % images.length
    track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const track = trackRef.current
    if (!track) return
    setIndex(Math.round(track.scrollLeft / track.clientWidth))
  }

  return (
    <>
      <div ref={trackRef} onScroll={handleScroll}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} src={src} alt={`${alt} — фото ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'}
            className="h-full w-full shrink-0 snap-center object-cover" />
        ))}
      </div>

      <button type="button" onClick={() => goTo(index - 1)} aria-label="Предыдущее фото"
        className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/70 text-ink opacity-0 backdrop-blur transition-opacity duration-300 hover:bg-paper/90 group-hover:opacity-100 max-sm:hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button type="button" onClick={() => goTo(index + 1)} aria-label="Следующее фото"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-paper/70 text-ink opacity-0 backdrop-blur transition-opacity duration-300 hover:bg-paper/90 group-hover:opacity-100 max-sm:hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
        {images.map((src, i) => (
          <button key={src} type="button" onClick={() => goTo(i)} aria-label={`Фото ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-brass' : 'w-1.5 bg-ink/50 hover:bg-ink/80'}`} />
        ))}
      </div>
    </>
  )
}
