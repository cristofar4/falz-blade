# falz-blade

Two separate static websites, each in its own folder. Neither needs a build step.

| Folder | Site |
| --- | --- |
| [`monroe/`](monroe/) | **MONROE Modern Grooming**: premium barber studio in Lagos. See [`monroe/README.md`](monroe/README.md). |
| [`logistics/`](logistics/) | **ARRO Logistics**: road, air and sea freight with instant estimates and tracking. See [`logistics/README.md`](logistics/README.md). |

The root `index.html` is a small page that links to both.

## Run a site

Serve the repository and open the folder you want:

```bash
python3 -m http.server 8080
```

- MONROE: http://localhost:8080/monroe/
- ARRO Logistics: http://localhost:8080/logistics/

Each folder can also be deployed on its own: point your host (Vercel, Netlify, Cloudflare Pages) at that folder as the root directory.
