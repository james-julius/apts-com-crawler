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
    log.info(`${title}`, { url: request.loadedUrl });

    await pushData({
        url: request.loadedUrl,
        title,
    });
});
