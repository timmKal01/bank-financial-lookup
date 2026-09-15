const BASE_URL = 'https://api.fdic.gov/banks/institutions';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' }, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`FDIC API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`FDIC API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

export async function fetchBanks({ name, state, activeOnly, maxResults }) {
    const filterParts = [];
    if (state) filterParts.push(`STALP:${state.toUpperCase()}`);
    if (activeOnly) filterParts.push('ACTIVE:1');

    const url = new URL(BASE_URL);
    if (name) url.searchParams.set('search', `NAME:${name}`);
    if (filterParts.length > 0) url.searchParams.set('filters', filterParts.join(' AND '));
    url.searchParams.set(
        'fields',
        'NAME,CERT,ASSET,DEP,EQ,CITY,STALP,ZIP,ACTIVE,BKCLASS,CHARTER,ESTYMD,WEBADDR,REPDTE',
    );
    url.searchParams.set('sort_by', 'ASSET');
    url.searchParams.set('sort_order', 'DESC');
    url.searchParams.set('limit', String(maxResults));
    url.searchParams.set('format', 'json');

    const res = await fetchWithRetry(url);
    const body = await res.json();
    const rows = body.data ?? [];

    return rows.map(({ data: b }) => ({
        name: b.NAME,
        cert: b.CERT,
        city: b.CITY,
        state: b.STALP,
        zip: b.ZIP,
        active: b.ACTIVE === 1,
        bankClass: b.BKCLASS,
        charterType: b.CHARTER,
        establishedDate: b.ESTYMD,
        website: b.WEBADDR || null,
        totalAssetsThousandsUsd: b.ASSET ?? null,
        totalDepositsThousandsUsd: b.DEP ?? null,
        totalEquityThousandsUsd: b.EQ != null ? Number(b.EQ) : null,
        asOfDate: b.REPDTE,
    }));
}
