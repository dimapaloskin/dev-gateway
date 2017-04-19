import test from 'ava';
import cloneDeep from 'lodash.clonedeep';
import { extract } from './../';
import app from './example/app'

test('should extract rules correct with defined host', t => {

  const input = cloneDeep(app);
  const out = extract(input, 'google.com');
  out.rules.forEach(rule => {
    t.true(rule.dest.endsWith('.google.com'));
  });
});


test('should extract rules correct without defined host', t => {

  const input = cloneDeep(app);
  delete input.host;
  const out = extract(input, 'google.com');
  out.rules.forEach(rule => {
    t.true(rule.dest.endsWith('localhost.google.com'));
  });
});
