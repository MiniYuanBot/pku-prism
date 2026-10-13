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
  const businessLinks = [...document.querySelectorAll('.courseListing a,#announcementList a,#content_listContainer a,#navigationPane a,#appTabList a,#paneTabs a,.portletList a,#quick_links_lightbox_link')].map(node => ({ node, href: node.getAttribute('href') }));
  const helpLink = document.querySelector('#helpTextToggleLink');
  const nativeFlyout = document.querySelector('#overflowIconId')?.flyoutMenu;
  const nativeFlyoutEnabled = nativeFlyout?.enabled;
  const siteLabels = [...document.querySelectorAll('#appTabList td > a')].map(node => ({ node, text: node.textContent }));
  const authorizationLabels = [...document.querySelectorAll('.portletList a')].flatMap(link => [...link.childNodes]
    .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() === 'Application Authorization')
    .map(node => ({ node, text: node.textContent })));
  const quickLinks = document.querySelector('#quick_links_wrap');
  const courseActions = document.querySelector('#breadcrumb_controls_id.breadcrumb-controls');
  const nativeActions = [...(courseActions?.querySelectorAll('#startStudentPreviewLink, .course-availability-button, #editModeToggleLink') ?? [])]
    .map(node => ({ node, handler: node.onclick, role: node.getAttribute('role'), checked: node.getAttribute('aria-checked'), title: node.title, className: node.className, label: node.getAttribute('aria-label'), description: node.getAttribute('aria-describedby') }));
  const managementLink = document.querySelector('#controlPanelPalette_link');
  const managementText = managementLink?.textContent;
  const managementDivider = document.querySelector('#controlPanelPalette')?.previousElementSibling;
  const originalFrames = [...document.querySelectorAll('iframe')].flatMap(frame => {
    try {
      const doc = frame.contentDocument;
      return doc?.querySelector('body#learn-oe-body, body#tinymce') ? [{ frame, doc }] : [];
    } catch { return []; }
  });
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
    assert(siteLabels.every(({node, text}) => node.textContent === text), 'Original bilingual site labels restored');
    assert(authorizationLabels.every(({node, text}) => node.textContent === text), 'Original authorization Text restored');
    assert(!managementLink || managementLink.textContent === managementText, 'Original management heading restored');
    assert(nativeActions.every(({node, label, description}) => node.getAttribute('aria-label') === label && node.getAttribute('aria-describedby') === description), 'Native action accessibility attributes restored');
    assert(originalFrames.every(({frame, doc}) => frame.contentDocument === doc), 'Original live iframe documents preserved');
    assert(!nativeFlyout || nativeFlyout.enabled === nativeFlyoutEnabled, 'Original overflow keyboard behavior restored');
  };
  const probeTargets = [...document.querySelectorAll('.courseListing, #announcementForm, #content_listContainer, #breadcrumb_controls_id.breadcrumb-controls')];
  let probes = 0;
  const probe = () => probes++;
  probeTargets.forEach(node => node.addEventListener('pku-prism:qa-probe', probe));
  try {
    localStorage.setItem(keys[0], 'true'); localStorage.setItem(keys[1], 'light');
    new Function(source)();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const page = root.dataset.pkuPrismPage;
    assert(page && document.querySelector('.prism-shell-header'), 'Recognized shared shell');
    assert(button()?.getAttribute('aria-pressed') === 'true', 'Enabled switch');
    assert(document.querySelectorAll('#pku-prism-styles').length === 1, 'One stylesheet');
    assert(courseText.every(({link, text}) => link.textContent === text), 'Full course text preserved');
    results.push('structural mount + original text');

    if (page === 'portal') {
      assert(document.querySelector('.prism-shell-site-panel #appTabList'), 'Native navigation moved to shared header');
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
    } else if (page === 'content') {
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
    if (document.querySelector('.prism-search-input')) {
    search('pku-prism-no-such-result-9xq');
    assert(visible('.prism-empty').length === 1, 'No-results state');
    document.querySelector('.prism-search-clear').click();
    assert(visible('.prism-empty').length === 0, 'Clear search restores view');
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    document.querySelector('.prism-search-input').dispatchEvent(enter);
    assert(enter.defaultPrevented, 'Search Enter cannot submit native form');
    results.push('empty + clear + no form submission');
    }

    assert(!document.querySelector('.prism-shell-sites'), 'No redundant site dropdown');
    assert(visible('.prism-shell-site-panel #appTabList td > a').length === siteLabels.length + 1, 'All site links and My Courses directly visible');
    assert(siteLabels.every(({node}) => !/\([A-Za-z ]+\)/.test(node.textContent)), 'Site labels omit English suffix');
    assert(authorizationLabels.every(({node}) => node.textContent.trim() === '应用授权'), 'Authorization label translated in place');
    if (quickLinks) assert(document.querySelector('.prism-shell-appearance-panel').contains(quickLinks), 'Native quick links in header settings');
    assert(!document.querySelector('.prism-shell-header #breadcrumbs, .prism-shell-header #paneTabs'), 'Header has no context navigation');
    const footer = document.querySelector('.prism-context-footer');
    if (footer) {
      assert(footer.parentElement.lastElementChild === footer && footer.querySelector('.nav.clearfix.u_floatThis-right'), 'Native low-frequency actions are at the end of the sidebar');
      assert(footer.querySelector('#courseMenu_combo[data-prism-icon-action="home"]'), 'Course home link joins footer icons');
      const rail = footer.parentElement;
      const identity = rail.querySelector(':scope > #breadcrumbs');
      const directory = rail.querySelector(':scope > .prism-context-body');
      assert(directory && (!identity || identity.nextElementSibling === directory), 'Course identity stays above the independent scrolling directory');
      assert(getComputedStyle(directory).scrollbarWidth === 'none', 'Directory scrollbar does not reserve a shifting gutter');
      if (directory.clientHeight > 0 && directory.scrollHeight > directory.clientHeight) {
        const before = [identity, footer, directory].map(node => node?.getBoundingClientRect());
        const scrollTop = directory.scrollTop;
        directory.scrollTop = directory.scrollHeight;
        const after = [identity, footer, directory].map(node => node?.getBoundingClientRect());
        assert(directory.scrollTop > 0 && before.every((rect, i) => !rect || (rect.x === after[i].x && rect.y === after[i].y && rect.width === after[i].width && rect.height === after[i].height)), 'Scrolling the directory keeps the identity, footer and column geometry fixed');
        directory.scrollTop = scrollTop;
      }
      if (courseActions) {
        assert(footer.contains(courseActions), 'Intact native management action region joins footer');
        assert(nativeActions.every(({node, handler, role, checked, title, className}) => node.isConnected && node.onclick === handler && node.getAttribute('role') === role && node.getAttribute('aria-checked') === checked && node.title === title && node.className === className), 'Native management handlers, roles and business states unchanged');
        for (const {node} of nativeActions) assert([...node.querySelectorAll('svg')].filter(svg => getComputedStyle(svg).display !== 'none').length === 1, 'Each management action shows one icon');
        const nativeCheckbox = courseActions.querySelector('#courseAvailabilityToggle');
        if (nativeCheckbox) assert(nativeCheckbox.isConnected && !nativeCheckbox.getClientRects().length, 'Availability widget keeps its input without a duplicate keyboard stop');
      }
      if (managementLink && managementDivider?.matches('h2.navDivider')) {
        assert(managementDivider.hidden && managementLink.textContent.trim() === managementDivider.textContent.trim(), 'One native expander represents course management');
      }
    }
    const overflow = document.querySelector('.prism-home-menu #overflowULId');
    if (overflow) {
      assert(getComputedStyle(overflow).display !== 'none' && getComputedStyle(overflow).visibility === 'visible' && !overflow.closest('[hidden]'), 'Native overflow destinations are exposed directly');
      assert(overflow.parentElement.id === 'overflowLiId' && document.querySelector('#overflowIconId').hidden, 'Native resize containers remain intact; only the disclosure is hidden');
      assert(overflow.getAttribute('role') !== 'menu' && !overflow.querySelector('[role="menuitem"]'), 'Inline destinations use ordinary link semantics');
      assert(overflow.getAttribute('aria-hidden') === 'false' && [...overflow.querySelectorAll('a')].every(a => a.getAttribute('role') === 'link' && a.tabIndex === 0), 'Inline destinations remain visible to keyboard and accessibility APIs');
    }
    assert(document.querySelector('.prism-global-search'), 'Global course search destination');
    if (helpLink) assert(document.querySelector('.actionBarMicro .nav').contains(helpLink) && helpLink.querySelector('svg'), 'Native help toggle becomes a toolbar icon');
    for (const link of document.querySelectorAll('#navigationPane #menuWrap :is(.submenuLink, .submenuLink_active)')) {
      assert(link.isConnected && getComputedStyle(link).display === 'none', 'Redundant jumps retained but hidden');
    }
    const appearance = document.querySelector('.prism-shell-appearance');
    if (document.querySelector('.prism-shell-header').dataset.prismAppearance === 'inline') {
      assert(appearance.open && getComputedStyle(appearance.querySelector('summary')).display === 'none', 'Appearance controls directly exposed');
      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      assert(appearance.open, 'Inline appearance stays open on outside interaction');
    } else {
      appearance.querySelector('summary').click();
      appearance.querySelector('summary').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      assert(!appearance.open && document.activeElement === appearance.querySelector('summary'), 'Appearance Escape restores focus');
    }
    const railButton = document.querySelector('.prism-rail-toggle');
    if (railButton) {
      const initial = railButton.getAttribute('aria-expanded');
      const main = document.querySelector('.prism-course-catalog, .prism-shell-body > #contentPanel, #iframe_wrap');
      const before = main?.getBoundingClientRect().width;
      railButton.click();
      assert(railButton.getAttribute('aria-expanded') !== initial, 'Shared rail toggles');
      assert(document.querySelector('[data-prism-context-rail]').inert === (railButton.getAttribute('aria-expanded') === 'false'), 'Closed rail is not keyboard reachable');
      if (main && before && initial === 'true' && matchMedia('(min-width: 901px)').matches) {
        assert(!visible('[data-prism-context-rail]').length, 'Desktop rail fully disappears');
        assert(main.getBoundingClientRect().width > before, 'Collapsing sidebar releases width to content');
      }
      railButton.click();
      assert(railButton.getAttribute('aria-expanded') === initial, 'Rail state restored');
    }
    const childDocs = () => {
      const docs = [];
      const visit = doc => { for (const frame of doc.querySelectorAll('iframe')) { let d; try { d = frame.contentDocument; } catch {} if (d?.body) { docs.push(d); visit(d); } } };
      visit(document); return docs;
    };
    const themed = childDocs().filter(d => d.querySelector('#pku-prism-frame-styles'));
    assert(themed.every(d => d.querySelectorAll('#pku-prism-frame-styles').length === 1), 'One stylesheet per native frame');
    results.push('site navigation + rail + native frame mount');

    probeTargets.forEach(node => node.firstElementChild?.dispatchEvent(new Event('pku-prism:qa-probe', { bubbles: true })));
    assert(probes === probeTargets.filter(node => node.firstElementChild).length, 'Original ancestor events reachable');
    assert(originalLinks.every(node => node.isConnected), 'All original links retained');
    assert(businessLinks.every(({node, href}) => node.getAttribute('href') === href), 'Business URLs unchanged');
    assert(originalForms.every(({form, controls}) => form.isConnected && controls.every(node => node.form === form)), 'Original controls retain their form');
    assert(originalFrames.every(({frame, doc}) => frame.contentDocument === doc), 'Mount keeps live iframe documents');
    assert(document.body.className === bodyClass, 'Native responsive state retained');
    results.push('links + form ownership + ancestor events');

    for (const localButton of document.querySelectorAll('.prism-button')) {
      assert(getComputedStyle(localButton).cursor === 'pointer', 'Local action has pointer cursor');
    }
    for (const summary of document.querySelectorAll('.prism-nav-summary')) {
      assert(getComputedStyle(summary).display === 'flex' && getComputedStyle(summary).listStyleType === 'none', 'Disclosure owns its layout and marker');
      const open = summary.parentElement.open;
      summary.click(); assert(summary.parentElement.open !== open, 'Disclosure toggles natively');
      summary.click(); assert(summary.parentElement.open === open, 'Disclosure restores its state');
    }
    results.push('action cursor + disclosure layout and interaction');

    theme('dark'); assert(root.dataset.pkuPrismTheme === 'dark' && getComputedStyle(root).colorScheme === 'dark', 'Dark theme');
    assert(themed.every(d => d.documentElement.dataset.pkuPrismTheme === 'dark'), 'Nested frames follow dark theme');
    theme('light'); assert(root.dataset.pkuPrismTheme === 'light', 'Light theme');
    theme('system'); assert(root.dataset.pkuPrismTheme === (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'), 'System theme');
    results.push('light + dark + system');
    button().click();
    assert(!document.querySelector('#pku-prism-styles, [data-prism-layout], .prism-workspace, .prism-search-input'), 'Disable removes all redesign');
    assert(!root.hasAttribute('data-pku-prism'), 'Disable removes scope');
    assert(themed.every(d => !d.querySelector('#pku-prism-frame-styles') && !d.documentElement.hasAttribute('data-pku-prism-frame')), 'Disable cleans nested frames');
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
