import { program } from 'commander';
import scrapers from './scrapers/index.js';


program
    .name('scrape')
    .description("A series of different scrapers you can use")

program.command('scrape')
    .description('Run one of the scrapers available')
    .argument('<scraper>', 'scraper to run')
    .action((str) => {
        return scrapers[str]();
    })

program.parse();