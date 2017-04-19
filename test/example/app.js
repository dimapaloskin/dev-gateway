module.exports = {
  host: 'localhost',
  rules: [{
    pathname: '/api/auth/**',
    dest: 'auth.api.localhost',
    run: 'cd ./auth && micro index.js',
    env: {
      SECRET_TOKEN: 'kittens'
    },
    debug: true
  }, {
    pathname: '/api/accounts',
    dest: 'accounts.api.localhost',
    method: ['GET', 'POST'],
    run: 'cd ./accounts && micro index.js',
    debug: true
  }, {
    pathname: '/api/entries/*',
    method: 'GET',
    dest: 'entries.api.localhost',
    run: 'cd ./entries && micro index.js',
    debug: true
  }, {
    pathname: '/api/entries/*',
    method: 'POST',
    dest: 'entries.api.localhost',
    run: 'cd ./add-entry && micro index.js',
    debug: true
  }, {
    pathname: '/proxy',
    dest: 'proxy.api.localhost',
    proxy: 'https://first.pong.world/any/path',
    ignore: true
  }]
};
