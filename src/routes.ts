import { createPlaywrightRouter, Configuration, sleep } from 'crawlee';
import { getNextPageUrl } from './utils.js';

export const router = createPlaywrightRouter();
// Get the global configuration



router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
    let numPropertiesScraped = 0;
    const propertyDetailLinks: string[] = []
    const hrefsScraped: { [key: string]: boolean } = {}

    // Apartments.com runs each page navigation with JS. So we have to go from page to page within the same request
    // otherwise we see cryptic HTTP2 errors.
    while (true) {
        const currentUrl = page.url();
        const propertyLinksSelector = 'header.placard-header div.property-information a.property-link'
        log.info(`Scraping listing page: ${currentUrl}`)

        const propertyLinks = (await page.locator(propertyLinksSelector).all())
        for (const link of propertyLinks) {
            numPropertiesScraped++
            log.info(`Scraping property #${numPropertiesScraped}`)

            const linkHref = await link.getAttribute('href')

            if (linkHref && linkHref in hrefsScraped) {
                log.error(`Scraping duplicate href ${linkHref}`)

            } else if (linkHref) {
                hrefsScraped[linkHref] = true
                propertyDetailLinks.push(linkHref)
            }
        }

        if (await page.isVisible('a.next')) {
            const nextPageUrl = getNextPageUrl(currentUrl);
            log.info(`Navigating to next page: ${nextPageUrl}`)

            await page.locator('a.next').click()
            await sleep(5000)
        } else {
            break;
        }
    }
    // Enqueue every property detail page and pass them into the detail request handler below
    await enqueueLinks({
        label: 'detail',
        urls: propertyDetailLinks
    })
});


router.addHandler('detail', async ({ request, page, log, pushData }) => {
    const title = await page.title();
    const propertyAddress = (await page.locator('#propertyAddressRow > *').allInnerTexts()).join(', ');
    const propertyPhoneNumber = (await page.locator('.phoneNumber > a').getAttribute('href'))?.split(':')?.[1] || null
    const rentInfo = {
        label: await page.locator('p.rentInfoLabel').nth(0).innerText(),
        detail: await page.locator('p.rentInfoDetail').nth(0).innerText(),
    }
    log.info(`${title}`, { url: request.loadedUrl });
    const hasPropertyWebsite = await page.isVisible('a[title="View Property Website"]')
    let propertyWebsite = 'Not Provided'
    if (hasPropertyWebsite) {
        const propertyWebsiteLocator = await page.locator('a[title="View Property Website"]')
        propertyWebsite = await propertyWebsiteLocator.getAttribute('href') || 'Not Provided'
    }
    await pushData({
        url: request.loadedUrl,
        title,
        rentInfo,
        propertyAddress,
        propertyPhoneNumber,
        propertyWebsite
    });
});
