// For more information, see https://crawlee.dev/
import { Log, PlaywrightCrawler, ProxyConfiguration, RequestQueue } from 'crawlee';
import { firefox } from 'playwright';
import { Actor } from 'apify';
import { router } from './routes.js';


await Actor.init();

const baseUrl = 'https://www.apartments.com/los-angeles-ca/'

const pages = new Array(17).fill('').map((_, idx) => `${baseUrl}/${idx+1}`)

const logger = new Log({
    level: 4
});

const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    log: logger,
    useSessionPool: false,
    // Comment this option to scrape the full website.
    // maxRequestsPerCrawl: 2,
});

await crawler.run([baseUrl]);

await Actor.exit()