// For more information, see https://crawlee.dev/
import { Log, PlaywrightCrawler, ProxyConfiguration, RequestQueue } from 'crawlee';
import { firefox } from 'playwright';
import { Actor } from 'apify';
import { router } from './routes.js';


await Actor.init();

const baseUrl = 'https://www.apartments.com/los-angeles-ca/'

// const pages = new Array(17).fill('').map((_, idx) => `${baseUrl.split('?')[0]}?${idx + 1}${baseUrl.split('?')[1]}`)
// const startUrls = ['https://www.apartments.com/los-angeles-ca', ...pages];

const logger = new Log({
    level: 3
});

const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    log: logger,
    useSessionPool: false,
    navigationTimeoutSecs: 2,
    // Comment this option to scrape the full website.
    // maxRequestsPerCrawl: 2,
});

await crawler.run([baseUrl]);

await Actor.exit()