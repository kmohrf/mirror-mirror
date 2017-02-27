# Mirror-Mirror

Mirror-Mirror is a nodejs-based web application that offers an easy
way to synchronize git repositories. It was created because a similar
feature in GitLab was restricted to the Enterprise-Edition and
because I wanted to create a server-side nodejs application for
quite some time.

## Configuration

Mirror-Mirror should just start via `start.sh` after you installed the
projects dependencies via

```sh
npm install
# or
yarn install
```

If you want to keep your data and not enter everything again, after
you restarted the application you might want to add a config file.
The basic configuration looks like this:

```js
export default {
  db: {
    url: `sqlite://`,
    options: {
      storage: `${process.cwd()}/run/mirror-mirror.sqlite3`
    }
  }
}
```

Check `src/app.js` to find some other options. If you want to use
your config start Mirror-Mirror with the `--config` option. If you
saved your config to a file called `config.js` then you’d execute
the following command

```sh
./start.sh --config config.js
```

That’s it :)
