import { describe, expect, it } from "bun:test"
import { getTransformedSvgPathRoutes } from "../lib/svg-to-brep-shapes"

describe("SVG custom attributes handling in getTransformedSvgPathRoutes", () => {
  it("does not allow data-d to override the actual d path attribute", () => {
    const routes = getTransformedSvgPathRoutes({
      svg: '<svg viewBox="0 0 10 10"><path data-d="M0 0 L2 0 L2 2 Z" d="M0 0 L10 0 L10 10 Z"/></svg>',
      width: 10,
      height: 10,
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    })

    expect(routes.length).toBe(1)
    const points = routes[0]
    expect(points.length).toBeGreaterThanOrEqual(3)

    // Expected bounding coordinates for d="M0 0 L10 0 L10 10 Z" scaled to 10x10 centered at (0,0):
    // viewBox is 0 to 10 -> center is 5,5 -> x: (0-5)*1=-5, (10-5)*1=5; y: -(0-5)*1=5, -(10-5)*1=-5
    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))
    const minY = Math.min(...points.map((p) => p.y))
    const maxY = Math.max(...points.map((p) => p.y))

    expect(minX).toBeCloseTo(-5)
    expect(maxX).toBeCloseTo(5)
    expect(minY).toBeCloseTo(-5)
    expect(maxY).toBeCloseTo(5)
  })

  it("does not allow data-viewBox to override the actual viewBox attribute", () => {
    const routes = getTransformedSvgPathRoutes({
      svg: '<svg data-viewBox="0 0 50 50" viewBox="0 0 10 10"><path d="M0 0 L10 0 L10 10 Z"/></svg>',
      width: 10,
      height: 10,
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    })

    expect(routes.length).toBe(1)
    const points = routes[0]
    const minX = Math.min(...points.map((p) => p.x))
    const maxX = Math.max(...points.map((p) => p.x))

    // If data-viewBox (50x50) were used, scale would be 10/50 = 0.2, and maxX-minX would be ~2
    // With real viewBox (10x10), scale is 10/10 = 1, so maxX-minX is ~10
    expect(maxX - minX).toBeCloseTo(10)
  })

  it("does not allow namespaced attributes like custom:d to override d", () => {
    const routes = getTransformedSvgPathRoutes({
      svg: '<svg viewBox="0 0 10 10"><path custom:d="M0 0 L1 0 Z" d="M0 0 L10 0 L10 10 Z"/></svg>',
      width: 10,
      height: 10,
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    })

    expect(routes.length).toBe(1)
    const points = routes[0]
    const maxX = Math.max(...points.map((p) => p.x))
    expect(maxX).toBeCloseTo(5)
  })
})
