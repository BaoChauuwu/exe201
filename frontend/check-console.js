import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Users\\PC\\.cache\\puppeteer\\chrome\\win64-149.0.7827.22\\chrome-win64\\chrome.exe'
  });
  const page = await browser.newPage();
  
  // Lắng nghe lỗi console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[PAGE ERROR]: ${msg.text()}`);
    } else {
      console.log(`[PAGE LOG]: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`[PAGE EXCEPTION]: ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED]: ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  } catch (err) {
    console.log(`Goto error: ${err.message}`);
  }
  
  await browser.close();
})();
