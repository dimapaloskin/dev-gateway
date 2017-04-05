module.exports = {
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
    method: 'GET',
    dest: 'entries.api.local.dev',
    run: 'cd ./entries && micro index.js',
    debug: true
  }, {
    pathname: '/api/entries/*',
    method: 'POST',
    dest: 'entries.api.local.dev',
    run: 'cd ./add-entry && micro index.js',
    debug: true
  }, {
    pathname: '/proxy',
    dest: 'proxy.api.local.dev',
    proxy: 'https://first.pong.world/any/path'
  }]
};
