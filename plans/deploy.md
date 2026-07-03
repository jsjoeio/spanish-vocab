# Deployment

Deploy at **tools.jsjoe.io/vocab-size** on Vercel (same stack as jsjoe.io). DNS is managed in [Cloudflare](https://dash.cloudflare.com/86765c5389a3d549e0f57eb4cf2e7a1b/jsjoe.io/dns/records).

## Implemented in repo

- Astro `base: '/vocab-size'` with `trailingSlash: 'always'`
- `vercel.json` rewrites map `/vocab-size/*` → static build output; `/` redirects to `/vocab-size/`
- README deploy badge + live URL
- GitHub repo homepage → `https://tools.jsjoe.io/vocab-size`

## One-time setup (manual)

### 1. Vercel — link GitHub project

```bash
npx vercel login
npx vercel link          # pick jsjoeio account, project name: spanish-vocab
```

Or in the [Vercel dashboard](https://vercel.com/new): import `jsjoeio/spanish-vocab`, framework = Astro, build = `bun run build`, output = `dist`.

### 2. Vercel — custom domain

In project **Settings → Domains**, add `tools.jsjoe.io`.

### 3. Cloudflare — DNS record

| Type  | Name  | Content              | Proxy |
|-------|-------|----------------------|-------|
| CNAME | tools | `cname.vercel-dns.com` | DNS only (grey cloud) recommended |

Vercel will issue TLS once DNS propagates.

### 4. Verify

- https://tools.jsjoe.io/vocab-size/ loads the test
- https://tools.jsjoe.io/ redirects to `/vocab-size/`
- README badge shows deployment status after first production deploy