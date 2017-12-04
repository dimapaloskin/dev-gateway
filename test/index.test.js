import test from 'ava';
import rq from 'request-promise';
import getPort from 'get-port';
import fixtures from './example/fixtures';
import { devGateway } from './../';
import app from './example/app';

const options = Object.assign({
  cwd: process.cwd() + '/test/example',
  host: 'localhost'
}, app);

options.rules = options.rules.map(rule => {
  rule.debug = false;
  return rule;
});

let gateway;
let port;
test.before(async () => {
  port = await getPort();
  options.port = port;
  gateway = devGateway(options);
  await gateway.result;
});

test.after.always(async () => {
  await gateway.killChilds({ exitParent: false });
});

test('should match double asterisk wildcard and use passed environment variable', async t => {
  const url = `http://localhost:${port}/api/auth/me/please/_`;
  const response = await rq({
    method: 'GET',
    json: true,
    url
  });

  t.deepEqual(response, { secret: 'kittens' })
});

test('should match one asterisk pattern', async t => {
  const url = `http://localhost:${port}/api/entries/hello`;
  const response = await rq({
    method: 'GET',
    json: true,
    url
  });

  t.deepEqual(response, fixtures.entries);
});

test('should match exact pathname', async t => {
  const url = `http://localhost:${port}/api/accounts`;
  const response = await rq({
    method: 'GET',
    json: true,
    url
  });

  t.deepEqual(response, fixtures.accounts);
});

// This test use external resource. Internet connection required
test('should works with proxy', async t => {
  const url = `http://localhost:${port}/proxy`;
  const response = await rq({
    method: 'GET',
    url
  });

  t.is(response, 'First. Url: /any/path/proxy');
});

test('should match rule by hostname', async t => {
  const url =`http://127.0.0.1:${port}/`;
  const response = await rq({
    method: 'GET',
    url,
    json: true,
    headers: {
      host: `accounts.api.localhost:${port}`
    }
  });

  t.deepEqual(response, fixtures.accounts);
});

test('should choose correct microservice based on request method', async t => {
  const url = `http://localhost:${port}/api/entries/test`;
  const response = await rq({
    method: 'POST',
    json: true,
    url
  });

  t.deepEqual(response, { message: 'create entry' });
});

test('should send 404 if url is not matched', async t => {
  const url = `http://localhost:${port}/api/entries/test/404`;
  const request = rq({
    method: 'GET',
    url
  });

  const error = await t.throws(request);
  t.is(error.statusCode, 404);
});

test('should send 404 if url is not matched 2', async t => {
  const url = `http://localhost:${port}/blahblah`;
  const request = rq({
    method: 'GET',
    url
  });

  const error = await t.throws(request);
  t.is(error.statusCode, 404);
});

test('should send 404 if method is not found', async t => {
  const url = `http://localhost:${port}/api/accounts`;
  const request = rq({
    method: 'PUT',
    url
  });

  const error = await t.throws(request);
  t.is(error.statusCode, 404);
});

test('should send 404 if method is not found 2', async t => {
  const url = `http://localhost:${port}/api/entries`;
  const request = rq({
    method: 'DELETE',
    url
  });

  const error = await t.throws(request);
  t.is(error.statusCode, 404);
});
