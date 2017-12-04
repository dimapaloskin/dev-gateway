# dev-gateway

> Local development cluster with [now path aliases](https://zeit.co/docs/features/path-aliases) syntax support. Allows running multiple microservices as one solid server.

[![Build Status](https://travis-ci.org/dimapaloskin/dev-gateway.svg?branch=master)](https://travis-ci.org/dimapaloskin/dev-gateway)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Greenkeeper badge](https://badges.greenkeeper.io/dimapaloskin/dev-gateway.svg)](https://greenkeeper.io/)

## Installation
```shell
npm install --save-dev dev-gateway
# or
yarn add -D dev-gateway
```

## Usage

At first, you need to create `app.js` file and define configuration:

```js
module.exports = {
  port: 3000,
  host: 'localhost',
  rules: [{
    slug: 'auth',
    pathname: '/api/auth/**',
    dest: 'auth.api.localhost',
    run: 'micro index.js',
    cwd: './auth',
    env: {
      SECRET_TOKEN: 'kittens'
    },
    debug: true
  }, {
    slug: 'accounts',
    pathname: '/api/accounts',
    dest: 'accounts.api.localhost',
    method: ['GET', 'POST'],
    run: 'cd ./accounts && micro index.js',
    debug: true
  }, {
    pathname: '/api/entries/*',
    dest: 'entries.api.localhost',
    run: 'cd ./entries && micro index.js',
    debug: true
  }, {
    pathname: '/proxy',
    dest: 'proxy.api.localhost',
    proxy: 'https://first.pong.world/any/path'
  }]
}
```

The next step is to add a new script to your `package.json`:
```json
{
  "scripts": {
    "dev": "dev-gateway serve app.js"
  }
}
```

Then run:
```sh
npm run dev
```

## Rules

Rules access the following parametres:
- **slug** - slug, just a name of rule
- **pathname** - pathname alias; has similar wildcard syntax to this one [now path aliases](https://zeit.co/docs/features/path-aliases)
- **dest** - destination host. Microservice will be available if you send request directly to the host.
- **method** - string or array. To specify allowed methods.
- **run** - shell command to run your microservice.
- **port** - port used by microservice. Gateway will try to detect opened port if these parametres are not defined.
- **proxy** - url. All requests will be proxied to this url if parameter is defined.
- **debug** - boolean or object (`{ stdout: false, stderr: true}`). Gateway will pipe microservice output to the terminal, if 'debug' is true.
- **env** - the parameter is used to define environment variables for a microservice.
- **logFile** - will pipe stdout and stderr to a specified file.
- **cwd** - rule's working directory
- **maxGetPortAttempts** - number of attempts to obtain a rule's port. Each attempt waits for 1 second. E.g. set
`maxGetPortAttempts` to 30 to wait for 30 seconds before a rule is marked as "not available". Defaults to 10.
- **startTimeout** - timeout (in ms) before start port checking (useful for long starting apps)

## Cli

**Run:**

```shell
dev-gateway serve app.js -p 3000 -h localhost
```

- `-p, --port` - port
- `-h, --host` - host
- `-S, --skip` - skip whole rule by slug
- `-s, --skip-run` - skip running stage by slug (it can be useful if you want run microservice manually, but you still needed requests proxying)

**Extract:**

```shell
dev-gateway extract app.js --dest example.com --output rules.json
```

Will extract current configuration to `rules.json` file

- `-d, --dest` - destination
- `-o, --output` - output file with rules

## In action
Clone this repo and run:

```shell
npm install
npm run example
```

You can check test server in the `test/example` directory.

## Alternatives

- [serve-micro-cluster](https://github.com/tylersnyder/serve-micro-cluster) - Easily start a local cluster of [micro](https://github.com/zeit/micro)-based services using a simple rules.json file. It's like Path Alias on [now](https://zeit.co/now), but for local development.
- [micro-cluster](https://github.com/zeit/micro-cluster) - Run multiple micro servers and a front proxy at a time, with a simple configuration file.

### Author
[Dmitry Pavlovsky](http://palosk.in)
