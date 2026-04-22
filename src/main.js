import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// Cursor
const cursor = document.getElementById('cursor')
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px'
  cursor.style.top = e.clientY + 'px'
})
document.querySelectorAll('a, button, .step, .svc-item, .num-item, .tl-item').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('expand'))
  el.addEventListener('mouseleave', () => cursor.classList.remove('expand'))
})

// Nav
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 30)
}, { passive: true })

// Hero entrance
gsap.timeline({ defaults: { ease: 'power2.out' } })
  .from('.hero-eyebrow', { opacity: 0, y: 12, duration: 0.6, delay: 0.2 })
  .from('.hero-headline',  { opacity: 0, y: 20, duration: 0.9 }, '-=0.4')
  .from('.hero-bottom',    { opacity: 0, y: 16, duration: 0.8 }, '-=0.5')

// Scroll reveals
gsap.utils.toArray('.reveal').forEach(el => {
  const delay = el.classList.contains('rd3') ? 0.3
              : el.classList.contains('rd2') ? 0.2
              : el.classList.contains('rd1') ? 0.1
              : 0
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    opacity: 0, y: 28, duration: 0.7, delay, ease: 'power2.out',
  })
})

// Timeline items — entrance
gsap.utils.toArray('.tl-item').forEach(el => {
  gsap.from(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    opacity: 0, x: -20, duration: 0.6, ease: 'power2.out',
  })
})

// Timeline dots — swap to ✓ as each item scrolls past
document.querySelectorAll('.tl-item').forEach(item => {
  const dot = item.querySelector('.tl-dot')
  dot.dataset.num = dot.textContent

  const swap = (toCheck) => {
    gsap.killTweensOf(dot)
    gsap.to(dot, {
      scale: 0, duration: 0.18, ease: 'back.in(1.5)',
      onComplete() {
        dot.textContent = toCheck ? '✓' : dot.dataset.num
        toCheck ? dot.classList.add('done') : dot.classList.remove('done')
        gsap.to(dot, { scale: 1, duration: 0.28, ease: 'back.out(2.5)' })
      }
    })
  }

  ScrollTrigger.create({
    trigger: item,
    start: 'top 40%',
    onEnter:     () => swap(true),
    onLeaveBack: () => swap(false),
  })
})

// Counters
document.querySelectorAll('.num-item').forEach(item => {
  const el = item.querySelector('[data-target]')
  if (!el) return
  const target = +el.dataset.target
  const suffix = el.dataset.suffix
  const obj = { val: 0 }
  ScrollTrigger.create({
    trigger: item, start: 'top 60%', once: true,
    onEnter() {
      gsap.to(obj, {
        val: target, duration: 1.8, ease: 'power3.out',
        onUpdate() { el.innerHTML = Math.round(obj.val) + '<sup>' + suffix + '</sup>' },
      })
    },
  })
})

