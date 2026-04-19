const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

function launchBrowser(headless = true) {
  return puppeteer.launch({
    headless,
    executablePath: require('puppeteer').executablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
}

async function validateHboMax(email, password) {
  let browser
  try {
    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent(UA)

    await page.goto('https://auth.hbomax.com/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })

    try {
      await page.waitForSelector('[data-testid="consent-modal-button-0"]', { timeout: 8_000 })
      await page.evaluate(() => document.querySelector('[data-testid="consent-modal-button-0"]').click())
      await new Promise(r => setTimeout(r, 2000))
    } catch { /* sem banner */ }

    await page.waitForSelector('input[type="email"], input[name="email"], input[autocomplete="email"]', { timeout: 15_000 })
    await page.type('input[type="email"], input[name="email"], input[autocomplete="email"]', email, { delay: 60 })
    await page.waitForSelector('input[type="password"]', { timeout: 5_000 })
    await page.type('input[type="password"]', password, { delay: 60 })
    await page.keyboard.press('Enter')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15_000 })

    const url = page.url()
    const valid = url.includes('hbomax.com') && !url.includes('/login') && !url.includes('auth.')
    const cookies = valid ? await page.cookies() : []
    return { valid, cookies }
  } catch {
    return { valid: false, cookies: [] }
  } finally {
    if (browser) await browser.close()
  }
}

async function validateCrunchyroll(email, password) {
  let browser
  try {
    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })
    await page.setUserAgent(UA)

    await page.goto('https://sso.crunchyroll.com/login', { waitUntil: 'networkidle2', timeout: 30_000 })

    try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 6_000 })
      await page.click('#onetrust-accept-btn-handler')
      await new Promise(r => setTimeout(r, 1500))
    } catch { /* sem banner */ }

    await page.waitForSelector('input[name="email"]', { timeout: 10_000 })
    await page.type('input[name="email"]', email, { delay: 60 })
    await page.type('input[name="password"]', password, { delay: 60 })
    await page.keyboard.press('Enter')
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15_000 })

    const url = page.url()
    const valid = url.includes('crunchyroll.com') && !url.includes('/login')
    const cookies = valid ? await page.cookies() : []
    return { valid, cookies }
  } catch {
    return { valid: false, cookies: [] }
  } finally {
    if (browser) await browser.close()
  }
}

const STREAMER_CONFIG = {
  netflix: {
    url: 'https://www.netflix.com/login',
    emailSelector: '#id_userLoginId',
    passwordSelector: '#id_password',
    submitSelector: '[data-uia="login-submit-button"]',
    successIndicator: '/browse',
  },
  prime: {
    url: 'https://www.amazon.com.br/ap/signin',
    emailSelector: '#ap_email',
    passwordSelector: '#ap_password',
    submitSelector: '#signInSubmit',
    successIndicator: 'amazon.com.br',
  },
  'disney+': {
    url: 'https://www.disneyplus.com/login',
    emailSelector: 'input[data-testid="username"]',
    passwordSelector: 'input[data-testid="password"]',
    submitSelector: 'button[data-testid="login-button"]',
    successIndicator: 'disneyplus.com/home',
  },
}

async function validateGeneric(streamer, email, password) {
  const config = STREAMER_CONFIG[streamer.toLowerCase()]
  if (!config) return { valid: false, cookies: [] }

  let browser
  try {
    browser = await launchBrowser()
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30_000 })
    await page.type(config.emailSelector, email, { delay: 50 })
    if (await page.$(config.passwordSelector)) {
      await page.type(config.passwordSelector, password, { delay: 50 })
    }
    await page.click(config.submitSelector)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15_000 })

    const url = page.url()
    const valid = url.includes(config.successIndicator)
    const cookies = valid ? await page.cookies() : []
    return { valid, cookies }
  } catch {
    return { valid: false, cookies: [] }
  } finally {
    if (browser) await browser.close()
  }
}

exports.validateCredential = async (streamer, email, password) => {
  switch (streamer.toLowerCase()) {
    case 'hbo max': return validateHboMax(email, password)
    case 'crunchyroll': return validateCrunchyroll(email, password)
    default: return validateGeneric(streamer, email, password)
  }
}

// Lança browser visível fazendo login com as credenciais e navegando para targetUrl
exports.launchWithSession = async (credential, targetUrl) => {
  const email = credential.email
  const password = credential.getPassword()
  const streamer = credential.streamer.toLowerCase()

  const browser = await launchBrowser(false)
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 900 })
  await page.setUserAgent(UA)

  try {
    if (streamer === 'hbo max') {
      await page.goto('https://auth.hbomax.com/login', { waitUntil: 'domcontentloaded', timeout: 30_000 })
      try {
        await page.waitForSelector('[data-testid="consent-modal-button-0"]', { timeout: 6_000 })
        await page.evaluate(() => document.querySelector('[data-testid="consent-modal-button-0"]').click())
        await new Promise(r => setTimeout(r, 1500))
      } catch { /* sem banner */ }
      await page.waitForSelector('input[type="email"], input[name="email"], input[autocomplete="email"]', { timeout: 15_000 })
      await page.type('input[type="email"], input[name="email"], input[autocomplete="email"]', email, { delay: 60 })
      await page.waitForSelector('input[type="password"]', { timeout: 5_000 })
      await page.type('input[type="password"]', password, { delay: 60 })
      await page.keyboard.press('Enter')
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20_000 })
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    } else if (streamer === 'crunchyroll') {
      await page.goto('https://sso.crunchyroll.com/login', { waitUntil: 'networkidle2', timeout: 30_000 })
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 6_000 })
        await page.click('#onetrust-accept-btn-handler')
        await new Promise(r => setTimeout(r, 1500))
      } catch { /* sem banner */ }
      await page.waitForSelector('input[name="email"]', { timeout: 10_000 })
      await page.type('input[name="email"]', email, { delay: 60 })
      await page.type('input[name="password"]', password, { delay: 60 })
      await page.keyboard.press('Enter')
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20_000 })
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })

    } else {
      const config = STREAMER_CONFIG[streamer]
      if (config) {
        await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30_000 })
        await page.type(config.emailSelector, email, { delay: 50 })
        if (await page.$(config.passwordSelector)) {
          await page.type(config.passwordSelector, password, { delay: 50 })
        }
        await page.click(config.submitSelector)
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20_000 })
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      } else {
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
      }
    }
  } catch {
    // mantém o browser aberto mesmo com erro — usuário pode logar manualmente
  }
}
