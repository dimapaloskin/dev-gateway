module.exports = {
  host: 'localhost',
  rules: [{
    slug: 'auth',
    pathname: '/api/auth/**',
    dest: 'auth.api.localhost',
    run: 'micro index.js -p 3001',
    cwd: './auth',
    env: {
      SECRET_TOKEN: 'kittens'
    },
    startTimeout: 3000,
    debug: true
  }, {
    slug: 'accounts',
    pathname: '/api/accounts',
    dest: 'accounts.api.localhost',
    method: ['GET', 'POST'],
    run: 'cd ./accounts && micro index.js -p 3002',
    debug: true
  }, {
    pathname: '/api/entries/*',
    method: 'GET',
    dest: 'entries.api.localhost',
    run: 'cd ./entries && micro index.js -p 3003',
    debug: true
  }, {
    pathname: '/api/entries/*',
    method: 'POST',
    dest: 'entries.api.localhost',
    run: 'cd ./add-entry && micro index.js -p 3004',
    debug: true
  }, {
    pathname: '/proxy',
    dest: 'proxy.api.localhost',
    proxy: 'https://first.pong.world/any/path',
    ignore: true
  }, {
    slug: 'bad-proxy',
    pathname: '/api/bad-proxy',
    dest: 'bad-proxy.api.localhost',
    proxy: 'https://bad',
    ignore: true
  }, {
    slug: 'bad-run',
    pathname: '/api/bad-run',
    dest: 'bad-run.api.localhot',
    run: 'echo "Bad"',
    port: 4000,
    ignore: true
  }]
};
