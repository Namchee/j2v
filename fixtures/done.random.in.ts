test('the data is peanut butter', cb => {
  function fetchData(callback) {
    console.log('called');
    callback();
  }

  function callback(error, data) {
    if (error) {
      cb(error);
      return;
    }
    try {
      expect(data).toBe('peanut butter');
      cb();
    } catch (error) {
      cb(error);
    }
  }

  fetchData(callback);
});
