import { useEffect, useRef } from 'react'
import { Effect } from '../lib/particleSystem/Effect'
import { IParticleSystemOptions } from '@/lib/particleSystem/Particle'

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
      const particleOptions: IParticleSystemOptions = {
        randomFriction: { min: 0.8, max: 0.9 },
        mouseRadius: 3000,
        ease: 0.01,
        size: 3,
        gap: 3,
      }
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight

      effect = new Effect(canvasRef.current, imageRef.current, particleOptions)
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
  }, [])

  return (
    <div className="flex w-full items-center justify-center px-0">
      <canvas
        ref={canvasRef}
        style={{
          padding: 0,
          margin: 0,
          border: 0,
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
