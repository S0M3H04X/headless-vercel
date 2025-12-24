// Generated from: tests/features/demo.feature
import { test } from "playwright-bdd";

test.describe('Homepage', () => {

  test('Check homepage title', async ({ Given, Then, page }) => { 
    await Given('I am on the homepage', null, { page }); 
    await Then('I should see the main heading', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('tests/features/demo.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":2,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":3,"keywordType":"Context","textWithKeyword":"Given I am on the homepage","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":4,"keywordType":"Outcome","textWithKeyword":"Then I should see the main heading","stepMatchArguments":[]}]},
]; // bdd-data-end