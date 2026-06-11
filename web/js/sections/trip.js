/* 补录行程分区 */

(function () {
  function render() {
    const state = STATE.get();
    const root = document.getElementById('trip-body');
    root.innerHTML = '';

    const wrap = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="col-index">序号</th>
          <th>出差人员</th>
          <th>出差日期</th>
          <th>行程</th>
          <th>行程说明</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
        ${state.trips.length === 0 ? `<tr><td colspan="6" class="no-data">暂无数据</td></tr>` : state.trips.map((t, i) => {
          const emp = MOCK.employees.find(e => e.reimburserId === t.reimburserId);
          const sc = MOCK.cities.find(c => c.cityNo === t.startCity);
          const ec = MOCK.cities.find(c => c.cityNo === t.endCity);
          return `
            <tr>
              <td class="col-index">${i + 1}</td>
              <td>${emp ? `${U.esc(emp.reimburserName)}/${U.esc(emp.reimburserNo)}` : '-'}</td>
              <td>${U.esc(t.startDate)} 至 ${U.esc(t.endDate)}</td>
              <td>${U.esc(sc ? sc.cityName : '-')} - ${U.esc(ec ? ec.cityName : '-')}</td>
              <td>${U.esc(t.description || '')}</td>
              <td class="col-action">
                <span class="op-icon" data-act="del" data-id="${t.id}" title="删除">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </span>
                <span class="op-icon" data-act="edit" data-id="${t.id}" title="编辑">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </span>
                <span class="op-icon" data-act="copy" data-id="${t.id}" title="复制">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z"/></svg>
                </span>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
    wrap.appendChild(table);
    root.appendChild(wrap);

    // 绑定操作
    table.querySelectorAll('.op-icon').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        const act = el.dataset.act;
        if (act === 'del') {
          M_confirm({
            type: 'warning',
            title: '确认删除',
            text: '确定要删除该行程吗？',
            onOk: () => STATE.deleteTrip(id)
          });
        } else if (act === 'edit') {
          const trip = STATE.get().trips.find(t => t.id === id);
          M_trip.open({
            mode: 'edit',
            data: trip,
            excludeId: id,
            onSave: (data) => STATE.updateTrip(id, data)
          });
        } else if (act === 'copy') {
          const trip = STATE.get().trips.find(t => t.id === id);
          M_trip.open({
            mode: 'copy',
            data: trip,
            excludeId: id,
            onSave: (data) => STATE.addTrip(data)
          });
        }
      });
    });
  }

  // 绑定外部"补录行程"按钮
  document.getElementById('btnAddTrip').addEventListener('click', () => {
    M_trip.open({
      mode: 'add',
      onSave: (data) => STATE.addTrip(data)
    });
  });

  window.S_trip = { render };
})();