// Proto-visual animation — 3 acts: circles → squares → triangles, all blue
;(function () {
  const svg = document.getElementById('proto-svg')
  if (!svg) return

  const NS = 'http://www.w3.org/2000/svg'
  const CX = 190, CY = 215

  function make(tag, attrs) {
    const el = document.createElementNS(NS, tag)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    return el
  }

  function tweenPos(g, toX, toY, opts) {
    const m = (g.getAttribute('transform') || '').match(/translate\(([^,]+),([^)]+)\)/)
    const obj = { x: m ? parseFloat(m[1]) : 0, y: m ? parseFloat(m[2]) : 0 }
    gsap.to(obj, {
      x: toX, y: toY, ...opts,
      onUpdate() { g.setAttribute('transform', `translate(${obj.x},${obj.y})`) },
    })
  }

  const BLUES = ['#1A34A8','#2E52CC','#3558D4','#4A6FE8','#5577EC','#6B8EF0','#7A9BF2','#8BAAF5','#4A6FE8','#3558D4']

  const ACTS = [
    // ── ACT 1: Circles — hub + inner ring of 6 + outer ring of 3 ─────────────
    {
      positions: [
        { x: CX, y: CY },
        ...Array.from({ length: 6 }, (_, i) => {
          const a = (i * 60 - 90) * Math.PI / 180
          return { x: CX + 82 * Math.cos(a), y: CY + 82 * Math.sin(a) }
        }),
        ...Array.from({ length: 3 }, (_, i) => {
          const a = (i * 120 - 90) * Math.PI / 180
          return { x: CX + 142 * Math.cos(a), y: CY + 142 * Math.sin(a) }
        }),
      ],
      edges: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[7,1],[7,6],[8,3],[8,4],[9,5],[9,4]],
      sizes: [20, 12,12,12,12,12,12, 16,16,16],
      build(i) {
        return make('circle', { cx: 0, cy: 0, r: this.sizes[i], fill: BLUES[i] })
      },
    },
    // ── ACT 2: Squares — 3×3 grid ────────────────────────────────────────────
    {
      positions: (() => {
        const pts = [], sp = 86
        for (const row of [-1, 0, 1])
          for (const col of [-1, 0, 1])
            pts.push({ x: CX + col * sp, y: CY + row * sp })
        return pts
      })(),
      edges: [
        [0,1],[1,2],[3,4],[4,5],[6,7],[7,8],
        [0,3],[3,6],[1,4],[4,7],[2,5],[5,8],
        [0,4],[2,4],[4,6],[4,8],
      ],
      sizes: [21,16,21, 16,30,16, 21,16,21],
      build(i) {
        const h = this.sizes[i] / 2
        return make('rect', { x: -h, y: -h, width: this.sizes[i], height: this.sizes[i], rx: 3, fill: BLUES[i] })
      },
    },
    // ── ACT 3: Triangles — star of David (outer △ + inner ▽ + centre) ────────
    {
      positions: [
        { x: CX, y: CY },
        ...Array.from({ length: 3 }, (_, i) => {
          const a = (i * 120 - 90) * Math.PI / 180
          return { x: CX + 132 * Math.cos(a), y: CY + 132 * Math.sin(a) }
        }),
        ...Array.from({ length: 3 }, (_, i) => {
          const a = (i * 120 + 90) * Math.PI / 180
          return { x: CX + 74 * Math.cos(a), y: CY + 74 * Math.sin(a) }
        }),
      ],
      edges: [
        [1,2],[2,3],[3,1],
        [4,5],[5,6],[6,4],
        [0,4],[0,5],[0,6],
        [1,5],[1,6],[2,4],[2,6],[3,4],[3,5],
      ],
      sizes: [20, 18,18,18, 14,14,14],
      build(i) {
        const s = this.sizes[i], h = s * 1.15
        // outer ring (1–3) point up, inner ring (4–6) point down
        const down = i >= 4
        const pts = down
          ? `0,${h * 0.85} ${s},${-h * 0.65} ${-s},${-h * 0.65}`
          : `0,${-h} ${s},${h * 0.7} ${-s},${h * 0.7}`
        return make('polygon', { points: pts, fill: BLUES[i] })
      },
    },
  ]

  let actIndex = -1
  let activeEls = []

  function clearActive() {
    activeEls.forEach(el => el.parentNode?.removeChild(el))
    activeEls = []
  }

  function run() {
    actIndex = (actIndex + 1) % ACTS.length
    const act = ACTS[actIndex]

    clearActive()

    const lineEls = act.edges.map(([a, b]) => {
      const el = make('line', {
        x1: act.positions[a].x, y1: act.positions[a].y,
        x2: act.positions[b].x, y2: act.positions[b].y,
        stroke: '#4A6FE8', 'stroke-width': '1',
      })
      gsap.set(el, { opacity: 0 })
      svg.insertBefore(el, svg.firstChild)
      return el
    })

    const groupEls = act.positions.map((_, i) => {
      const g = make('g', {
        transform: `translate(${25 + Math.random() * 330},${25 + Math.random() * 390})`,
      })
      g.appendChild(act.build(i))
      gsap.set(g, { opacity: 0 })
      svg.appendChild(g)
      return g
    })

    activeEls = [...lineEls, ...groupEls]

    // Phase 1 — scattered shapes fade in (0–1.5s)
    groupEls.forEach((g, i) => {
      gsap.to(g, { opacity: 0.75, duration: 0.4, delay: 0.05 + i * 0.1 })
    })

    // Phase 2 — converge to pattern (2.2–4.0s)
    groupEls.forEach((g, i) => {
      const { x, y } = act.positions[i]
      tweenPos(g, x, y, { duration: 1.25, delay: 2.2 + i * 0.07, ease: 'back.out(1.4)' })
      gsap.to(g, { opacity: 1, duration: 0.8, delay: 2.2 + i * 0.07 })
    })

    // Phase 3 — lines connect (3.5–5.0s)
    lineEls.forEach((el, i) => {
      gsap.to(el, { opacity: 0.65, duration: 0.45, delay: 3.5 + i * 0.07 })
    })

    // Hold then fade out, advance act (~9.5s total)
    gsap.to(svg, {
      opacity: 0, duration: 0.8, delay: 8.5,
      onComplete() { gsap.set(svg, { opacity: 1 }); run() },
    })
  }

  gsap.from(svg, { opacity: 0, duration: 0.6, delay: 0.5 })
  setTimeout(run, 500)
})()

// Accordion
document.querySelectorAll('.svc-item').forEach(item => {
  const body = item.querySelector('.svc-body')
  gsap.set(body, { height: item.classList.contains('open') ? 'auto' : 0 })

  item.querySelector('.svc-header').addEventListener('click', () => {
    const isOpen = item.classList.contains('open')

    document.querySelectorAll('.svc-item.open').forEach(openItem => {
      openItem.classList.remove('open')
      gsap.to(openItem.querySelector('.svc-body'), { height: 0, duration: 0.45, ease: 'power2.inOut' })
    })

    if (!isOpen) {
      item.classList.add('open')
      gsap.to(body, { height: 'auto', duration: 0.45, ease: 'power2.inOut' })
    }
  })
})
