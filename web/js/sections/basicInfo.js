/* 基础信息分区 */

(function () {
  function render() {
    const state = STATE.get();
    const root = document.getElementById('basic-body');
    root.innerHTML = '';

    // 第一行：报销标题（全宽）
    const row0 = document.createElement('div');
    row0.className = 'form-row';
    row0.appendChild(makeField('报销标题', state.basic.title, '请输入', (v) => {
      STATE.setBasic({ title: v.slice(0, 500) });
    }));
    root.appendChild(row0);

    // 第二行：报销人 / 报销部门
    const row1 = document.createElement('div');
    row1.className = 'form-row';
    row1.appendChild(makeSelectField('报销人', MOCK.employees.map(e => ({ id: e.reimburserId, name: `${e.reimburserName}/${e.reimburserNo}` })), state.basic.reimburser, (v) => STATE.setBasic({ reimburser: v }), true));
    row1.appendChild(makeSelectField('报销部门', MOCK.departments.map(d => ({ id: d.reimDepartmentId, name: `${d.reimDepartmentName}/${d.reimDepartmentNo}` })), state.basic.department, (v) => STATE.setBasic({ department: v })));
    root.appendChild(row1);

    // 第三行：费用归属公司 / 业务类型
    const row2 = document.createElement('div');
    row2.className = 'form-row';
    row2.appendChild(makeSelectField('费用归属公司', MOCK.companies.map(c => ({ id: c.reimCompanyId, name: `${c.reimCompanyName}/${c.reimCompanyNo}` })), state.basic.reimCompany, (v) => STATE.setBasic({ reimCompany: v })));
    row2.appendChild(makeBusinessTypeField());
    root.appendChild(row2);

    // 第四行：业务类型（独立行）

    // 出差事由
    const row4 = document.createElement('div');
    row4.className = 'form-row';
    row4.appendChild(makeTextareaField('出差事由', state.basic.reason, '请输入', (v) => STATE.setBasic({ reason: v.slice(0, 500) })));
    root.appendChild(row4);
  }

  function makeField(label, value, placeholder, onInput) {
    const f = document.createElement('div');
    f.className = 'form-field';
    const lbl = document.createElement('span');
    lbl.className = 'form-label';
    lbl.textContent = label;
    f.appendChild(lbl);
    const ctrl = document.createElement('div');
    ctrl.className = 'form-control';
    ctrl.style.minWidth = '300px';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.value = value || '';
    input.addEventListener('input', () => onInput(input.value));
    ctrl.appendChild(input);
    f.appendChild(ctrl);
    return f;
  }

  function makeTextareaField(label, value, placeholder, onInput) {
    const f = document.createElement('div');
    f.className = 'form-field col-1';
    const lbl = document.createElement('span');
    lbl.className = 'form-label';
    lbl.textContent = label;
    f.appendChild(lbl);
    const ctrl = document.createElement('div');
    ctrl.className = 'form-control textarea';
    ctrl.style.flex = '1';
    ctrl.style.minWidth = '500px';
    const ta = document.createElement('textarea');
    ta.rows = 3;
    ta.placeholder = placeholder;
    ta.value = value || '';
    ta.addEventListener('input', () => onInput(ta.value));
    ctrl.appendChild(ta);
    f.appendChild(ctrl);
    return f;
  }

  function makeSelectField(label, options, value, onChange, required) {
    const f = document.createElement('div');
    f.className = 'form-field';
    const lbl = document.createElement('span');
    lbl.className = 'form-label';
    lbl.innerHTML = label + (required ? '<span class="req">*</span>' : '');
    f.appendChild(lbl);
    const sel = C.createSelect({
      placeholder: '请选择',
      options,
      value,
      onChange: (v) => onChange(v)
    });
    sel.wrap.style.minWidth = '300px';
    f.appendChild(sel.wrap);
    return f;
  }

  function makeBusinessTypeField() {
    const f = document.createElement('div');
    f.className = 'form-field';
    const lbl = document.createElement('span');
    lbl.className = 'form-label';
    lbl.textContent = '业务类型';
    const help = document.createElement('span');
    help.className = 'help';
    help.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
    lbl.appendChild(help);
    f.appendChild(lbl);
    const sel = C.createBusinessTypeSelect({
      placeholder: '请选择',
      value: STATE.get().basic.businessType,
      onChange: (v) => STATE.setBasic({ businessType: v })
    });
    sel.wrap.style.minWidth = '300px';
    f.appendChild(sel.wrap);
    return f;
  }

  window.S_basicInfo = { render };
})();
