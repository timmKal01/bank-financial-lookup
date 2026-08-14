# Bank Financial Lookup — FDIC Institution Data

Look up FDIC-insured banks by name or state and get total assets,
deposits, equity, charter type, and status — straight from FDIC's own
institution database.

Built for lenders, fintechs doing partner due diligence, journalists,
and anyone doing competitive banking research who needs a bank's basic
financial profile without digging through call reports by hand.

## Input

```json
{
  "name": "Wells Fargo",
  "state": "",
  "activeOnly": true,
  "maxResults": 25
}
```

| Field | Type | Description |
|---|---|---|
| `name` | string (optional) | Full or partial bank name to search for. |
| `state` | string (optional) | Two-letter US state code to limit to banks headquartered there. |
| `activeOnly` | boolean | Exclude closed, merged, or renamed institutions. Default `true`. |
| `maxResults` | number | Max banks to return, largest total assets first. Default `25`, max `100`. |

Leave both `name` and `state` blank to get the largest FDIC-insured
banks nationwide by total assets.

## Output

One record per bank:

```json
{
  "name": "Wells Fargo Bank, National Association",
  "cert": 3511,
  "city": "Sioux Falls",
  "state": "SD",
  "zip": "57104",
  "active": true,
  "bankClass": "N",
  "charterType": "1",
  "establishedDate": "01/01/1870",
  "website": "www.wellsfargo.com",
  "totalAssetsThousandsUsd": 1852239000,
  "totalDepositsThousandsUsd": 1516982000,
  "totalEquityThousandsUsd": 173016000,
  "asOfDate": "03/31/2026"
}
```

Asset/deposit/equity figures are in **thousands of USD**, matching
FDIC's own reporting convention — divide by 1,000,000 for billions.

A search with no matches returns no items but is still billed once for
the search.

## How it works

Direct calls to the official [FDIC BankFind
API](https://banks.data.fdic.gov/docs/) (`api.fdic.gov`) — no proxy, no
key, no scraping. Public U.S. government data, drawn from banks'
quarterly call reports (`asOfDate` shows how current the financials
are).

## Pricing note

Billed per **search**, not per bank returned — one charge whether the
search returns 0 banks or 100.

## Related products

- [Consumer Complaint Tracker](https://github.com/timmKal01/consumer-complaint-tracker) — new CFPB complaints against these same institutions
