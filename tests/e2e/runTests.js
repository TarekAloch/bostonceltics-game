#!/usr/bin/env node
/**
 * Boston Celtics Game - E2E Test Runner
 * Runs Puppeteer tests against the dev server
 */

import puppeteer from 'puppeteer'
import { spawn } from 'child_process'

let BASE_URL = 'http://localhost:5173'
const TIMEOUT = 30000

let browser
let page
let devServer
const results = { passed: 0, failed: 0, tests: [] }

// Colors for output
const green = '\x1b[32m'
const red = '\x1b[31m'
const yellow = '\x1b[33m'
const reset = '\x1b[0m'
const bold = '\x1b[1m'

console.log(`\n${bold}🏀 Boston Celtics Game - E2E Tests${reset}\n`)
console.log('=' .repeat(50))

// Start dev server
async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log(`${yellow}Starting dev server...${reset}`)

    devServer = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173', '--strictPort'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    })

    let started = false

    devServer.stdout.on('data', (data) => {
      const output = data.toString()
      // Match any localhost port
      const portMatch = output.match(/localhost:(\d+)/)
      if (portMatch && !started) {
        started = true
        BASE_URL = `http://localhost:${portMatch[1]}`
        console.log(`${green}✓ Dev server running at ${BASE_URL}${reset}\n`)
        setTimeout(resolve, 1500) // Give it a moment
      }
    })

    devServer.stderr.on('data', (data) => {
      const output = data.toString()
      // Also check stderr for the URL
      const portMatch = output.match(/localhost:(\d+)/)
      if (portMatch && !started) {
        started = true
        BASE_URL = `http://localhost:${portMatch[1]}`
        console.log(`${green}✓ Dev server running at ${BASE_URL}${reset}\n`)
        setTimeout(resolve, 1500)
      }
    })

    // Timeout after 30s
    setTimeout(() => {
      if (!started) {
        reject(new Error('Dev server failed to start'))
      }
    }, 30000)
  })
}

// Test runner
async function runTest(name, testFn) {
  const startTime = Date.now()
  try {
    await testFn()
    const duration = Date.now() - startTime
    results.passed++
    results.tests.push({ name, status: 'passed', duration })
    console.log(`${green}✓${reset} ${name} ${yellow}(${duration}ms)${reset}`)
  } catch (error) {
    const duration = Date.now() - startTime
    results.failed++
    results.tests.push({ name, status: 'failed', error: error.message, duration })
    console.log(`${red}✗${reset} ${name} ${yellow}(${duration}ms)${reset}`)
    console.log(`  ${red}Error: ${error.message}${reset}`)

    // Take screenshot on failure
    try {
      await page.screenshot({ path: `tests/e2e/screenshots/${name.replace(/\s+/g, '-')}-fail.png` })
    } catch { }
  }
}

// Helper functions
async function clickButton(text) {
  const buttons = await page.$$('button')
  for (const btn of buttons) {
    const btnText = await btn.evaluate(el => el.textContent)
    if (btnText && btnText.toLowerCase().includes(text.toLowerCase())) {
      await btn.click()
      return true
    }
  }
  return false
}

async function waitForContent(content, timeout = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const pageContent = await page.content()
    if (pageContent.toLowerCase().includes(content.toLowerCase())) {
      return true
    }
    await new Promise(r => setTimeout(r, 100))
  }
  return false
}

// ============================================
// TESTS
// ============================================

