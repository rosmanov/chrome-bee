import { BROKEN_DEFAULTS } from "../src/shortcuts.js"

describe("Shortcut constants", () => {
  test("BROKEN_DEFAULTS contains known bad shortcuts", () => {
    expect(BROKEN_DEFAULTS.has("Ctrl+E")).toBe(true)
    expect(BROKEN_DEFAULTS.has("Command+E")).toBe(true)
    expect(BROKEN_DEFAULTS.has("Alt+Shift+E")).toBe(true)
    expect(BROKEN_DEFAULTS.has("Ctrl+Shift+U")).toBe(false)
  })
})
