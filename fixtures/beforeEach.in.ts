import * as fs from 'node:fs';

beforeEach(() => jest.spyOn(fs, 'existsSync').mockReturnValue(false));
