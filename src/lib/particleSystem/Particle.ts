import { Effect } from './Effect'

/**
 * ParticleOptions
 * @param friction - The friction of the particle (default 0.9), number between 0 and 1
 * @param ease - The ease of the particle (default 0.1)
 * @param originX - The origin x of the particle (default 0)
 * @param originY - The origin y of the particle (default 0)
 * @param size - The size of the particle (default 1)
 */
export interface IParticleSystemOptions {
  friction?: number
  ease?: number
  size?: number
  gap?: number
  mouseRadius?: number
  randomFriction?: { min: number; max: number }
}

export class Particle {
  effect: Effect
  x: number
  y: number
  size: number
  color: string
  dx: number
  dy: number
  vx: number
  vy: number
  force: number
  angle: number
  distance: number
  friction: number
  ease: number
  originX: number
  originY: number
  constructor(effect, x, y, color, particleOptions?: IParticleSystemOptions) {
    this.effect = effect
    this.x = this.originX = x
    this.y = this.originY = y
    this.color = color
    this.dx = 0
    this.dy = 0
    this.vx = 0
    this.vy = 0
    this.distance = 0
    this.angle = 0
    this.force = 0
    this.friction = particleOptions?.friction
      ? particleOptions.friction
      : particleOptions?.randomFriction
      ? Math.random() *
          (particleOptions.randomFriction.max -
            particleOptions.randomFriction.min) +
        particleOptions.randomFriction.min
      : 0.9

    this.ease = particleOptions?.ease ? particleOptions.ease : 0.1
    this.size = particleOptions?.size ? particleOptions.size : 1
  }

  update() {
    this.dx = this.effect.mouse.x - this.x
    this.dy = this.effect.mouse.y - this.y
    this.distance = this.dx * this.dx + this.dy * this.dy
    this.force = -this.effect.mouse.radius / this.distance
    if (this.distance < this.effect.mouse.radius) {
      this.angle = Math.atan2(this.dy, this.dx)
      this.vx += this.force * Math.cos(this.angle)
      this.vy += this.force * Math.sin(this.angle)
    }
    this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
    this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
  }
}
