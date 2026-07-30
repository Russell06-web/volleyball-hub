import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// vitest.config.js runs without `test.globals: true` (existing tests all
// import `describe`/`it`/`expect` explicitly from 'vitest' rather than
// relying on injected globals) — @testing-library/react's own automatic
// per-test cleanup only registers itself when it detects a global
// `afterEach`, so without this it never unmounts a previous test's render
// and every later query in the same file sees leftover DOM from earlier
// tests. Registering it here explicitly keeps the rest of the suite
// global-free while still getting a clean DOM between every test.
afterEach(cleanup)
