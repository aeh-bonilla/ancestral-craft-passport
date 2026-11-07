<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Protected pages live under the managed `_authenticated` layout; Google login returns to a public auth page before navigating to the intended protected destination.
- Promoter profiles use owner-only database access and private photo storage; professional titles are descriptive data, never authorization roles.
- Internationalization uses a per-render i18next instance with Spanish SSR defaults and browser-only preference restoration; translated labels never replace stored profile, filter, contract or hash values.
- Artisan banking details are transient form inputs; keep only salted domain-separated SHA-256 hashes in the mock catalog, never raw bank/account/CLABE values, because the current artisan flow is not a payment backend.
