import { rejects } from 'assert';
import { resolve } from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

interface ScrapedData {
    title: string;
    price: string;
    description: string;
    image: string;
}

const scrollPage = async (page: Page) => {
    let previousHeight;
    while (true) {
        // Erhalte die aktuelle Höhe der Seite
        const bodyHandle = await page.$('body');
        const boundingBox = await bodyHandle?.boundingBox();
        await bodyHandle?.dispose();
        if (boundingBox && boundingBox.height !== previousHeight) {
            previousHeight = boundingBox.height;

            // Scrolle nach unten
            await page.evaluate(() => window.scrollBy(0, window.innerHeight));
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            break;
        }
    }
};

(async () => {
    const browser: Browser = await puppeteer.launch({ headless: true });
    const page: Page = await browser.newPage();

    const urlEbike = 'https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/e-bikes-4556?isNavigation=true&isISRL=true&srcType=vertical-browse&srcAdd=4556';

    try {
        await page.goto(urlEbike, { waitUntil: 'networkidle2' });

        // Beispielhafte Cookie-Zustimmung: Identifiziere und klicke auf den Cookie-Zustimmungsbutton
        try {
            await page.click('didomi-notice-agree-button'); // Beispiel-Selektor, anpassen je nach Website
            console.log('Cookies-Zustimmung akzeptiert.');
        } catch (err) {
            console.log('Kein Cookie-Zustimmungsbanner gefunden oder nicht akzeptiert.');
        }

        // Scrolle die Seite nach unten, um alle Elemente zu laden
        await scrollPage(page);

        // Scrape die gesammelten Daten hier
        const scrapedData: ScrapedData[] = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.Box-sc-wfmb7k-0 fyHDKe')); // Anpassen
            return items.map(item => ({
                title: (item.querySelector('.title-selector') as HTMLElement)?.innerText || '',
                price: (item.querySelector('.price-selector') as HTMLElement)?.innerText || '',
                description: (item.querySelector('.description-selector') as HTMLElement)?.innerText || '',
                image: (item.querySelector('.image-selector') as HTMLImageElement)?.src || '',
            }));
        });

        console.log('Gescrapte Daten:', scrapedData);

        // Optional: Screenshot machen, um das Ergebnis zu überprüfen
        await page.screenshot({ path: 'screenshot.png', fullPage: true });

    } catch (error) {
        console.error('Fehler beim Scrapen:', error);
    } finally {
        await browser.close();
    }
})();