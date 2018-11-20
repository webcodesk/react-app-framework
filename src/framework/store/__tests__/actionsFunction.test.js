const first1 = () => (dispatch) => {
  dispatch('firstResult1', {name: 'Method: first1 + result1'});
  setTimeout(() => {
    dispatch('firstResult2', {name: 'Method: first1 + result2'});
  }, 1000);
};
const second1 = () => (dispatch) => {
  dispatch('secondResult1', {name: 'Method: second1 + result1'});
  setTimeout(() => {
    dispatch('secondResult2', {name: 'Method: second1 + result2'});
  }, 1000);
};

const funcRepo = {
  first1, second1
};

const declarations = [
  'first1', 'second1'
];

it('test user function reference', () => {
  const tasks = [];
  declarations.forEach(declaration => {
    const func = funcRepo[declaration];
    tasks.push(function() {
      const args = arguments;
      func.apply(null, args)((type, payload) => {
        console.info('Function is invoked with type: ', type, payload);
      });
    });
  });

  console.info('Tasks: ', tasks);

  tasks.forEach(task => {
    console.info('Invoke task function: ', task);
    // task();
    task.apply(null, null);
  });


});