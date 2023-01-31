import { useEffect, useRef, useState } from 'react'
import { Effect } from '../lib/particleSystem/Effect'
import { IParticleSystemOptions } from '@/lib/particleSystem/Particle'

/**
 * PhysicsImageProps
 * @param src: url to image
 * @param particleSystemOptions: (Optional)
 */
interface PhysicsImageProps {
  src: string
  particleSystemOptions?: IParticleSystemOptions | null
}

export default function PhysicsImage({
  src,
  particleSystemOptions,
}: PhysicsImageProps): JSX.Element {
  let effect: null | Effect = null
  const [loaded, setLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState<HTMLImageElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (loaded) {
      const ctx = canvasRef.current.getContext('2d')
      const particleOptions: IParticleSystemOptions = particleSystemOptions
        ? particleSystemOptions
        : {
            randomFriction: { min: 0.8, max: 0.9 },
            mouseRadius: 3000,
            ease: 0.01,
            size: 3,
            gap: 3,
          }
      canvasRef.current.width = window.innerWidth
      canvasRef.current.height = window.innerHeight
      effect = new Effect(canvasRef.current, imageSrc, particleOptions)

      effect.init(ctx)
      animate()
    }
  }, [loaded])

  function animate() {
    effect.update()
    canvasRef.current && effect.render(canvasRef.current.getContext('2d'))
    requestAnimationFrame(animate)
  }

  useEffect(() => {
    let image = new Image()
    image.src = src
    image.crossOrigin = 'anonymous'
    image.onload = function () {
      setImageSrc(image)
      setLoaded(true)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center px-0">
      <canvas ref={canvasRef} />
    </div>
  )
}
