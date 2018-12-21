import queryString from 'query-string';

it('test parse query', () => {
  const payload = 'test';
  const s = queryString.stringify(payload);
  console.info('String: ', s);

  console.info('Parse null: ', queryString.parse(''));

});