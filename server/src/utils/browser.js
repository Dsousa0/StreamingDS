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

module.exports = { launchBrowser, UA }
