import { createPlaywrightRouter, Configuration, sleep } from 'crawlee';
import { getNextPageUrl } from './utils.js';

export const router = createPlaywrightRouter();
// Get the global configuration



router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
    let numPropertiesScraped = 0;
    const hrefsScraped: { [key: string]: boolean } = {}
    while (true) {
        const currentUrl = page.url();
        log.info(`Scraping listing page: ${currentUrl}`)

        const propertyLinks = (await page.locator('header.placard-header div.property-information a.property-link').all())
        for (const link of propertyLinks) {
            numPropertiesScraped++
            const linkHref = await link.getAttribute('href')
            if (linkHref && linkHref in hrefsScraped) {
                log.error(`Scraping duplicate href ${linkHref}`)
            } else if (linkHref) {
                hrefsScraped[linkHref] = true
            }
            log.info(`Scraping property #${numPropertiesScraped} - href:${linkHref}`)
        }
        await enqueueLinks({
            label: 'detail',
            selector: 'div.property-info > div.content-wrapper > a.property-link',
        })
        if (await page.isVisible('a.next')) {
            const nextPageUrl = getNextPageUrl(currentUrl);
            log.info(`Navigating to next page: ${nextPageUrl}`)
            await page.locator('a.next').click()
            await sleep(5000)
        } else {
            break;
        }
    }
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
