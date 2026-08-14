import { Actor, log } from 'apify';
import { fetchBanks } from './fdic.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { name, state, activeOnly = true, maxResults = 25 } = input;

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const BANK_SEARCH_EVENT = 'bank-search';

const banks = await fetchBanks({
    name,
    state,
    activeOnly,
    maxResults: Math.min(maxResults, 100),
});

for (const bank of banks) {
    await Actor.pushData(bank);
}

await Actor.charge({ eventName: BANK_SEARCH_EVENT });

log.info(`Pushed ${banks.length} bank(s)`);

await Actor.exit();
