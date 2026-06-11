/* 备注信息分区 */

(function () {
  function render() {
    const state = STATE.get();
    const root = document.getElementById('remark-body');
    root.innerHTML = '';

    const wrap = document.createElement('div');
    const ctrl = document.createElement('div');
    ctrl.className = 'form-control textarea';
    ctrl.style.width = '100%';
    const ta = document.createElement('textarea');
    ta.rows = 4;
    ta.maxLength = 1000;
    ta.placeholder = '请输入';
    ta.value = state.remark || '';
    ta.addEventListener('input', () => {
      STATE.setRemark(ta.value.slice(0, 1000));
    });
    ctrl.appendChild(ta);
    wrap.appendChild(ctrl);

    const tip = document.createElement('div');
    tip.style.color = 'var(--color-text-placeholder)';
    tip.style.fontSize = '12px';
    tip.style.marginTop = '4px';
    tip.textContent = `最多可输入 1000 字，当前 ${ta.value.length} 字`;
    wrap.appendChild(tip);

    root.appendChild(wrap);
  }

  document.getElementById('btnDeleteRemark').addEventListener('click', (e) => {
    e.stopPropagation();
    M_confirm({
      type: 'warning',
      title: '确认删除',
      text: '确定要清空备注信息吗？',
      onOk: () => {
        STATE.setRemark('');
        S_remark.render();
      }
    });
  });

  window.S_remark = { render };
})();
