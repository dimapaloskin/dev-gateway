const getPort = require('listen-port');
const psTree = require('ps-tree');
const compact = require('lodash.compact');
const flatten = require('lodash.flatten');
const match = require('wildcard-match');
const kill = require('tree-kill')

const getTree = pid => new Promise((resolve, reject) => {
  psTree(pid, (err, children) => {
    if (err) {
      return reject(err);
    }

    resolve(children);
  });
});

const getPortByPid = async pid => {
  try {
    const children = await getTree(pid);
    const pids = children.map(child => parseInt(child.PID, 10)) || [];
    pids.unshift(pid);

    const ports = await Promise.all(pids.map(p => getPort(p)));
    const normalized = compact(flatten(ports));
    if (!normalized || normalized.length === 0) {
      return await getPortByPid(pid);
    }
    return normalized[0];
  } catch (err) {
    throw err;
  }
};

const findRule = ({ rules, host, port, pathname, method }) => {
  const validRules = rules.filter(rule => {
    const rulePathname = rule.pathname.endsWith('/') ? rule.pathname.slice(0, -1) : rule.pathname;
    const requestPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return (host === rule.dest)  || (host === `${rule.dest}:${port}`) || match(rulePathname, requestPathname);
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

module.exports = {
  getTree,
  getPortByPid,
  findRule,
  kill: killPromise
};
