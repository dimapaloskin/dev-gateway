const { send } = require('micro');

module.exports = (req, res) => {
  let message = 'create entry';
  let statusCode = 200;
  if (req.method.toLowerCase() !== 'post') {
    message = 'method is not allowed';
    statusCode = 500;
  }

  send(res, statusCode, { message });
};
