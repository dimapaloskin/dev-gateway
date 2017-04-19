module.exports = (options, dest) => {

  if (!dest) {
    throw new Error('--dest is required argument');
  }

  const rules = options.rules.filter(rule => !rule.ignore).map(rule => {

    if (options.host && rule.dest.includes(options.host)) {
      rule.dest = rule.dest.replace(options.host, dest);
    } else {
      if (!rule.dest.endsWith('.')) {
        rule.dest += '.';
      }

      rule.dest += dest;
    }

    const result = {
      dest: rule.dest,
      pathname: rule.pathname
    };

    if (rule.method) {
      result.method = rule.method;
    }

    return result;
  });

  const out = {
    rules
  };

  return out;
};
