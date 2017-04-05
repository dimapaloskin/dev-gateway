# dev-gateway

> Local development cluster with [now path aliases](https://zeit.co/docs/features/path-aliases) syntax support. Allows running multiple microservices as one solid server.

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
    pathname: '/api/auth/**',
    dest: 'auth.api.local.dev',
    run: 'cd ./auth && micro index.js',
    env: {
      SECRET_TOKEN: 'kittens'
    },
    debug: true
  }, {
    pathname: '/api/accounts',
    dest: 'accounts.api.local.dev',
    method: ['GET', 'POST'],
    run: 'cd ./accounts && micro index.js',
    debug: true
  }, {
    pathname: '/api/entries/*',
    dest: 'entries.api.local.dev',
    run: 'cd ./entries && micro index.js',
    debug: true
  }, {
    pathname: '/proxy',
    dest: 'proxy.api.local.dev',
    proxy: 'https://first.pong.world/any/path'
  }]
}
```

The next step is to add a new script to your `package.json`:
```json
{
  "scripts": {
    "dev": "dev-gateway"
  }
}
```

Then run:
```sh
npm run dev
```

## Rules

Rules access the following parametres:
- **pathname** - pathname alias; has similar wildcard syntax to this one [now path aliases](https://zeit.co/docs/features/path-aliases)
- **dest** - destination host. Microservice will be available if you send request directly to the host.
- **method** - string or array. To specify allowed methods.
- **run** - shell command to run your microservice.
- **port** - port used by microservice. Gateway will try to detect opened port if these parametres are not defined.
- **proxy** - url. All requests will be proxied to this url if parameter is defined.
- **debug** - boolean or object (`{ stdout: false, stderr: true}`). Gateway will pipe microservice output to the terminal, if 'debug' is true.
- **env** - the parameter is used to define environment variables for a microservice.
- **logFile** - will pipe stdout and stderr to a specified file.

## Cli

```shell
dev-gateway app.js -p 3000 -h localhost
```

- `-p, --port` - port
- `-h, --host` - host

## In action
Clone this repo and run:

```shell
npm install
npm run example
```

You can check test server in the `test/example` directory.

### Author
[Dmitry Pavlovsky](http://palosk.in)
