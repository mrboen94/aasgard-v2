import { useEffect, useRef } from 'react'
import { Effect } from '../lib/particleSystem/Effect'
import useMousePosition from '@/lib/useMousePosition'

interface PhysicsImageProps {
  src: string
}

export default function PhysicsImage({ src }: PhysicsImageProps) {
  let effect: null | Effect = null
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (canvasRef.current && imageRef.current && !effect) {
      const ctx = canvasRef.current.getContext('2d')
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight

      effect = new Effect(canvasRef.current, imageRef.current)
      effect.init(ctx)
    }
  }, [])

  function animate() {
    effect.update()
    effect.render(canvasRef.current.getContext('2d'))
    requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (effect) {
      animate()
    }
  }, [effect])

  return (
    <div className="h-fit-content absolute flex max-h-96 w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
          position: 'relative',
        }}
      />
      <img
        className="hidden"
        crossOrigin="anonymous"
        src={src}
        alt=""
        ref={imageRef}
      />
    </div>
  )
}
