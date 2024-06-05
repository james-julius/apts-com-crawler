import { createPlaywrightRouter, Configuration } from 'crawlee';

export const router = createPlaywrightRouter();
// Get the global configuration

const config = Configuration.getGlobalConfig();
// Set the 'persistStateIntervalMillis' option
// of global configuration to 10 seconds
config.set('persistStateIntervalMillis', 10_000);

router.addDefaultHandler(async ({ enqueueLinks, log }) => {
    log.info("Reached new property listing page")
    log.info("Enqueueing property links listed on the page")
    await enqueueLinks({
        label: 'detail',
        selector: 'a.property-link',
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
