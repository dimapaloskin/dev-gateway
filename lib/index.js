const { exec } = require('child_process');
const { createWriteStream } = require('fs');
const { createServer } = require('http');
const { parse } = require('url');
const { resolve } = require('path');
const { createProxy } = require('http-proxy');
const cloneDeep = require('lodash.clonedeep');
const exitHook = require('async-exit-hook');

const { getPortByPid, findRule, kill, fulfill } = require('./utils');

const allHTTPMethods = ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE'];

let isShuttingDown = false;
const run = async (rule, cwd) => {
  cwd = cwd || process.cwd();

  const proc = exec(rule.run, {
    env: Object.assign(process.env, rule.env || {}),
    cwd: resolve(cwd)
  }, (err) => {
    if (err && !isShuttingDown)  {
      console.error(rule.pathname, err);
    }
  });

  if (rule.debug) {
    if (typeof rule.debug === 'boolean' || (typeof rule.debug === 'object' && rule.debug.stdout === true)) {
      proc.stdout.pipe(process.stdout);
    }

    if (typeof rule.debug === 'boolean' || (typeof rule.debug === 'object' && rule.debug.stderr === true)) {
      proc.stderr.pipe(process.stderr);
    }
  }

  if (rule.logFile) {
    const writeStream = createWriteStream(rule.logFile);
    proc.stdout.pipe(writeStream);
    proc.stderr.pipe(writeStream);
    rule.writeStream = writeStream;
  }

  try {
    rule.proc = proc;
    rule.port = rule.port || await getPortByPid(rule);
    return rule;
  } catch (err) {
    throw err;
  }

};

const createRequestListener = (rules, options, proxy) => {
  return (req, res) => {
    const { pathname } = parse(req.url);
    const rule = findRule({
      rules,
      host: req.headers.host,
      port: options.port,
      pathname,
      method: req.method
    });

    if (!rule) {
      res.writeHead(404);
      return res.end('Not Found');
    }

    if (!rule.port) {
      res.writeHead(503);
      return res.end('Service Unavailable');
    }

    const host = options.host || 'localhost';

    if (rule.proxy) {
      req.headers.host = parse(rule.proxy).hostname;
    }

    const target = rule.proxy || {
      host,
      port: rule.port
    };

    proxy.web(req, res, {
      target
    }, err => {
      console.error(rule.pathname, err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });

  };
};

module.exports = options => {
  const rules = cloneDeep(options.rules);

  const killChilds = async ({ exitParent }) => {
    isShuttingDown = true;
    const results = [];
    for (const rule of rules) {
      if (rule.writeStream) {
        rule.writeStream.end();
      }

      if (rule.proc) {
        results.push(kill(rule.proc.pid, 'SIGINT'))
      }
    }

    await Promise.all(results);
    if (exitParent === undefined || exitParent !== false) {
      process.exit();
    }
  };

  exitHook(async () => {
    await killChilds();
  });

  const proxy = createProxy();
  const listener = createRequestListener(rules, options, proxy);
  const server = createServer(listener);

  options.port = options.port || 3000;
  server.listen(options.port, () => {
    console.log(`\n  Listen http://${options.host}:${options.port} \n`);
  });

  const promises = [];
  for (const rule of rules) {
    if (!rule.method) {
      rule.method = allHTTPMethods;
    }

    if (!Array.isArray(rule.method)) {
      rule.method = [rule.method];
    }

    rule.method = rule.method.map(method => method.toLowerCase());

    if (rule.run) {
      const promise = run(rule, options.cwd);
      promises.push(fulfill(promise));
    } else if (rule.proxy && !rule.port) {
      const isSecure = rule.proxy.startsWith('https://');
      rule.port = isSecure ? 443 : 80;
    }
  }

  Promise.all(promises)
    .then(results => {
      results.forEach(result => {
        if (result.resolved) {
          console.log(`   Rule for ${result.result.pathname} successfully started on ${result.result.port} port`);
        } else {
          console.error(result.reason);
        }
      });
    });

  return {
    killChilds
  };
};
