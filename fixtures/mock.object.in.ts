// The script shouldn't wrap the mock with default if the return type is an object

jest.mock('./api', () => ({
  fetchData: jest.fn().mockResolvedValue('mocked data'),
}));
