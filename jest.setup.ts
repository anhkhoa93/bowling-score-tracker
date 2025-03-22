import '@testing-library/jest-dom'

// Extend Jest's expect
import { expect } from '@jest/globals'
import matchers from '@testing-library/jest-dom/matchers'

// Add the custom matchers
expect.extend(matchers)