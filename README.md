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

Mirror-Mirror should work out of the box and keeps everything in the
`run` directory. Sessions are stored in a plaintext JSON-file, 
user data in SQLite and repositories are created in a separate
`repository` directory.

If you want to override any of the application settings have
a look at the `src/app.js` file to see which options are 
available. A basic configuration file would look like this: 

```js
// config.js

export default {
  // your options similar to those found in src/app.js
}
```

In order to run Mirror-Mirror with the your new config file use the
`--config` option. If you saved your config to a file called
`config.js` you’d execute the following command:

```sh
./start.sh --config config.js
```

That’s it :)
