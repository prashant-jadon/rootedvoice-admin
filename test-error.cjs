const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error('BROWSER ERROR:', msg.text());
            }
        });

        page.on('pageerror', error => {
            console.error('PAGE ERROR:', error.message);
            console.error('STACK:', error.stack);
        });

        console.log("Navigating to login...");
        await page.goto('http://localhost:5173/login');

        // Wait for inputs
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@rootedvoices.com');
        await page.type('input[type="password"]', 'SecurePass123!');

        await Promise.all([
            page.waitForNavigation(),
            page.click('button[type="submit"]')
        ]);
        console.log("Logged in!");

        // Let it settle
        await new Promise(r => setTimeout(r, 2000));

        const paths = ['/evaluations', '/evaluation-feedback', '/calendar', '/reports', '/settings'];
        for (const p of paths) {
            console.log(`\n\n--- Testing ${p} ---`);
            await page.goto(`http://localhost:5173${p}`);
            await new Promise(r => setTimeout(r, 2000));

            // Re-check for any uncaught elements on the page that might have text indicating an error
            const body = await page.evaluate(() => document.body.innerText);
            if (!body || body.trim() === '') {
                console.log(`Empty body detected on ${p}`);
            }
        }

        console.log("Done checking");
    } catch (e) {
        console.error(e);
    } finally {
        if (browser) await browser.close();
    }
})();
