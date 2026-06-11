/* 补助信息分区 */

(function () {
  function render() {
    const state = STATE.get();
    const subs = state.subsidies;
    // 更新标题副信息
    const total = subs.reduce((s, x) => s + Number(x.subsidyAmount || 0), 0);
    const tipEl = document.getElementById('subsidyTip');
    if (tipEl) {
      const summaries = subs.map(s => {
        const emp = MOCK.employees.find(e => e.reimburserId === s.reimburserId);
        return `${emp ? emp.reimburserName : ''}${s.days}天`;
      }).join(' ');
      tipEl.textContent = summaries ? `(${summaries})` : '';
    }
    const titleEl = document.querySelector('#subsidyTitle .title-sub');
    if (titleEl) titleEl.textContent = U.money(total);

    const root = document.getElementById('subsidy-body');
    root.innerHTML = '';

    // 提示信息
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.innerHTML = `
      <span class="icon">!</span>
      <span class="text">1、请根据实际出差日期选择补助 2、出差期间当日有用餐安排的请自行核减当日餐补 3、出差期间当日有用车的，请自行核减当日交补</span>
    `;
    root.appendChild(alert);

    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="col-index">序号</th>
          <th>出行人</th>
          <th>出差日期</th>
          <th>补助天数</th>
          <th>行程</th>
          <th>补助城市</th>
          <th class="right">申请金额</th>
          <th class="right">补助金额</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
        ${subs.length === 0 ? `<tr><td colspan="9" class="no-data">暂无数据</td></tr>` : subs.map((s, i) => {
          const emp = MOCK.employees.find(e => e.reimburserId === s.reimburserId);
          const sc = MOCK.cities.find(c => c.cityNo === s.startCity);
          const ec = MOCK.cities.find(c => c.cityNo === s.subsidyCity);
          return `
            <tr>
              <td class="col-index">${i + 1}</td>
              <td>${emp ? `${U.esc(emp.reimburserName)}/${U.esc(emp.reimburserNo)}` : '-'}</td>
              <td>${U.esc(s.startDate)} 至 ${U.esc(s.endDate)}</td>
              <td>${s.days}</td>
              <td>${U.esc(sc ? sc.cityName : '-')}-${U.esc(ec ? ec.cityName : '-')}</td>
              <td>${U.esc(ec ? ec.cityName : '-')}</td>
              <td class="right">${U.money(s.applyAmount)}</td>
              <td class="right">${U.money(s.subsidyAmount)}</td>
              <td class="col-action">
                <span class="op-icon" data-act="edit" data-id="${s.id}" title="编辑">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
    root.appendChild(table);

    table.querySelectorAll('.op-icon').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        const sub = STATE.get().subsidies.find(s => s.id === id);
        if (!sub) return;
        const bt = MOCK.businessTypes.find(b => b.businessTypeId === STATE.get().basic.businessType);
        M_subsidy.open({
          subsidy: sub,
          businessTypeName: bt ? bt.businessTypeName : '',
          onSave: (calendar) => STATE.updateSubsidyCalendar(id, calendar)
        });
      });
    });
  }

  window.S_subsidy = { render };
})();
