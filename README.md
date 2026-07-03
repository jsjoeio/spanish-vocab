# Spanish Vocabulary Estimator

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/spanish-vocab)](https://tools.jsjoe.io/vocab-size/)

A free, open-source web tool to estimate your Spanish vocabulary size. Inspired by tools like Lenguia and SpeakZy, but transparent and customizable.

**Live:** [tools.jsjoe.io/vocab-size](https://tools.jsjoe.io/vocab-size/)

## Status

Client-side vocabulary test using a rioplatense parenting frequency list (YouTube subtitles). Stratified band sampling estimates vocabulary size with CEFR level bands.

## Development

Requires [Bun](https://bun.sh/).

```bash
bun install
bun run dev
```

Open [http://localhost:4321/vocab-size/](http://localhost:4321/vocab-size/) in your browser.

## Deployment

Hosted on [Vercel](https://vercel.com) at `tools.jsjoe.io/vocab-size`. The Astro `base` path is `/vocab-size`; `vercel.json` rewrites map that prefix to the static build output.

### DNS (Cloudflare)

Point the `tools` subdomain at Vercel:

| Type  | Name  | Content              |
|-------|-------|----------------------|
| CNAME | tools | `cname.vercel-dns.com` |

Then add `tools.jsjoe.io` as a custom domain in the Vercel project settings.

## License

MIT