const puppeteer = require('puppeteer')

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
}

exports.validateCredential = async (streamer, email, password) => {
  const config = STREAMER_CONFIG[streamer.toLowerCase()]
  if (!config) return false

  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30_000 })
    await page.type(config.emailSelector, email, { delay: 50 })

    const passwordField = await page.$(config.passwordSelector)
    if (passwordField) {
      await page.type(config.passwordSelector, password, { delay: 50 })
    }

    await page.click(config.submitSelector)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15_000 })

    const currentUrl = page.url()
    return currentUrl.includes(config.successIndicator)
  } catch {
    return false
  } finally {
    if (browser) await browser.close()
  }
}
