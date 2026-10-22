import { describe, expect, it } from "bun:test"
import looksSame from "../lib/looks-same"
import { createCircuitPng } from "./fixtures/create-circuit-png"

describe("percentThreshold option", () => {
  it("considers images equal when difference percentage is within percentThreshold", async () => {
    const image1 = await createCircuitPng(
      <board width="10mm" height="10mm">
        <resistor name="R1" footprint="0603" resistance="1k" />
      </board>,
    )
    const image2 = await createCircuitPng(
      <board width="10mm" height="10mm">
        <resistor name="R1" pcbX="0.2" footprint="0603" resistance="1k" />
      </board>,
    )

    // Baseline: images are not completely identical
    const baseline = await looksSame(image1, image2, { tolerance: 2 })
    expect(baseline.equal).toBe(false)
    expect(baseline.differentPixels).toBeGreaterThan(0)
    expect(baseline.totalPixels).toBeGreaterThan(0)

    const actualPercent =
      ((baseline.differentPixels ?? 0) / (baseline.totalPixels ?? 1)) * 100

    // Threshold higher than actual percentage -> equal should be true
    const allowed = await looksSame(image1, image2, {
      tolerance: 2,
      percentThreshold: actualPercent + 0.5,
    })
    expect(allowed.equal).toBe(true)
    expect(allowed.differentPixels).toBe(baseline.differentPixels)

    // Threshold lower than actual percentage -> equal should be false
    const forbidden = await looksSame(image1, image2, {
      tolerance: 2,
      percentThreshold: Math.max(0, actualPercent - 0.5),
    })
    expect(forbidden.equal).toBe(false)
  })

  it("works with strict mode and percentThreshold", async () => {
    const image1 = await createCircuitPng(
      <board width="10mm" height="10mm">
        <resistor name="R1" footprint="0603" resistance="1k" />
      </board>,
    )
    const image2 = await createCircuitPng(
      <board width="10mm" height="10mm">
        <resistor name="R1" pcbX="0.2" footprint="0603" resistance="1k" />
      </board>,
    )

    const baseline = await looksSame(image1, image2, { strict: true })
    const actualPercent =
      ((baseline.differentPixels ?? 0) / (baseline.totalPixels ?? 1)) * 100

    const allowed = await looksSame(image1, image2, {
      strict: true,
      percentThreshold: actualPercent + 1,
    })
    expect(allowed.equal).toBe(true)

    const forbidden = await looksSame(image1, image2, {
      strict: true,
      percentThreshold: Math.max(0, actualPercent - 1),
    })
    expect(forbidden.equal).toBe(false)
  })

  it("throws TypeError when percentThreshold is negative or non-finite", async () => {
    const image1 = await createCircuitPng(
      <board width="10mm" height="10mm">
        <resistor name="R1" footprint="0603" resistance="1k" />
      </board>,
    )

    expect(looksSame(image1, image1, { percentThreshold: -1 })).rejects.toThrow(
      'Expected "percentThreshold" to be a non-negative number',
    )

    expect(
      looksSame(image1, image1, { percentThreshold: Number.NaN }),
    ).rejects.toThrow('Expected "percentThreshold" to be a non-negative number')
  })
})
