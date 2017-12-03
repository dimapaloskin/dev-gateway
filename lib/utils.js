const getPort = require('listen-port');
const psTree = require('ps-tree');
const compact = require('lodash.compact');
const flatten = require('lodash.flatten');
const match = require('wildcard-match');
const kill = require('tree-kill');
const sleep = require('async-sleep');

const getTree = pid => new Promise((resolve, reject) => {
  psTree(pid, (err, children) => {
    if (err) {
      return reject(err);
    }

    resolve(children);
  });
});

const getPortByPid = rule => {
  let attempts = 0;
  const attempt = async () => {
    if (attempts >= rule.maxGetPortAttempts || 10) {
      throw new Error(`Port for rule ${rule.pathname} does not found`);
    }
    try {
      const children = await getTree(rule.proc.pid);
      const pids = children.map(child => parseInt(child.PID, 10)) || [];
      pids.unshift(rule.proc.pid);

      const ports = await Promise.all(pids.map(p => getPort(p)));
      const normalized = compact(flatten(ports));
      if (!normalized || normalized.length === 0) {
        attempts++;
        await sleep(1000);
        return await attempt(rule.proc.pid);
      }
      return normalized[0];
    } catch (err) {
      throw err;
    }
  };

  return attempt();
};

const findRule = ({ rules, host, port, pathname, method }) => {
  const validRules = rules.filter(rule => {
    const rulePathname = rule.pathname.endsWith('/') ? rule.pathname.slice(0, -1) : rule.pathname;
    const requestPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return (host === rule.dest) || (host === `${rule.dest}:${port}`) || match(rulePathname, requestPathname);
  });

  const findByMethod = validRules.find(rule => {
    return rule.method ? rule.method.includes(method.toLowerCase()) : false;
  });

  return findByMethod;
};

const killPromise = (pid, signal) => {
  return new Promise(resolve => {
    kill(pid, signal, resolve);
  });
};

const fulfill = promise => Promise.resolve(promise)
  .then(result => ({
    resolved: true,
    result
  }), reason => ({
    resolved: false,
    reason
  }));

module.exports = {
  getTree,
  getPortByPid,
  findRule,
  kill: killPromise,
  fulfill
};
