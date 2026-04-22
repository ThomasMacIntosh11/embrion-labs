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
  ScrollTrigger.create({
    trigger: item,
    start: 'top 35%',
    onEnter() {
      gsap.to(dot, { opacity: 0, duration: 0.15, ease: 'none', onComplete() {
        dot.textContent = '✓'
        dot.classList.add('done')
        gsap.to(dot, { opacity: 1, duration: 0.2 })
      }})
    },
    onLeaveBack() {
      gsap.to(dot, { opacity: 0, duration: 0.15, ease: 'none', onComplete() {
        dot.textContent = dot.dataset.num
        dot.classList.remove('done')
        gsap.to(dot, { opacity: 1, duration: 0.2 })
      }})
    },
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

// Proto-visual animation
;(function () {
  const svg = document.getElementById('proto-svg')
  if (!svg) return

  const CX = 190, CY = 220
  const BLUE = '#4A6FE8'
  const NS = 'http://www.w3.org/2000/svg'

  function nodeRing(cx, cy, r, n, startDeg) {
    return Array.from({ length: n }, (_, i) => {
      const a = (startDeg + (i * 360) / n) * (Math.PI / 180)
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
    })
  }

  const NODES = [
    { x: CX, y: CY, r: 13 },
    ...nodeRing(CX, CY, 82,  6, -90).map(p => ({ ...p, r: 7   })),
    ...nodeRing(CX, CY, 138, 3, -90).map(p => ({ ...p, r: 9.5 })),
  ]

  const EDGES = [
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
    [7,1],[7,6],[8,3],[8,4],[9,5],[9,4],
  ]

  function make(tag, attrs) {
    const el = document.createElementNS(NS, tag)
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    return el
  }

  // Build rings (drawn on top, hidden initially)
  const ringEls = [82, 138].map(r => {
    const circ = 2 * Math.PI * r
    const el = make('circle', {
      cx: CX, cy: CY, r, fill: 'none',
      stroke: '#4A6FE8', 'stroke-width': '1',
      'stroke-dasharray': circ, 'stroke-dashoffset': circ,
    })
    gsap.set(el, { opacity: 0 })
    svg.appendChild(el)
    return { el, circ }
  })

  // Build lines (behind nodes)
  const lineEls = EDGES.map(([a, b]) => {
    const el = make('line', {
      x1: NODES[a].x, y1: NODES[a].y,
      x2: NODES[b].x, y2: NODES[b].y,
      stroke: '#6b6b6b', 'stroke-width': '1',
    })
    gsap.set(el, { opacity: 0 })
    svg.insertBefore(el, svg.firstChild)
    return el
  })

  // Build nodes (front)
  const nodeEls = NODES.map(({ x, y, r }, i) => {
    const el = make('circle', {
      cx: x, cy: y, r,
      fill: i === 0 ? '#4A6FE8' : '#0c0c0b',
    })
    gsap.set(el, { opacity: 0 })
    svg.appendChild(el)
    return el
  })

  function run() {
    // Reset — restore colors and final positions before scatter
    nodeEls.forEach((el, i) => gsap.set(el, {
      opacity: 0,
      attr: {
        cx: NODES[i].x, cy: NODES[i].y,
        fill: i === 0 ? '#4A6FE8' : '#0c0c0b',
        stroke: 'none',
      },
    }))
    lineEls.forEach(el => gsap.set(el, { opacity: 0, attr: { stroke: '#6b6b6b' } }))
    ringEls.forEach(({ el, circ }) => gsap.set(el, { opacity: 0, attr: { 'stroke-dashoffset': circ } }))

    // Phase 1 — scatter & appear (0–1.6s)
    // Snap each node to a random position, then fade in
    nodeEls.forEach((el, i) => {
      gsap.set(el, { attr: { cx: 30 + Math.random() * 320, cy: 20 + Math.random() * 400 } })
      gsap.to(el, { opacity: 0.7, duration: 0.45, delay: 0.05 + i * 0.1 })
    })

    // Phase 2 — lines whisper in (1.5–2.6s)
    lineEls.forEach((el, i) => {
      gsap.to(el, { opacity: 0.55, duration: 0.4, delay: 1.5 + i * 0.09 })
    })

    // Phase 3 — converge to final positions (2.7–5.0s)
    // Animating cx/cy attributes directly — no CSS transform ambiguity
    nodeEls.forEach((el, i) => {
      gsap.to(el, {
        attr: { cx: NODES[i].x, cy: NODES[i].y },
        opacity: 1,
        duration: 1.3,
        delay: 2.7 + i * 0.07,
        ease: 'back.out(1.5)',
      })
    })
    lineEls.forEach((el, i) => {
      gsap.to(el, { opacity: 0.85, duration: 0.6, delay: 3.4 + i * 0.06 })
    })

    // Phase 4 — rings draw in (5.0–6.8s)
    ringEls.forEach(({ el, circ }, i) => {
      gsap.to(el, { opacity: 1, duration: 0.4, delay: 5.0 + i * 0.45 })
      gsap.to(el, {
        attr: { 'stroke-dashoffset': 0 },
        duration: 1.4, delay: 5.0 + i * 0.5, ease: 'power2.out',
      })
    })

    // Phase 5 — crystallise, cascade blue (6.5–7.4s)
    nodeEls.slice(1, 7).forEach((el, i) => {
      setTimeout(() => el.setAttribute('fill', BLUE), 6500 + i * 110)
    })
    nodeEls.slice(7).forEach((el, i) => {
      setTimeout(() => {
        el.setAttribute('stroke', BLUE)
        el.setAttribute('stroke-width', '1.5')
        el.setAttribute('stroke-opacity', '1')
      }, 6900 + i * 130)
    })
    lineEls.forEach((el, i) => {
      setTimeout(() => el.setAttribute('stroke', '#4A6FE8'), 6500 + i * 40)
    })

    // Hold, fade out, loop (~9s total)
    gsap.to(svg, {
      opacity: 0, duration: 0.8, delay: 9.0,
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
