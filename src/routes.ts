import { createPlaywrightRouter } from 'crawlee';

export const router = createPlaywrightRouter();

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
    const propertyAddress = (await page.locator('#propertyAddressRow > *').allTextContents()).join(', ');
    const propertyPhoneNumber = page.locator('.phoneNumber')
    const rentInfo = {
        label: page.locator('.rentInfoLabel'),
        detail: page.locator('.rentInfoDetail'),
    }
    log.info(`${title}`, { url: request.loadedUrl });
    const propertyWebsite = page.locator('a[title="View Property Website"]').textContent()
    await pushData({
        url: request.loadedUrl,
        title,
        rentInfo,
        propertyAddress,
        propertyPhoneNumber,
        propertyWebsite
    });
});
