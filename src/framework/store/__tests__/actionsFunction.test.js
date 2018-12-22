import { validateForm } from '../../../test/actions/usr/api/myFunctions';

it('test user function', () => {
  return new Promise(resolve => {

    validateForm()((type, payload) => {
      if (type === 'success') {
        expect(payload).toBe('The form was successfully validated');
      }
      if (type === 'delayed') {
        expect(payload).toEqual({value: 'Delayed object'});
        resolve();
      }
    });

  });
});