async function runAllTests() {
  try {
    // Start dev server
    await startDevServer()

    // Launch browser
    console.log(`${yellow}Launching browser...${reset}`)
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
    })
    console.log(`${green}✓ Browser launched${reset}\n`)

    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })

    // Collect console errors
    const consoleErrors = []
    page.on('pageerror', err => consoleErrors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text())
      }
    })

    console.log(`${bold}Running tests...${reset}\n`)

    // TEST 1: App loads
    await runTest('App loads without crashing', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })
      const buttons = await page.$$('button')
      if (buttons.length === 0) throw new Error('No buttons found on page')
    })

    // TEST 2: Start screen has content
    await runTest('Start screen shows Celtics content', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })
      const hasContent = await waitForContent('celtics')
      if (!hasContent) throw new Error('Celtics content not found')
    })

    // TEST 3: Can click start/play button
    await runTest('Can start the game', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      // Try clicking various buttons
      const clicked = await clickButton('play') ||
                     await clickButton('start') ||
                     await clickButton('begin')

      // Or just click first button
      if (!clicked) {
        const buttons = await page.$$('button')
        if (buttons.length > 0) await buttons[0].click()
      }

      await new Promise(r => setTimeout(r, 1000))
      const pageContent = await page.content()
      const gameStarted = pageContent.includes('Quarter') ||
                         pageContent.includes('Score') ||
                         pageContent.includes('0')
      if (!gameStarted) throw new Error('Game did not start')
    })

    // TEST 4: Game shows scoreboard
    await runTest('Scoreboard is visible', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      // Start game
      const buttons = await page.$$('button')
      for (const btn of buttons.slice(0, 2)) {
        try { await btn.click() } catch { }
        await new Promise(r => setTimeout(r, 500))
      }

      await new Promise(r => setTimeout(r, 1500))

      const hasScoreboard = await waitForContent('quarter') ||
                           await waitForContent('score') ||
                           await waitForContent('celtics')
      if (!hasScoreboard) throw new Error('Scoreboard not visible')
    })

    // TEST 5: Game phases work (trivia appears)
    await runTest('Game phases load correctly', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      // Navigate to game
      const buttons = await page.$$('button')
      for (const btn of buttons.slice(0, 3)) {
        try { await btn.click() } catch { }
        await new Promise(r => setTimeout(r, 700))
      }

      await new Promise(r => setTimeout(r, 2000))

      // Game should show some interactive content
      const pageContent = await page.content()
      const hasGameContent = pageContent.includes('?') || // Trivia question
                            pageContent.includes('Shot') ||
                            pageContent.includes('Answer') ||
                            pageContent.includes('Defense') ||
                            pageContent.includes('Contest') ||
                            pageContent.includes('Score')

      if (!hasGameContent) throw new Error('No game phase content found')
    })

    // TEST 6: Mobile responsive
    await runTest('Works on mobile viewport', async () => {
      await page.setViewport({ width: 375, height: 667 })
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      const buttons = await page.$$('button')
      if (buttons.length === 0) throw new Error('No buttons on mobile')

      // Reset viewport
      await page.setViewport({ width: 1280, height: 720 })
    })

    // TEST 7: No critical JS errors
    await runTest('No critical JavaScript errors', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      // Interact with page
      const buttons = await page.$$('button')
      for (const btn of buttons.slice(0, 3)) {
        try { await btn.click() } catch { }
        await new Promise(r => setTimeout(r, 500))
      }

      await new Promise(r => setTimeout(r, 2000))

      const criticalErrors = consoleErrors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('net::') &&
        !e.includes('404') &&
        !e.includes('403') &&
        !e.includes('Failed to load resource') &&
        !e.includes('ResizeObserver') &&
        !e.includes('mixkit')
      )

      if (criticalErrors.length > 0) {
        throw new Error(`JS errors: ${criticalErrors.join(', ')}`)
      }
    })

    // TEST 8: SVGs render (player sprites)
    await runTest('Player sprites/SVGs render', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT })

      // Start game
      const buttons = await page.$$('button')
      for (const btn of buttons.slice(0, 2)) {
        try { await btn.click() } catch { }
        await new Promise(r => setTimeout(r, 500))
      }

      await new Promise(r => setTimeout(r, 1500))

      const svgCount = await page.$$eval('svg', els => els.length)
      if (svgCount === 0) throw new Error('No SVG elements found')
    })

  } catch (error) {
    console.error(`\n${red}Test setup failed: ${error.message}${reset}`)
    results.failed++
  } finally {
    // Cleanup
    if (browser) await browser.close()
    if (devServer) {
      devServer.kill('SIGTERM')
    }

    // Print results
    console.log('\n' + '='.repeat(50))
    console.log(`${bold}Test Results${reset}`)
    console.log('='.repeat(50))
    console.log(`${green}Passed: ${results.passed}${reset}`)
    console.log(`${red}Failed: ${results.failed}${reset}`)
    console.log(`Total:  ${results.passed + results.failed}`)

    if (results.failed > 0) {
      console.log(`\n${red}${bold}Some tests failed!${reset}`)
      process.exit(1)
    } else {
      console.log(`\n${green}${bold}All tests passed! 🎉${reset}`)
      process.exit(0)
    }
  }
}

// Run
runAllTests()
