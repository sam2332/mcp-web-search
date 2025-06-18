import axios from 'axios';
import * as cheerio from 'cheerio';

async function testSearch() {
  try {
    const response = await axios.get('https://html.duckduckgo.com/html/', {
      params: { 
        q: 'javascript tutorial',
        s: '0',
        dc: '5'
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://duckduckgo.com/',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 15000
    });
    
    console.log('Status:', response.status);
    console.log('Response length:', response.data.length);
    
    const $ = cheerio.load(response.data);
    
    // Debug: see what elements exist
    console.log('.result count:', $('.result').length);
    console.log('.result__title count:', $('.result__title').length);
    console.log('.result__snippet count:', $('.result__snippet').length);
    console.log('article count:', $('article').length);
    
    // Try to find search results
    $('.result').each((i, el) => {
      if (i < 3) {
        const $el = $(el);
        const title = $el.find('.result__title a').text().trim();
        const url = $el.find('.result__title a').attr('href');
        const description = $el.find('.result__snippet').text().trim();
        
        console.log(`Result ${i}:`);
        console.log(`  Title: ${title}`);
        console.log(`  URL: ${url}`);
        console.log(`  Description: ${description}`);
        console.log('---');
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSearch();