/* 补助日历弹窗 */

(function () {
  /**
   * 打开补助日历弹窗
   * @param {object} opts
   *   - subsidy: 补助信息
   *   - businessTypeName: 业务类型名称
   *   - onSave: (calendar) => void
   */
  function open(opts) {
    const { subsidy, businessTypeName, onSave } = opts;

    // 内部副本，避免直接改 state
    const calendar = U.clone(subsidy.calendar || []);

    const content = document.createElement('div');

    // 顶部信息卡
    const info = document.createElement('div');
    info.className = 'calendar-info';
    const startCity = MOCK.cities.find(c => c.cityNo === subsidy.startCity);
    const endCity = MOCK.cities.find(c => c.cityNo === subsidy.endCity);
    const emp = MOCK.employees.find(e => e.reimburserId === subsidy.reimburserId);
    const trip = `${startCity ? startCity.cityName : ''}-${endCity ? endCity.cityName : ''}`;
    const days = calendar.length;

    function sumStd() {
      let s = 0;
      calendar.forEach(r => {
        if (r.meal.checked) s += r.meal.std;
        if (r.traffic.checked) s += r.traffic.std;
        if (r.comm.checked) s += r.comm.std;
      });
      return s;
    }
    function sumActual() {
      let s = 0;
      calendar.forEach(r => {
        if (r.meal.checked) s += Number(r.meal.value || 0);
        if (r.traffic.checked) s += Number(r.traffic.value || 0);
        if (r.comm.checked) s += Number(r.comm.value || 0);
      });
      return s;
    }

    info.innerHTML = `
      <div class="row"><span class="lbl">出差类型：</span><span class="val">${U.esc(businessTypeName || '-')}</span></div>
      <div class="row"><span class="lbl">行程：</span><span class="val">${U.esc(trip)}</span></div>
      <div class="row"><span class="lbl">开始日期：</span><span class="val">${U.esc(subsidy.startDate)}</span></div>
      <div class="row"><span class="lbl">结束日期：</span><span class="val">${U.esc(subsidy.endDate)}</span></div>
      <div class="row"><span class="lbl">天数：</span><span class="val">${days} 天</span></div>
      <div class="row"><span class="lbl">出行人：</span><span class="val">${emp ? U.esc(emp.reimburserName + '/' + emp.reimburserNo) : '-'}</span></div>
      <div class="row"><span class="lbl">标准总额：</span><span class="val hot">CNY <span id="sumStd">${U.money(sumStd())}</span></span></div>
      <div class="row"><span class="lbl">补助金额：</span><span class="val hot">CNY <span id="sumActual">${U.money(sumActual())}</span></span></div>
    `;
    content.appendChild(info);

    // 表格
    const tableWrap = document.createElement('div');
    tableWrap.style.overflowX = 'auto';
    const table = document.createElement('table');
    table.className = 'table calendar-table';

    function checkAllColumn(key) {
      return calendar.every(r => r[key].checked);
    }
    function checkAllRow(idx) {
      return calendar[idx].meal.checked && calendar[idx].traffic.checked && calendar[idx].comm.checked;
    }
    function partialAll() {
      // 至少有一个勾选
      return calendar.some(r => r.meal.checked || r.traffic.checked || r.comm.checked);
    }

    function renderHeader() {
      const allChecked = ['meal', 'traffic', 'comm'].every(k => checkAllColumn(k));
      const partial = !allChecked && partialAll();
      const head = `
        <thead>
          <tr>
            <th class="col-index">
              <div class="checkbox ${allChecked ? 'checked' : (partial ? 'partial' : '')}" data-act="all"></div>
            </th>
            <th>出差日期</th>
            <th>
              <div class="checkbox ${checkAllColumn('meal') ? 'checked' : (calendar.some(r => r.meal.checked) ? 'partial' : '')}" data-act="col-meal"></div>
              餐费补助
            </th>
            <th>
              <div class="checkbox ${checkAllColumn('traffic') ? 'checked' : (calendar.some(r => r.traffic.checked) ? 'partial' : '')}" data-act="col-traffic"></div>
              交通补助
            </th>
            <th>
              <div class="checkbox ${checkAllColumn('comm') ? 'checked' : (calendar.some(r => r.comm.checked) ? 'partial' : '')}" data-act="col-comm"></div>
              通讯补助
            </th>
          </tr>
        </thead>
      `;
      return head;
    }

    function renderBody() {
      let html = '<tbody>';
      calendar.forEach((r, idx) => {
        const allRow = checkAllRow(idx);
        html += `<tr data-idx="${idx}">
          <td class="checkbox-cell"><div class="checkbox ${allRow ? 'checked' : ''}" data-act="row"></div></td>
          <td class="date-cell">${U.esc(r.date.slice(5))}<span class="week">星期${U.weekdayCn(r.date)}</span></td>
          <td class="amount-cell ${r.meal.checked ? '' : 'disabled'}">
            <span class="std">标准 ${U.money(r.meal.std)}</span>
            <input class="input" type="number" min="0" max="${r.meal.std}" step="0.01" value="${r.meal.value}" ${r.meal.checked ? '' : 'disabled'} data-key="meal" />
          </td>
          <td class="amount-cell ${r.traffic.checked ? '' : 'disabled'}">
            <span class="std">标准 ${U.money(r.traffic.std)}</span>
            <input class="input" type="number" min="0" max="${r.traffic.std}" step="0.01" value="${r.traffic.value}" ${r.traffic.checked ? '' : 'disabled'} data-key="traffic" />
          </td>
          <td class="amount-cell ${r.comm.checked ? '' : 'disabled'}">
            <span class="std">标准 ${U.money(r.comm.std)}</span>
            <input class="input" type="number" min="0" max="${r.comm.std}" step="0.01" value="${r.comm.value}" ${r.comm.checked ? '' : 'disabled'} data-key="comm" />
          </td>
        </tr>`;
      });
      html += '</tbody>';
      return html;
    }

    function render() {
      table.innerHTML = renderHeader() + renderBody();
      bindTable();
      updateSums();
    }

    function updateSums() {
      document.getElementById('sumStd').textContent = U.money(sumStd());
      document.getElementById('sumActual').textContent = U.money(sumActual());
    }

    function bindTable() {
      table.querySelectorAll('.checkbox').forEach(cb => {
        cb.onclick = (e) => {
          e.stopPropagation();
          const act = cb.dataset.act;
          if (act === 'all') {
            // 切换全选
            const allChecked = ['meal', 'traffic', 'comm'].every(k => checkAllColumn(k));
            const target = !allChecked;
            calendar.forEach(r => {
              r.meal.checked = target;
              r.traffic.checked = target;
              r.comm.checked = target;
              if (target) {
                r.meal.value = r.meal.std;
                r.traffic.value = r.traffic.std;
                r.comm.value = r.comm.std;
              } else {
                r.meal.value = 0;
                r.traffic.value = 0;
                r.comm.value = 0;
              }
            });
          } else if (act === 'col-meal' || act === 'col-traffic' || act === 'col-comm') {
            const key = act.replace('col-', '');
            const all = checkAllColumn(key);
            const target = !all;
            calendar.forEach(r => {
              r[key].checked = target;
              r[key].value = target ? r[key].std : 0;
            });
          } else if (act === 'row') {
            const tr = cb.closest('tr');
            const idx = Number(tr.dataset.idx);
            const all = checkAllRow(idx);
            const target = !all;
            ['meal', 'traffic', 'comm'].forEach(k => {
              calendar[idx][k].checked = target;
              calendar[idx][k].value = target ? calendar[idx][k].std : 0;
            });
          }
          render();
        };
      });
      table.querySelectorAll('.input').forEach(inp => {
        inp.oninput = () => {
          const tr = inp.closest('tr');
          const idx = Number(tr.dataset.idx);
          const key = inp.dataset.key;
          let v = Number(inp.value || 0);
          if (v < 0) v = 0;
          if (v > calendar[idx][key].std) v = calendar[idx][key].std;
          calendar[idx][key].value = v;
          updateSums();
        };
      });
    }

    tableWrap.appendChild(table);
    content.appendChild(tableWrap);
    render();

    // Footer
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-default';
    cancelBtn.textContent = '取消';
    const okBtn = document.createElement('button');
    okBtn.className = 'btn btn-primary';
    okBtn.textContent = '保存';
    const footer = document.createElement('div');
    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    const m = C.openModal({ title: '补助信息', content, footer, large: true });

    cancelBtn.onclick = () => m.close();
    okBtn.onclick = () => {
      // 校验：勾选行的金额不能超过标准
      for (let i = 0; i < calendar.length; i++) {
        const r = calendar[i];
        if (r.meal.checked && Number(r.meal.value) > r.meal.std) {
          return M_confirm({ type: 'warning', title: '提示', text: `第 ${i+1} 行 餐费补助金额不能超过标准 ${U.money(r.meal.std)}`, okText: '知道了' });
        }
        if (r.traffic.checked && Number(r.traffic.value) > r.traffic.std) {
          return M_confirm({ type: 'warning', title: '提示', text: `第 ${i+1} 行 交通补助金额不能超过标准 ${U.money(r.traffic.std)}`, okText: '知道了' });
        }
        if (r.comm.checked && Number(r.comm.value) > r.comm.std) {
          return M_confirm({ type: 'warning', title: '提示', text: `第 ${i+1} 行 通讯补助金额不能超过标准 ${U.money(r.comm.std)}`, okText: '知道了' });
        }
      }
      m.close();
      onSave && onSave(calendar);
    };

    return m;
  }

  window.M_subsidy = { open };
})();
