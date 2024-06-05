// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, ProxyConfiguration, RequestQueue } from 'crawlee';
import { Actor } from 'apify';
import { router } from './routes.js';


await Actor.init();
'los-angeles-ca/2/'

const baseUrl = 'https://www.apartments.com/los-angeles-ca'

const pages = new Array(17).fill('').map((_, idx) => `${baseUrl}/${idx + 1}`)
const startUrls = ['https://www.apartments.com/los-angeles-ca', ...pages];

const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: router,
    // Comment this option to scrape the full website.
    maxRequestsPerCrawl: 20,
});

await crawler.run(startUrls);

await Actor.exit()