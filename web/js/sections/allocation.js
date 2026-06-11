/* 费用归属及分摊分区 */

(function () {
  // 防止 render 内部触发 setAllocation 引发循环
  let rendering = false;

  function render() {
    if (rendering) return;
    rendering = true;
    try {
      _doRender();
    } finally {
      rendering = false;
    }
  }

  function _doRender() {
    const state = STATE.get();
    const list = state.allocation;

    // 计算补助总金额
    const subs = state.subsidies;
    const total = subs.reduce((s, x) => s + Number(x.subsidyAmount || 0), 0);
    const allocTotalEl = document.getElementById('allocTotal');
    if (allocTotalEl) allocTotalEl.textContent = U.money(total);

    // 重新计算各行金额（仅修改本地 list，不触发状态更新）
    list.forEach((row, i) => {
      if (i === 0) {
        // 第 1 行比例 = 1 - ∑(第 2+ 行)
        const rest = list.slice(1).reduce((s, r) => s + Number(r.ratio || 0), 0);
        let ratio = Math.max(0, Math.min(1, 1 - rest));
        // 保留两位小数
        ratio = Math.round(ratio * 100) / 100;
        row.ratio = ratio;
      }
      row.amount = Math.round(total * Number(row.ratio || 0) * 100) / 100;
    });

    const root = document.getElementById('allocation-body');
    root.innerHTML = '';

    const wrap = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'table';

    const rowsHtml = list.map((row, i) => {
      const isFirst = i === 0;
      return `
        <tr data-idx="${i}">
          <td class="col-index">${i + 1}</td>
          <td>${U.esc(row.company || '')}</td>
          <td>${U.esc(row.project || '-')}</td>
          <td class="right">
            <div class="form-control" style="display:inline-flex;min-width:110px;${isFirst ? 'background:#f5f7fa;' : ''}">
              <input type="number" min="0" max="100" step="0.01" value="${(row.ratio * 100).toFixed(2)}" ${isFirst ? 'readonly' : ''} data-act="ratio" />
              <span class="arrow">%</span>
            </div>
          </td>
          <td class="right">
            <div class="form-control" style="display:inline-flex;min-width:110px;${isFirst ? 'background:#f5f7fa;' : ''}">
              <input type="number" min="0" step="0.01" value="${U.money(row.amount)}" readonly data-act="amount" />
            </div>
          </td>
          <td class="col-action">
            <span class="op-icon" data-act="del" data-idx="${i}" title="删除">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </span>
          </td>
        </tr>
      `;
    }).join('');

    // 合计
    const sumRatio = list.reduce((s, r) => s + Number(r.ratio || 0), 0);
    const sumAmount = list.reduce((s, r) => s + Number(r.amount || 0), 0);

    table.innerHTML = `
      <thead>
        <tr>
          <th class="col-index">序号</th>
          <th>费用归属<span class="req">*</span></th>
          <th>项目</th>
          <th class="right">分摊比例<span class="req">*</span></th>
          <th class="right">分摊金额</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
        ${list.length === 0 ? `<tr><td colspan="6" class="no-data">暂无数据</td></tr>` : rowsHtml}
        <tr class="summary-row">
          <td colspan="3" class="right">合计</td>
          <td class="right">${(sumRatio * 100).toFixed(2)}%</td>
          <td class="right">CNY ${U.money(sumAmount)}</td>
          <td></td>
        </tr>
      </tbody>
    `;
    wrap.appendChild(table);

    // 添加一行按钮
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-link-add';
    addBtn.innerHTML = '<span style="color:#1d6fd8;">+ 添加一行</span>';
    addBtn.addEventListener('click', () => {
      const cur = STATE.get().allocation;
      cur.push({ id: U.uid('a'), company: '', project: '', ratio: 0, amount: 0 });
      STATE.setAllocation(cur);
      S_allocation.render();
    });
    wrap.appendChild(addBtn);

    root.appendChild(wrap);

    // 绑定比例输入
    table.querySelectorAll('input[data-act="ratio"]').forEach(inp => {
      if (inp.readOnly) return;
      inp.addEventListener('input', () => {
        const tr = inp.closest('tr');
        const idx = Number(tr.dataset.idx);
        let v = Number(inp.value || 0);
        if (v < 0) v = 0;
        if (v > 100) v = 100;
        // 计算第 2+ 行总和
        const list2 = STATE.get().allocation;
        // 当前行先按 0~1 存储
        list2[idx].ratio = v / 100;
        // 校验总和
        const rest = list2.slice(1).reduce((s, r, i) => {
          if (i === idx - 1) return s;
          return s + Number(r.ratio || 0);
        }, 0);
        if (rest + v / 100 > 1) {
          // 超限：清空
          inp.value = '';
          list2[idx].ratio = 0;
        }
        STATE.setAllocation(list2);
        S_allocation.render();
      });
    });

    // 删除
    table.querySelectorAll('.op-icon[data-act="del"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(el.dataset.idx);
        const cur = STATE.get().allocation;
        if (cur.length === 1) {
          M_confirm({ type: 'warning', title: '提示', text: '至少保留一条分摊信息', okText: '知道了' });
          return;
        }
        M_confirm({
          type: 'warning',
          title: '确认删除',
          text: '确定要删除该分摊信息吗？',
          onOk: () => {
            const list2 = STATE.get().allocation.filter((_, i) => i !== idx);
            STATE.setAllocation(list2);
            S_allocation.render();
          }
        });
      });
    });

    // 暴露均摊到顶部操作区（如需要可以挂到 panel-extra 按钮上）
  }

  /** 均摊按钮逻辑（从外部调用） */
  function average() {
    const cur = STATE.get().allocation;
    if (cur.length === 0) return;
    const avg = 1 / cur.length;
    const base = Math.floor(avg * 10000) / 10000; // 保留四位
    const remainder = Math.round((1 - base * cur.length) * 100) / 100;
    cur.forEach((r, i) => {
      r.ratio = i === 0 ? Math.round((base + remainder) * 100) / 100 : base;
    });
    STATE.setAllocation(cur);
    render();
  }

  // 在 panel header 旁边加一个均摊按钮
  const allocHeader = document.querySelector('#panel-allocation .panel-header');
  const extra = document.createElement('div');
  extra.className = 'panel-extra';
  const avgBtn = document.createElement('button');
  avgBtn.className = 'btn-text';
  avgBtn.innerHTML = '均摊';
  avgBtn.style.marginRight = '8px';
  avgBtn.addEventListener('click', (e) => { e.stopPropagation(); average(); });
  extra.appendChild(avgBtn);
  // 插入到 toggle 之前
  allocHeader.insertBefore(extra, allocHeader.querySelector('.panel-toggle'));

  window.S_allocation = { render, average };
})();
