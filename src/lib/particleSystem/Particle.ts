import { Effect } from './Effect'

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
  constructor(effect, x, y, color) {
    this.effect = effect
    this.x = this.originX = x
    this.y = this.originY = y
    this.size = 2
    this.color = color
    this.dx = 0
    this.dy = 0
    this.vx = 0
    this.vy = 0
    this.force = 0
    this.angle = 0
    this.distance = 0
    this.friction = 0.9
    this.ease = 0.1
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
