cnrb
====

### Setup

```bash
git clone git@github.com:electroc/cnrb.git
npm install
```

### Development

```bash
npm run dev
```

Will build the project in development mode and start a local webserver running on [localhost:8080](http://localhost:8080/).
Sources are watched and rebuild on changes.
Use a (LiveReload Browser Plugin)[http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions]
to reload browser on changes.

(Run `npm run dev-production` to work in production mode for testing purposes.)

### Build & Release

```bash
npm run deploy
```

Will build in production mode and rsync to remote site defined in configuration.
