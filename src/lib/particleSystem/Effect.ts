import { Particle } from './Particle'

export class Effect {
  canvas: HTMLCanvasElement
  width: number
  height: number
  image: HTMLImageElement
  centerX: number
  centerY: number
  x: number
  y: number
  particles: Particle[]
  gap: number
  mouse: {
    x: number
    y: number
    radius: number
  }
  box: DOMRect
  canvasOffset: { x: number; y: number }
  constructor(canvas: HTMLCanvasElement, image: HTMLImageElement) {
    this.canvas = canvas
    this.box = this.canvas.getBoundingClientRect()
    this.canvasOffset = { x: this.box.left, y: this.box.top }
    this.width = canvas.width
    this.height = canvas.height
    this.image = image
    this.centerX = this.width / 2
    this.centerY = this.height / 2
    this.x = this.centerX - this.image.width / 2
    this.y = this.centerY - this.image.height / 2
    this.particles = []
    this.gap = 5
    this.mouse = {
      radius: 6000,
      x: this.centerX,
      y: this.centerY,
    }

    window.addEventListener('scroll', (_) => {
      this.canvasOffset.y = this.canvas.getBoundingClientRect().top
    })

    window.addEventListener('mousemove', (event) => {
      this.mouse.x = event.clientX - this.canvasOffset.x
      this.mouse.y = event.clientY - this.canvasOffset.y
    })

    window.addEventListener('mousedown', (event) => {
      console.log('mouse y ', this.mouse.y)
      console.log('cenrer ', this.centerY)
      console.log('offset ', event.offsetY)
    })

    window.addEventListener(
      'touchstart',
      (event) => {
        this.mouse.x = event.changedTouches[0].clientX
        this.mouse.y = event.changedTouches[0].clientY
      },
      false
    )

    window.addEventListener(
      'touchmove',
      (event) => {
        event.preventDefault()
        this.mouse.x = event.targetTouches[0].clientX
        this.mouse.y = event.targetTouches[0].clientY
      },
      false
    )

    window.addEventListener(
      'touchend',
      (event) => {
        event.preventDefault()
        this.mouse.x = 0
        this.mouse.y = 0
      },
      false
    )
  }

  public init(context) {
    context.drawImage(this.image, this.x, this.y)
    let pixels = context.getImageData(0, 0, this.width, this.height).data
    let index
    for (let y = 0; y < this.height; y += this.gap) {
      for (let x = 0; x < this.width; x += this.gap) {
        index = (y * this.width + x) * 4
        const red = pixels[index]
        const green = pixels[index + 1]
        const blue = pixels[index + 2]
        const color = 'rgb(' + red + ',' + green + ',' + blue + ')'

        const alpha = pixels[index + 3]
        if (alpha > 0) {
          this.particles.push(new Particle(this, x, y, color))
        }
      }
    }
    context.clearRect(0, 0, this.width, this.height)
  }
  public update() {
    for (const element of this.particles) {
      element.update()
    }
  }
  public render(context) {
    context.clearRect(0, 0, this.width, this.height)
    for (const element of this.particles) {
      let p = element
      context.fillStyle = p.color
      context.fillRect(p.x, p.y, p.size, p.size)
    }
  }
}
