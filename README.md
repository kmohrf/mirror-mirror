# Mirror-Mirror

Mirror-Mirror is a nodejs-based web application that offers an easy
way to synchronize git repositories. It was created because a similar
feature in GitLab was restricted to the Enterprise-Edition and
because I wanted to create a server-side nodejs application for
quite some time.

**NOTE: This software is unmaintained. If you want to take over feel free to contact me or simply fork it.**

## Configuration

Mirror-Mirror should just start via `npm start` or `yarn start` after 
you installed the projects dependencies via

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
a look at the `defaultConfig` constant you’ll find in the
`src/config.js` file to see which options are available. 
A basic configuration file would look like this: 

```js
// config.js

module.exports = {
  // your options similar to those found in src/app.js
}
```

Place the `config.js` file in your working directory to use it or use
the `MIRRORMIRROR_CONFIG` environment variable to override the default
path. `MIRRORMIRROR_CONFIG` must be an absolute path.

That’s it :)
