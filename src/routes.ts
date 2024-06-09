import { createPlaywrightRouter, sleep } from "crawlee";
import { getNextPageUrl } from "./utils.js";
import { error } from "console";

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
  const title = await page.title();
  log.info(`[Default Handler] Scraping: ${title}`, { url: request.loadedUrl });
  let numPropertiesScraped = 0;
  const propertyDetailLinks: string[] = [];

  const neighbourHoodRegex = /(?<=https:\/\/www\.apartments\.com\/)(.*)(?=\/)/;
  const neighbourhood = neighbourHoodRegex.exec(page.url())?.[0] || "Unknown";
  log.info(`Enqueuing Neighbourhood: ${neighbourhood}`);

  // Enable Apartments filter
  try {
    log.info("Enabling apartment filter");
    await page.locator("button#PropertyType-1").first().dispatchEvent("click");
    log.info("Succeeded enabling apartment filter");
  } catch (e) {
    log.error(
      `Error occurred enabling apartment filter for neighbourhood: ${neighbourhood}.`,
      error,
    );
    return;
  }

  // Apartments.com runs each page navigation with JS. So we have to go from page to page within the same request
  // otherwise we see cryptic HTTP2 errors.
  while (true) {
    const currentUrl = page.url();
    const propertyLinksSelector = "a.property-link";
    log.info(`Scraping listing page: ${currentUrl}`);
    const propertiesToScrape: { [key: string]: boolean } = {};

    const propertyLinks = await page.locator(propertyLinksSelector).all();
    for (const link of propertyLinks) {
      const linkHref = await link.getAttribute("href");
      if (linkHref && linkHref in propertiesToScrape) {
        log.debug(`Duplicate href found: ${linkHref}`);
        continue;
      } else if (linkHref) {
        propertiesToScrape[linkHref] = true;
        propertyDetailLinks.push(linkHref);
      }
    }
    const numPropertiesToScrape = Object.keys(propertiesToScrape).length + 1;
    numPropertiesScraped += numPropertiesScraped;
    log.info(`Found ${numPropertiesToScrape} to scrape`);
    if (await page.isVisible("a.next")) {
      const nextPageUrl = getNextPageUrl(currentUrl);
      log.info(`Navigating to next page: ${nextPageUrl}`);
      log.info("Clicking next page");
      await page.locator("a.next").click({ force: true });
      log.info("Sleeping for 5 seconds");
      await sleep(5000);
    } else {
      break;
    }
  }
  // Enqueue every property detail page and pass them into the detail request handler below
  await enqueueLinks({
    label: "detail",
    urls: propertyDetailLinks,
    userData: {
      neighbourhood,
    },
  });
});

router.addHandler("detail", async ({ request, page, log, pushData }) => {
  const title = await page.title();
  log.info(`[Detail Handler] Scraping: ${title}`, { url: request.loadedUrl });
  const propertyAddress = (
    await page.locator("#propertyAddressRow > *").allInnerTexts()
  ).join(", ");
  let propertyPhoneNumber = null;
  if (await page.locator(".phoneNumber > a").isVisible()) {
    propertyPhoneNumber =
      (await page.locator(".phoneNumber > a").getAttribute("href"))?.split(
        ":",
      )?.[1] || null;
  }
  const rentInfo = {
    label: await page.locator("p.rentInfoLabel").nth(0).innerText(),
    detail: await page.locator("p.rentInfoDetail").nth(0).innerText(),
  };
  const hasPropertyWebsite = await page.isVisible(
    'a[title="View Property Website"]',
  );
  let propertyWebsite = "Not Provided";
  if (hasPropertyWebsite) {
    const propertyWebsiteLocator = await page.locator(
      'a[title="View Property Website"]',
    );
    propertyWebsite =
      (await propertyWebsiteLocator.getAttribute("href")) || "Not Provided";
  }
  await pushData({
    url: request.loadedUrl,
    title,
    rentInfo,
    neighbourhood: request.userData.neighbourhood,
    propertyAddress,
    propertyPhoneNumber,
    propertyWebsite,
  });
});
