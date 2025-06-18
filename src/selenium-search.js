const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

async function duckDuckGoSearch(query, limit = 5) {
  let driver = await new Builder().forBrowser('chrome').build();
  try {
    await driver.get('https://duckduckgo.com/');
    await driver.findElement(By.name('q')).sendKeys(query, '\n');
    await driver.wait(until.elementLocated(By.css('.result')), 10000);

    let results = [];
    let elements = await driver.findElements(By.css('.result'));
    for (let i = 0; i < Math.min(elements.length, limit); i++) {
      let el = elements[i];
      let title = await el.findElement(By.css('.result__title a')).getText();
      let url = await el.findElement(By.css('.result__title a')).getAttribute('href');
      let desc = '';
      try {
        desc = await el.findElement(By.css('.result__snippet')).getText();
      } catch {}
      results.push({ title, url, description: desc });
    }
    return results;
  } finally {
    await driver.quit();
  }
}

// If run directly, print results
if (require.main === module) {
  const query = process.argv[2] || 'javascript tutorial';
  const limit = parseInt(process.argv[3] || '3', 10);
  duckDuckGoSearch(query, limit).then(results => {
    console.log(JSON.stringify(results, null, 2));
  }).catch(err => {
    console.error('Selenium search error:', err);
    process.exit(1);
  });
}

module.exports = { duckDuckGoSearch };
