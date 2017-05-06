const addTOC = require('../addTOC');

describe('addTOC Plugins', () => {
  it('throws if context not passed', () => {
    expect(() => {
      addTOC();
    }).toThrow();
  });

  it('throws if context.data not passed', () => {
    expect(() => {
      addTOC({});
    }).toThrow(/context\.data/);
  });

  it('throws if site not in context', () => {
    expect(() => {
      addTOC({
        data: '',
        page: {},
      });
    }).toThrow(/context\.site/);
  });

  it('throws if page not in context', () => {
    expect(() => {
      addTOC({
        data: '',
        site: {},
      });
    }).toThrow(/context\.page/);
  });

  it('should save property into context', () => {
    expect(
      addTOC({
        data: '',
        site: {},
        page: { toc: true },
        otherKey: true,
      }).otherKey
    ).toBeTruthy();
  });

  it('should return the same site', () => {
    const site = {};
    const page = {};
    const result = addTOC({
      data: '',
      site,
      page,
    });
    expect(result.site).toBe(site);
    expect(result.page).toBe(page);
  });

  describe('selectors works', () => {
    it('does not select what is not matched', () => {
      const result = addTOC({
        IS_DOC: true,
        data: `<div id="toc"></div>
              <div> <h2>header</h2> <div/>`,
        page: {
          toc: true,
        },
        site: {
          toc: {
            selectors: '.page-content h2',
          },
        },
      });
      expect(result.data).not.toMatch(/li/);
    });

    it('selects what is matched', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header</h2> <div/>`,

        page: {
          toc: true,
        },

        site: {
          toc: {
            selectors: '.page-content h2',
          },
        },
      });
      expect(result.data).toMatch(/li/);
    });
  });

  describe('minLength', () => {
    it('does not generate toc if matched item < minLength', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header</h2> <div/>`,

        site: {
          toc: {
            selectors: '.page-content h2',
            minLength: 2,
          },
        },

        page: {
          toc: true,
        },
      });
      expect(result.data).not.toMatch(/li/);
    });

    it('does generate toc if matched item = minLength', () => {
      const result = addTOC({
        data: `<div id="toc"></div>
              <div class="page-content"> <h2>header1</h2> <h2>header2</h2> <div/>`,

        site: {
          toc: {
            selectors: '.page-content h2',
            minLength: 2,
          },
        },

        page: {
          toc: true,
        },
      });
      expect(result.data).toMatch(/li/);
    });
  });

  it('appends header', () => {
    const result = addTOC({
      data: `<div id="toc"></div>
              <div class="page-content"> <h2>header1</h2> <h2>header2</h2> <div/>`,

      site: {
        toc: {
          selectors: '.page-content h2',
          header: 'this is toc header',
        },
      },

      page: {
        toc: true,
      },
    });
    expect(result.data).toMatch('this is toc header');
  });
});
