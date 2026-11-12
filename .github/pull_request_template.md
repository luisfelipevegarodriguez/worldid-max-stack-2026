## Qué cambia

<!-- Una frase. Si el diff no cabe en esa frase, pártelo en varios PRs. -->

## Cómo se verificó

Comandos ejecutados en la raíz (GitHub Actions de esta cuenta no arranca por facturación; el badge no cuenta):

- [ ] `pnpm install` (CI y Vercel usan `pnpm install --frozen-lockfile`)
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`

Pega debajo la salida relevante, sin secretos.

## Checklist

- [ ] El PR es pequeño y trata un solo tema
- [ ] No hay secretos, `.env`, claves, tokens ni URLs con credenciales
- [ ] Sigue en Vercel Hobby, una sola región y sin servicios de pago
- [ ] Los pagos siguen sin liquidación (`settled: false`), o este PR dice de forma explícita que los activa
- [ ] No se da el deploy por hecho ni se cierra el issue #1 desde un script
