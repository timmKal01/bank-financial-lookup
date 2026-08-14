const BASE_URL = 'https://api.fdic.gov/banks/institutions';

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

    const res = await fetch(url, { headers: { Connection: 'close' } });
    if (!res.ok) {
        throw new Error(`FDIC API request failed: ${res.status} ${res.statusText}`);
    }
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
