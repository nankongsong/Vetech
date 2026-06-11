/* 通用组件：Modal、Confirm、Select 等 */

(function () {
  const root = document.getElementById('modalRoot');

  /**
   * 通用 Modal
   * @param {object} opts { title, content, footer, large, onClose, onCloseMask }
   * content/footer 可为 string(HTML) 或 HTMLElement
   */
  function openModal(opts) {
    const mask = document.createElement('div');
    mask.className = 'modal-mask';

    const modal = document.createElement('div');
    modal.className = 'modal' + (opts.large ? ' large' : '');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';

    const header = document.createElement('div');
    header.className = 'modal-header';
    const titleEl = document.createElement('div');
    titleEl.className = 'modal-title';
    titleEl.textContent = opts.title || '';
    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof opts.content === 'string') body.innerHTML = opts.content;
    else if (opts.content) body.appendChild(opts.content);

    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    if (typeof opts.footer === 'string') footer.innerHTML = opts.footer;
    else if (opts.footer) footer.appendChild(opts.footer);

    modal.appendChild(header);
    modal.appendChild(body);
    if (opts.footer || opts.footer === '') modal.appendChild(footer);
    mask.appendChild(modal);
    root.appendChild(mask);

    function close() {
      mask.remove();
      if (typeof opts.onClose === 'function') opts.onClose();
    }

    closeBtn.addEventListener('click', close);
    mask.addEventListener('click', (e) => {
      if (e.target === mask) {
        if (typeof opts.onCloseMask === 'function') opts.onCloseMask();
        close();
      }
    });

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    });

    return { close, mask, modal, body, footer };
  }

  /**
   * 通用确认弹窗
   */
  function confirmModal({ title = '确认', text = '是否确认？', okText = '确定', cancelText = '取消', type = 'warning', onOk, onCancel } = {}) {
    const content = document.createElement('div');
    content.className = 'confirm-body';
    const icon = document.createElement('div');
    icon.className = 'confirm-icon' + (type === 'info' ? ' info' : '');
    icon.textContent = type === 'info' ? 'i' : '!';
    const txt = document.createElement('div');
    txt.className = 'confirm-text';
    txt.textContent = text;
    content.appendChild(icon);
    content.appendChild(txt);

    const okBtn = document.createElement('button');
    okBtn.className = 'btn btn-primary';
    okBtn.textContent = okText;
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-default';
    cancelBtn.textContent = cancelText;
    const footer = document.createElement('div');
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    const m = openModal({ title, content, footer, large: false });

    cancelBtn.addEventListener('click', () => { m.close(); onCancel && onCancel(); });
    okBtn.addEventListener('click', () => { m.close(); onOk && onOk(); });

    return m;
  }

  /**
   * 通用下拉选择（普通列表）
   * opts: { placeholder, options: [{id, name}], value, onChange, render, disabled }
   */
  function createSelect(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'select-wrap' + (opts.disabled ? ' disabled' : '');

    const ctrl = document.createElement('div');
    ctrl.className = 'form-control' + (opts.disabled ? ' disabled' : '');
    ctrl.tabIndex = 0;

    const text = document.createElement('input');
    text.type = 'text';
    text.readOnly = true;
    text.placeholder = opts.placeholder || '请选择';
    text.style.cursor = opts.disabled ? 'not-allowed' : 'pointer';
    text.style.background = 'transparent';

    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>';

    ctrl.appendChild(text);
    ctrl.appendChild(arrow);
    wrap.appendChild(ctrl);

    const list = document.createElement('div');
    list.className = 'select-options';
    wrap.appendChild(list);

    function setValue(v) {
      opts.value = v;
      const found = opts.options.find(o => o.id === v);
      text.value = found ? (found.name || found.text) : '';
      text.dataset.value = v || '';
    }

    function render() {
      list.innerHTML = '';
      opts.options.forEach(o => {
        const div = document.createElement('div');
        div.className = 'opt' + (opts.value === o.id ? ' selected' : '');
        div.textContent = o.name || o.text;
        div.addEventListener('click', (e) => {
          e.stopPropagation();
          if (opts.disabled) return;
          setValue(o.id);
          wrap.classList.remove('open');
          opts.onChange && opts.onChange(o.id, o);
        });
        list.appendChild(div);
      });
    }

    ctrl.addEventListener('click', (e) => {
      if (opts.disabled) return;
      e.stopPropagation();
      document.querySelectorAll('.select-wrap.open').forEach(el => {
        if (el !== wrap) el.classList.remove('open');
      });
      wrap.classList.toggle('open');
    });

    document.addEventListener('click', () => wrap.classList.remove('open'));

    setValue(opts.value);
    render();

    return { wrap, setValue, render };
  }

  /**
   * 业务类型树形下拉
   */
  function createBusinessTypeSelect(opts) {
    const wrap = document.createElement('div');
    wrap.className = 'select-wrap';
    const ctrl = document.createElement('div');
    ctrl.className = 'form-control';
    const text = document.createElement('input');
    text.type = 'text';
    text.readOnly = true;
    text.placeholder = opts.placeholder || '请选择';
    text.style.cursor = 'pointer';
    text.style.background = 'transparent';
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>';
    ctrl.appendChild(text);
    ctrl.appendChild(arrow);
    wrap.appendChild(ctrl);

    const list = document.createElement('div');
    list.className = 'select-options';
    wrap.appendChild(list);

    const map = new Map();
    MOCK.businessTypes.forEach(n => map.set(n.businessTypeId, { ...n, children: [] }));
    const roots = [];
    map.forEach(n => {
      if (n.superiorId === 'none' || !map.has(n.superiorId)) roots.push(n);
      else map.get(n.superiorId).children.push(n);
    });

    function setValue(v) {
      opts.value = v;
      const found = MOCK.businessTypes.find(o => o.businessTypeId === v);
      text.value = found ? found.businessTypeName : '';
    }

    function renderRows() {
      list.innerHTML = '';
      function walk(nodes, depth) {
        nodes.forEach(n => {
          const div = document.createElement('div');
          div.className = 'opt' + (depth === 0 ? ' opt-group' : (depth === 1 ? ' opt-child' : ' opt-subchild'));
          if (opts.value === n.businessTypeId) div.classList.add('selected');
          div.textContent = n.businessTypeName;
          div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (n.thereSubordinateNode === '1') {
              // 切换展开
              div.classList.toggle('collapsed');
              let next = div.nextSibling;
              while (next && next.dataset && next.dataset.parent === n.businessTypeId) {
                next.style.display = div.classList.contains('collapsed') ? 'none' : '';
                next = next.nextSibling;
              }
            } else {
              setValue(n.businessTypeId);
              wrap.classList.remove('open');
              opts.onChange && opts.onChange(n.businessTypeId, n);
            }
          });
          list.appendChild(div);
          if (n.children && n.children.length) {
            n.children.forEach(c => {
              c.dataset = c.dataset || {};
              c.dataset.parent = n.businessTypeId;
              walk([c], depth + 1);
            });
          }
        });
      }
      walk(roots, 0);
    }

    ctrl.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.select-wrap.open').forEach(el => {
        if (el !== wrap) el.classList.remove('open');
      });
      wrap.classList.toggle('open');
    });
    document.addEventListener('click', () => wrap.classList.remove('open'));

    setValue(opts.value);
    renderRows();
    return { wrap, setValue };
  }

  window.C = {
    openModal,
    confirmModal,
    createSelect,
    createBusinessTypeSelect
  };
})();
