// For more information, see https://crawlee.dev/
import { Log, PlaywrightCrawler, Dataset, Configuration } from "crawlee";
import { Actor } from "apify";
import { apartmentsDotComRouter } from "../routes.js";
import dotenv from "dotenv";

dotenv.config();

export const run = async () => {
  await Actor.init();

  // Rideshine service areas
  const baseUrls = [
    "https://www.apartments.com/burbank-ca/",
    "https://www.apartments.com/culver-city-ca/",
    "https://www.apartments.com/el-segundo-ca/",
    "https://www.apartments.com/glendale-ca/",
    "https://www.apartments.com/hollywood-ca/",
    "https://www.apartments.com/long-beach-ca/",
    "https://www.apartments.com/los-angeles-ca/",
    "https://www.apartments.com/marina-del-rey-ca/",
    "https://www.apartments.com/north-hollywood-ca/",
    "https://www.apartments.com/pasadena-ca/",
    "https://www.apartments.com/san-pedro-ca/",
    "https://www.apartments.com/santa-monica-ca/",
    "https://www.apartments.com/sherman-oaks-ca/",
    "https://www.apartments.com/south-pasadena-ca/",
    "https://www.apartments.com/studio-city-ca/",
    "https://www.apartments.com/toluca-lake-ca/",
    "https://www.apartments.com/west-hollywood-ca/",
  ];
  // const pages = new Array(17).fill('').map((_, idx) => `${baseUrl}/${idx+1}`)

  const logger = new Log({
    level: 4,
  });

  const crawler = new PlaywrightCrawler({
    // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
    requestHandler: apartmentsDotComRouter,
    log: logger,
    requestHandlerTimeoutSecs: 600,
    // Comment this option to scrape the full website.
    // maxRequestsPerCrawl: 5
  });

  await crawler.run(baseUrls);

  await Dataset.exportToCSV("rideshine_service_area_apartments");
  await Actor.exit();
}
