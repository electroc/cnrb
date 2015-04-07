cnrb
====


### Setup & VM Management

*Preparation:* Ready to use `git`, `ssh` and `vagrant`.

```bash
# clone project to local folder
git clone git@github.com:electroc/cnrb.git

# bring up vm
vagrant up

# enter vm
vagrant ssh

# suspend vm
vagrant suspend

# power off vm
vagrant halt
```

### Development (within VM)

```bash
npm run dev
```

Will build the project in development mode and start a webserver listening on [localhost:8080](http://localhost:8080/).
When startet from within vagrant, you can reach the webserver at [localhost:8888](http://localhost:8888).
Sources are watched and rebuild on changes.
Use a [LiveReload Browser Plugin](http://feedback.livereload.com/knowledgebase/articles/86242-how-do-i-install-and-use-the-browser-extensions)
to reload browser on changes.

### Build & Release (within VM)

```bash
npm run deploy
```

Will build in production mode and rsync to remote site defined in configuration.
