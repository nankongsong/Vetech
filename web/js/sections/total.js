/* 费用合计分区 */

(function () {
  function render() {
    const state = STATE.get();
    const subs = state.subsidies;
    const total = subs.reduce((s, x) => s + Number(x.subsidyAmount || 0), 0);

    let meal = 0, traffic = 0, comm = 0;
    subs.forEach(s => {
      (s.calendar || []).forEach(r => {
        if (r.meal.checked) meal += Number(r.meal.value || 0);
        if (r.traffic.checked) traffic += Number(r.traffic.value || 0);
        if (r.comm.checked) comm += Number(r.comm.value || 0);
      });
    });

    const root = document.getElementById('total-body');
    root.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'total-grid';
    grid.innerHTML = `
      <div class="total-item"><span class="lbl">补助总金额</span><span class="val">${U.money(total)}</span></div>
      <div class="total-item"><span class="lbl">餐费补助</span><span class="val">${U.money(meal)}</span></div>
      <div class="total-item"><span class="lbl">交通补助</span><span class="val">${U.money(traffic)}</span></div>
      <div class="total-item"><span class="lbl">通讯补助</span><span class="val">${U.money(comm)}</span></div>
    `;
    root.appendChild(grid);
  }

  window.S_total = { render };
})();
