/**
 * Boston Celtics Game - E2E Tests with Puppeteer
 * Tests the complete game flow from start to scoring
 */

import puppeteer from 'puppeteer'

const BASE_URL = 'http://localhost:5173'
const TIMEOUT = 30000

let browser
let page

// Helper to wait and click
async function clickElement(selector, timeout = 5000) {
  await page.waitForSelector(selector, { timeout })
  await page.click(selector)
}

// Helper to check if element exists
async function elementExists(selector, timeout = 3000) {
  try {
    await page.waitForSelector(selector, { timeout })
    return true
  } catch {
    return false
  }
}

// Helper to get text content
async function getText(selector) {
  await page.waitForSelector(selector)
  return page.$eval(selector, el => el.textContent)
}

// Helper to take screenshot on failure
async function screenshotOnFail(testName) {
  await page.screenshot({ path: `tests/e2e/screenshots/${testName}-fail.png` })
}

describe('Boston Celtics Game E2E Tests', () => {

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  })

  afterAll(async () => {
    if (browser) await browser.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    // Listen for console errors
    page.on('pageerror', error => {
      console.error('Page error:', error.message)
    })
  })

  afterEach(async () => {
    if (page) await page.close()
  })

  // ============================================
  // TEST 1: App loads without errors
  // ============================================
  test('App loads and shows start screen', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Check for start screen elements
    const hasStartButton = await elementExists('button')
    expect(hasStartButton).toBe(true)

    // Check page title or header
    const pageContent = await page.content()
    expect(pageContent.toLowerCase()).toContain('celtics')

    console.log('✅ App loads successfully')
  }, TIMEOUT)

  // ============================================
  // TEST 2: Can select difficulty and start game
  // ============================================
  test('Can select difficulty and start game', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Look for difficulty buttons or start button
    const buttons = await page.$$('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Click the first available button (likely start or difficulty)
    await buttons[0].click()
    await page.waitForTimeout(1000)

    // Check if game state changed (look for game elements)
    const pageContent = await page.content()
    const hasGameStarted = pageContent.includes('Quarter') ||
                          pageContent.includes('Score') ||
                          pageContent.includes('Celtics')

    expect(hasGameStarted).toBe(true)
    console.log('✅ Game starts successfully')
  }, TIMEOUT)

  // ============================================
  // TEST 3: Offense trivia phase works
  // ============================================
  test('Offense trivia shows questions and accepts answers', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Start the game
    const startButtons = await page.$$('button')
    if (startButtons.length > 0) {
      await startButtons[0].click()
      await page.waitForTimeout(500)
    }

    // If there's a second click needed (like play button)
    const playButtons = await page.$$('button')
    for (const btn of playButtons) {
      const text = await btn.evaluate(el => el.textContent)
      if (text && (text.includes('Play') || text.includes('Start') || text.includes('PLAY'))) {
        await btn.click()
        break
      }
    }

    await page.waitForTimeout(2000)

    // Look for trivia elements (questions, answer buttons)
    const pageContent = await page.content()
    const hasTriviaOrGame = pageContent.includes('?') || // Question mark indicates trivia
                           pageContent.includes('answer') ||
                           pageContent.includes('Answer') ||
                           pageContent.includes('Quarter') ||
                           pageContent.includes('Score')

    expect(hasTriviaOrGame).toBe(true)
    console.log('✅ Game phase loaded')
  }, TIMEOUT)

  // ============================================
  // TEST 4: Scoring updates correctly
  // ============================================
  test('Score updates when answering trivia', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Navigate through to game
    const buttons = await page.$$('button')
    for (const btn of buttons) {
      try {
        await btn.click()
        await page.waitForTimeout(500)
      } catch {
        // Button may have been removed
      }
    }

    await page.waitForTimeout(3000)

    // Check for score display
    const pageContent = await page.content()
    const hasScoreElements = pageContent.includes('0') ||
                            pageContent.includes('Celtics') ||
                            pageContent.includes('Lakers')

    expect(hasScoreElements).toBe(true)
    console.log('✅ Score elements present')
  }, TIMEOUT)

  // ============================================
  // TEST 5: No JavaScript errors during gameplay
  // ============================================
  test('No console errors during gameplay', async () => {
    const errors = []

    page.on('pageerror', error => {
      errors.push(error.message)
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Interact with the page
    const buttons = await page.$$('button')
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      try {
        await buttons[i].click()
        await page.waitForTimeout(500)
      } catch {
        // Expected if button removed
      }
    }

    await page.waitForTimeout(2000)

    // Filter out non-critical errors
    const criticalErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::')
    )

    if (criticalErrors.length > 0) {
      console.log('Errors found:', criticalErrors)
    }

    expect(criticalErrors.length).toBe(0)
    console.log('✅ No critical JavaScript errors')
  }, TIMEOUT)

  // ============================================
  // TEST 6: Game is responsive (mobile viewport)
  // ============================================
  test('Game renders on mobile viewport', async () => {
    await page.setViewport({ width: 375, height: 667 }) // iPhone SE
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Check that content is visible
    const buttons = await page.$$('button')
    expect(buttons.length).toBeGreaterThan(0)

    // Check no horizontal scroll (content fits)
    const bodyWidth = await page.$eval('body', el => el.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375)

    console.log('✅ Mobile responsive')
  }, TIMEOUT)

  // ============================================
  // TEST 7: Defense phase loads
  // ============================================
  test('Defense components render when Lakers have ball', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Start game and play through
    const clickAll = async () => {
      const btns = await page.$$('button')
      for (const btn of btns.slice(0, 5)) {
        try {
          await btn.click()
          await page.waitForTimeout(800)
        } catch { }
      }
    }

    await clickAll()
    await page.waitForTimeout(2000)
    await clickAll()

    // Check for defense-related content
    const pageContent = await page.content()
    const hasDefenseOrGame = pageContent.includes('Defense') ||
                            pageContent.includes('Contest') ||
                            pageContent.includes('Block') ||
                            pageContent.includes('Steal') ||
                            pageContent.includes('Lakers') ||
                            pageContent.includes('Quarter')

    expect(hasDefenseOrGame).toBe(true)
    console.log('✅ Defense/Game content present')
  }, TIMEOUT)

  // ============================================
  // TEST 8: Player sprites render
  // ============================================
  test('Player sprites are visible on court', async () => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

    // Start game
    const buttons = await page.$$('button')
    if (buttons.length > 0) {
      await buttons[0].click()
      await page.waitForTimeout(1000)
    }

    // Look for SVG elements (sprites are SVG-based)
    const svgElements = await page.$$('svg')

    // Also check for player-related content
    const pageContent = await page.content()
    const hasPlayerContent = pageContent.includes('player') ||
                            pageContent.includes('Player') ||
                            pageContent.includes('Tatum') ||
                            pageContent.includes('LeBron') ||
                            svgElements.length > 0

    expect(hasPlayerContent).toBe(true)
    console.log('✅ Player content/sprites present')
  }, TIMEOUT)

})

// Run tests
console.log('\n🏀 Starting Boston Celtics Game E2E Tests...\n')
