import { Lang, parse } from '@ast-grep/napi';

const testFile = `describe('sample test', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should do something', () => {
    const runOrder: string[] = [];

    const mock1 = jest.fn(() => runOrder.push('mock1'));
    const mock2 = jest.fn(() => runOrder.push('mock2'));
    const mock3 = jest.fn(() => runOrder.push('mock3'));

    setTimeout(mock1, 100);
    setTimeout(mock2, 0);
    setTimeout(mock3, 50);

    jest.advanceTimersToNextTimer();

    expect(runOrder).toEqual(['mock2']);
  });
});
`;

const node = parse(Lang.TypeScript, testFile).root();
const callExpr = node.findAll({
  rule: {
    kind: 'call_expression',
  },
});

const filtered = callExpr.filter((node) => {
  const ids = node.findAll({
    rule: {
      kind: 'identifier',
    }
  });

  return ids && ids[0].text() === 'jest';
});

const edits = [];

for (const call of filtered) {
  const edit = call.replace(`vi.lmao`);
  edits.push(edit);
}

const result = node.commitEdits(edits);
console.log(result);
