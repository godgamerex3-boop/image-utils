import { expect, test } from "bun:test"
import { svgPathToPoints } from "../lib/svg-path-to-points"

test("svgPathToPoints treats degenerate elliptical arc with rx=0 as straight line", () => {
  const points = svgPathToPoints("M0 0 A0 5 0 0 1 10 0 Z", 10)
  expect(points).toEqual([
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
    ],
  ])
})

test("svgPathToPoints treats degenerate elliptical arc with ry=0 as straight line", () => {
  const points = svgPathToPoints("M0 0 A5 0 0 0 1 10 0 Z", 10)
  expect(points).toEqual([
    [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 0, y: 0 },
    ],
  ])
})

test("svgPathToPoints treats degenerate elliptical arc with rx=0 and ry=0 as straight line", () => {
  const points = svgPathToPoints("M0 0 A0 0 0 0 1 20 15", 10)
  expect(points).toEqual([
    [
      { x: 0, y: 0 },
      { x: 20, y: 15 },
    ],
  ])
})
