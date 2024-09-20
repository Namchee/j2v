test('the data is peanut butter', done => {
  function fetchData(callback) {
    console.log('called');
    callback();
  }

  function callback(error, data) {
    if (error) {
      done(error);
      return;
    }
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});
