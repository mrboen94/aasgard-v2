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
  const [easeValue, setEaseValue] = useState<number>(0.01)
  const [radiusValue, setRadiusValue] = useState<number>(3000)
  const [lowerboundRandom, setLowerboundRandom] = useState<number>(0.8)
  const [upperboundRandom, setUpperboundRandom] = useState<number>(0.9)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (loaded) {
      const ctx = canvasRef.current.getContext('2d')
      const particleOptions: IParticleSystemOptions = particleSystemOptions
        ? particleSystemOptions
        : {
            randomFriction: { min: lowerboundRandom, max: upperboundRandom },
            mouseRadius: radiusValue,
            ease: easeValue,
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
    effect.render(canvasRef.current.getContext('2d'))
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
  }, [loaded])

  useEffect(() => {
    const options: IParticleSystemOptions = {
      ease: easeValue,
      mouseRadius: radiusValue,
      randomFriction: { min: lowerboundRandom, max: upperboundRandom },
    }
    effect && effect.updatePhysics(options)
  })

  return (
    <div className="flex w-full flex-col items-center justify-center px-0">
      <canvas ref={canvasRef} />
      <p>
        The options below are still a work in progress, and do not work at the
        current stage
      </p>
      <div className="w-1/2">
        <label className="font-bold text-gray-600">
          Ease value: {easeValue}
        </label>
        <input
          type="range"
          min={0.01}
          step={0.01}
          max={1.0}
          value={easeValue}
          onChange={(e) => setEaseValue(Number(e.target.value))}
          className="h-2 w-full appearance-none bg-blue-100"
        />
      </div>
      <div className="w-1/2">
        <label className="font-bold text-gray-600">
          Mouse radius: {radiusValue}
        </label>
        <input
          type="range"
          min={1}
          step={100}
          max={10000}
          value={radiusValue}
          onChange={(e) => setRadiusValue(Number(e.target.value))}
          className="h-2 w-full appearance-none bg-blue-100"
        />
      </div>
      <div className="w-1/2">
        <label className="font-bold text-gray-600">
          Upperbound random friction: {lowerboundRandom}
        </label>
        <input
          type="range"
          min={0.01}
          step={0.01}
          max={1.0}
          value={upperboundRandom}
          onChange={(e) => setUpperboundRandom(Number(e.target.value))}
          className="h-2 w-full appearance-none bg-blue-100"
        />
      </div>
      <div className="w-1/2">
        <label className="font-bold text-gray-600">
          Lowerband random friction: {lowerboundRandom}
        </label>
        <input
          type="range"
          min={0.01}
          step={0.01}
          max={1.0}
          value={lowerboundRandom}
          onChange={(e) => setLowerboundRandom(Number(e.target.value))}
          className="h-2 w-full appearance-none bg-blue-100"
        />
      </div>
    </div>
  )
}
