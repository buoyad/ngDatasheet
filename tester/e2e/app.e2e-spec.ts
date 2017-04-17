import { TesterPage } from './app.po';

describe('tester App', function() {
  let page: TesterPage;

  beforeEach(() => {
    page = new TesterPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
