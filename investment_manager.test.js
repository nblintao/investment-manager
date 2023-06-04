const investment_manager = require('./investment_manager');

test('adds 1 + 2 to equal 3', () => {
    expect(investment_manager.sum(1, 2)).toBe(3);
});