// Chrome DevTools MCP: run this function with the built userscript embedded as a string.
// Reads no credentials or form values; only presentation changes and Prism-owned preferences.
async function smokePrism(source) {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const keys = ['pku-prism:enabled', 'pku-prism:theme'];
  const previous = keys.map(key => localStorage.getItem(key));
  const control = () => document.getElementById('pku-prism-control');
  const button = () => control()?.shadowRoot.querySelector('button');
  const select = () => control()?.shadowRoot.querySelector('select');
  const cleanup = () => control()?.dispatchEvent(new Event('pku-prism:destroy'));
  cleanup();
  const originalNodes = [...document.body.querySelectorAll('*')].map(node => ({
    node, parent: node.parentNode, children: [...node.childNodes], hidden: node.getAttribute('hidden'), id: node.getAttribute('id'), tabindex: node.getAttribute('tabindex'),
  }));
  const originalLinks = [...document.querySelectorAll('a')];
  const businessLinks = [...document.querySelectorAll('.courseListing a,#announcementList a,#content_listContainer a,#courseMenuPalette_contents a')].map(node => ({ node, href: node.getAttribute('href') }));
  const originalForms = [...document.forms].map(form => ({ form, controls: [...form.elements] }));
  const courseText = [...document.querySelectorAll('.courseListing a')].map(link => ({ link, text: link.textContent, node: link.firstChild }));
  const bodyClass = document.body.className;
  const root = document.documentElement;
  const results = [];
  const theme = value => { select().value = value; select().dispatchEvent(new Event('change')); };
  const storage = (key, value) => {
    localStorage.setItem(key, value);
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: value, storageArea: localStorage }));
  };
  const visible = selector => [...document.querySelectorAll(selector)].filter(node => node.getClientRects().length > 0);
  const search = value => { const input = document.querySelector('.prism-search-input'); input.value = value; input.dispatchEvent(new Event('input')); };
  const assertRestored = () => {
    assert(originalNodes.every(({node, parent, children, hidden, id, tabindex}) =>
      node.parentNode === parent && node.getAttribute('hidden') === hidden && node.getAttribute('id') === id && node.getAttribute('tabindex') === tabindex &&
      node.childNodes.length === children.length && children.every((child, index) => node.childNodes[index] === child)), 'Exact native tree and attributes restored');
    assert(courseText.every(({link, node}) => link.firstChild === node), 'Original Text nodes restored');
  };
  const probeTargets = [...document.querySelectorAll('.courseListing, #announcementForm, #content_listContainer')];
  let probes = 0;
  const probe = () => probes++;
  probeTargets.forEach(node => node.addEventListener('pku-prism:qa-probe', probe));
  try {
    localStorage.setItem(keys[0], 'true'); localStorage.setItem(keys[1], 'light');
    new Function(source)();
    const page = root.dataset.pkuPrismPage;
    assert(page && document.querySelector('[data-prism-layout]'), 'Recognized structural redesign');
    assert(button()?.getAttribute('aria-pressed') === 'true', 'Enabled switch');
    assert(document.querySelectorAll('#pku-prism-styles').length === 1, 'One stylesheet');
    assert(courseText.every(({link, text}) => link.textContent === text), 'Full course text preserved');
    results.push('structural mount + original text');

    if (page === 'portal') {
      assert(document.querySelector('.prism-global-links #appTabList'), 'Native navigation moved to workspace');
      const currentCount = visible('.courseListing > li').length;
      document.querySelectorAll('.prism-view-switch button')[1].click();
      assert(visible('.prism-course-stage > .portlet').length === 1, 'One course scope at a time');
      assert(visible('.courseListing > li').length > 0, 'Historical courses accessible');
      document.querySelectorAll('.prism-view-switch button')[0].click();
      assert(visible('.courseListing > li').length === currentCount, 'Current scope restored');
      search(visible('.prism-course-name')[0].textContent);
      assert(visible('.courseListing > li').length > 0, 'Matching course remains');
      results.push('course views + native navigation + filtering');
    } else if (page === 'announcements') {
      assert(visible('#announcementList > li').length === 1, 'One announcement in reader');
      const entries = document.querySelectorAll('.prism-ann-entry');
      entries[entries.length - 1].click();
      assert(document.querySelector('#announcementList > li:last-child').hidden === false, 'Directory selects original announcement');
      assert(document.activeElement === document.querySelector('#announcementList > li:last-child h3'), 'Reader receives keyboard focus');
      document.querySelector('.prism-list-toolbar > button').click();
      assert(visible('#announcementList > li').length === entries.length, 'Read all announcements');
      results.push('announcement selection + reader focus + read all');
    } else {
      const toggles = document.querySelectorAll('.prism-description-toggle');
      if (toggles.length) {
        assert(visible('#content_listContainer .vtbegenerated').length === 0, 'Instructions start collapsed');
        toggles[0].click();
        assert(toggles[0].getAttribute('aria-expanded') === 'true' && visible('#content_listContainer .vtbegenerated').length === 1, 'One instruction expands');
        document.querySelector('.prism-list-toolbar > button').click();
        assert(visible('#content_listContainer .vtbegenerated').length === toggles.length, 'All instructions expand');
        document.querySelector('.prism-list-toolbar > button').click();
      }
      search(document.querySelector('#content_listContainer .item h3').textContent.trim());
      assert(visible('#content_listContainer > li').length > 0, 'Matching resource remains');
      results.push(toggles.length ? 'assignment disclosures + expand all + filtering' : 'resource browser + filtering');
    }
    search('pku-prism-no-such-result-9xq');
    assert(visible('.prism-empty').length === 1, 'No-results state');
    document.querySelector('.prism-search-clear').click();
    assert(visible('.prism-empty').length === 0, 'Clear search restores view');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    document.querySelector('.prism-search-input').dispatchEvent(enter);
    assert(enter.defaultPrevented, 'Search Enter cannot submit native form');
    results.push('empty + clear + no form submission');

    probeTargets.forEach(node => node.firstElementChild?.dispatchEvent(new Event('pku-prism:qa-probe', { bubbles: true })));
    assert(probes === probeTargets.filter(node => node.firstElementChild).length, 'Original ancestor events reachable');
    assert(originalLinks.every(node => node.isConnected), 'All original links retained');
    assert(businessLinks.every(({node, href}) => node.getAttribute('href') === href), 'Business URLs unchanged');
    assert(originalForms.every(({form, controls}) => form.isConnected && controls.every(node => node.form === form)), 'Original controls retain their form');
    assert(document.body.className === bodyClass, 'Native responsive state retained');
    results.push('links + form ownership + ancestor events');

    theme('dark'); assert(root.dataset.pkuPrismTheme === 'dark' && getComputedStyle(root).colorScheme === 'dark', 'Dark theme');
    theme('light'); assert(root.dataset.pkuPrismTheme === 'light', 'Light theme');
    theme('system'); assert(root.dataset.pkuPrismTheme === (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), 'System theme');
    results.push('light + dark + system');
    button().click();
    assert(!document.querySelector('#pku-prism-styles, [data-prism-layout], .prism-workspace, .prism-search-input'), 'Disable removes all redesign');
    assert(!root.hasAttribute('data-pku-prism'), 'Disable removes scope');
    assertRestored();
    new Function(source)();
    assert(button()?.getAttribute('aria-pressed') === 'false', 'Disabled preference persists');
    button().click(); new Function(source)();
    assert(document.querySelectorAll('#pku-prism-control').length === 1 && document.querySelectorAll('#pku-prism-styles').length === 1, 'No duplicates');
    results.push('exact rollback + re-enable + repeat injection');
    storage(keys[0], 'false'); assertRestored();
    storage(keys[0], 'true'); storage(keys[1], 'dark');
    assert(root.dataset.pkuPrismTheme === 'dark' && select().value === 'dark', 'Storage theme sync');
    cleanup(); assertRestored();
    storage(keys[0], 'true'); assert(!document.querySelector('#pku-prism-styles'), 'Storage listener removed');
    results.push('storage sync + full cleanup');
    return { page, passed: results };
  } finally {
    cleanup(); probeTargets.forEach(node => node.removeEventListener('pku-prism:qa-probe', probe));
    keys.forEach((key, i) => previous[i] === null ? localStorage.removeItem(key) : localStorage.setItem(key, previous[i]));
  }
}
