"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const scrollPage = (page) => __awaiter(void 0, void 0, void 0, function* () {
    let previousHeight;
    while (true) {
        // Erhalte die aktuelle Höhe der Seite
        const bodyHandle = yield page.$('body');
        const boundingBox = yield (bodyHandle === null || bodyHandle === void 0 ? void 0 : bodyHandle.boundingBox());
        yield (bodyHandle === null || bodyHandle === void 0 ? void 0 : bodyHandle.dispose());
        if (boundingBox && boundingBox.height !== previousHeight) {
            previousHeight = boundingBox.height;
            // Scrolle nach unten
            yield page.evaluate(() => window.scrollBy(0, window.innerHeight));
            yield new Promise(resolve => setTimeout(resolve, 3000));
        }
        else {
            break;
        }
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch({ headless: true });
    const page = yield browser.newPage();
    const urlEbike = 'https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz/e-bikes-4556?isNavigation=true&isISRL=true&srcType=vertical-browse&srcAdd=4556';
    try {
        yield page.goto(urlEbike, { waitUntil: 'networkidle0' });
        // Beispielhafte Cookie-Zustimmung: Identifiziere und klicke auf den Cookie-Zustimmungsbutton
        try {
            yield page.click('didomi-notice-agree-button'); // Beispiel-Selektor, anpassen je nach Website
            console.log('Cookies-Zustimmung akzeptiert.');
        }
        catch (err) {
            console.log('Kein Cookie-Zustimmungsbanner gefunden oder nicht akzeptiert.');
        }
        // Scrolle die Seite nach unten, um alle Elemente zu laden
        yield scrollPage(page);
        // Scrape die gesammelten Daten hier
        const scrapedData = yield page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.Box-sc-wfmb7k-0 fyHDKe')); // Anpassen
            return items.map(item => {
                var _a, _b, _c, _d;
                return ({
                    title: ((_a = item.querySelector('.title-selector')) === null || _a === void 0 ? void 0 : _a.innerText) || '',
                    price: ((_b = item.querySelector('.price-selector')) === null || _b === void 0 ? void 0 : _b.innerText) || '',
                    description: ((_c = item.querySelector('.description-selector')) === null || _c === void 0 ? void 0 : _c.innerText) || '',
                    image: ((_d = item.querySelector('.image-selector')) === null || _d === void 0 ? void 0 : _d.src) || '',
                });
            });
        });
        console.log('Gescrapte Daten:', scrapedData);
        // Optional: Screenshot machen, um das Ergebnis zu überprüfen
        yield page.screenshot({ path: 'screenshot.png', fullPage: true });
    }
    catch (error) {
        console.error('Fehler beim Scrapen:', error);
    }
    finally {
        yield browser.close();
    }
}))();
//# sourceMappingURL=index.js.map