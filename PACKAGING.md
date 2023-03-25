# Packaging instructions

## Firefox

```
git clone https://github.com/rosmanov/chrome-bee.git
cd chrome-bee
npm install
npm run build
npm run pack-firefox
```

After that, `web-ext-artifacts` directory should contain a `bee-firefox-{version}.zip` file.

## Chrome

**Note, Chrome package requires a bee.pem private key which is only available on developer's machine

The same as for Firefox, but `npm run pack-chrome` instead of `npm run pack-firefox`.
