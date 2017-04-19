const { exec } = require('child_process');
const { resolve } = require('path');
const inquirer = require('inquirer');
const cloneDeep = require('lodash.clonedeep');
const { fulfill } = require('./utils');

const run = async (rule, cwd) => {
  cwd = cwd || process.cwd();
  cwd = resolve(cwd);

  if (rule.cwd) {
    cwd = resolve(cwd, rule.cwd);
  }

  return new Promise((resolve, reject) => {
    const proc = exec(rule.deploy, {
      cwd
    }, (err, stdout, stderr) => {
      if (err) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return reject({
          rule,
          err,
          stderr
        });
      }

      resolve({
        rule,
        stdout
      });
    });

    proc.stdout.pipe(process.stdout);
    proc.stdin.pipe(process.stdin);
    proc.stderr.pipe(process.stderr);
  });
};

module.exports = async (options, selectAll) => {
  const rules = cloneDeep(options.rules);
  const deploys = rules
    .filter(rule => rule.deploy)
    .map(rule => {
      rule.name = ` ${rule.dest} - ${rule.pathname}`;

      if (selectAll) {
        rule.checked = true;
      }

      return rule;
    });

  const { selectedDeployNames } = await inquirer.prompt({
    type: 'checkbox',
    message: 'Choose rules for deploy',
    name: 'selectedDeployNames',
    choices: deploys
  });

  const selectedRules = deploys.filter(rule => {
    return selectedDeployNames.includes(rule.name);
  });

  const promises = [];
  for (const rule of selectedRules) {
    const promise = run(rule, options.cwd);
    promises.push(fulfill(promise));
  }

  const results = await Promise.all(promises)

  return results;
};
