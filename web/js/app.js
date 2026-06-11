/* 应用入口与初始化 */

(function () {
  // 防止重复渲染时丢失输入焦点
  function captureFocus(root) {
    const ae = document.activeElement;
    if (!ae || ae === document.body) return null;
    if (!root.contains(ae)) return null;
    return {
      tag: ae.tagName,
      id: ae.id,
      name: ae.name,
      dataset: { ...ae.dataset },
      selectionStart: ae.selectionStart,
      selectionEnd: ae.selectionEnd,
      className: ae.className
    };
  }
  function restoreFocus(root, info) {
    if (!info) return;
    let el = null;
    if (info.id) el = root.querySelector('#' + info.id);
    if (!el && info.dataset && Object.keys(info.dataset).length) {
      const ds = info.dataset;
      const keys = Object.keys(ds);
      const sel = keys.map(k => `[data-${k}="${ds[k]}"]`).join('');
      el = root.querySelector(sel);
    }
    if (!el && info.name) el = root.querySelector(`[name="${info.name}"]`);
    if (!el) {
      el = root.querySelector('input:focus, textarea:focus, select:focus') || root.querySelector('input, textarea, select');
    }
    if (el) {
      try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); }
      if (info.selectionStart != null && el.setSelectionRange) {
        try { el.setSelectionRange(info.selectionStart, info.selectionEnd); } catch (e) {}
      }
    }
  }

  // 分区级渲染：只渲染需要更新的部分，避免破坏当前输入
  function renderAll(opts) {
    const focusInfo = captureFocus(document.body);
    const except = (opts && opts.except) || new Set();

    // 自动推断：如果当前焦点在某个分区内，且该分区由用户输入触发重渲染，则跳过该分区
    if (focusInfo) {
      const ae = document.activeElement;
      if (ae && document.body.contains(ae)) {
        if (document.getElementById('basic-body').contains(ae)) except.add('basic');
        if (document.getElementById('remark-body').contains(ae)) except.add('remark');
        if (document.getElementById('allocation-body').contains(ae)) except.add('allocation');
      }
    }

    if (!except.has('basic')) S_basicInfo.render();
    if (!except.has('trip')) S_trip.render();
    if (!except.has('subsidy')) S_subsidy.render();
    if (!except.has('total')) S_total.render();
    if (!except.has('allocation')) S_allocation.render();
    if (!except.has('remark')) S_remark.render();
    if (focusInfo) restoreFocus(document.body, focusInfo);
  }

  // 分区折叠
  document.querySelectorAll('.panel-header').forEach(h => {
    h.addEventListener('click', (e) => {
      // 防止点击按钮时触发折叠
      if (e.target.closest('button')) return;
      const key = h.dataset.toggle;
      if (!key) return;
      STATE.togglePanel(key);
      const panel = h.closest('.panel');
      panel.classList.toggle('collapsed', STATE.get().ui.collapsed[key]);
    });
  });

  // 提交
  document.getElementById('btnSubmit').addEventListener('click', () => {
    const s = STATE.get();
    // 校验
    if (!s.basic.title) return M_confirm({ type: 'warning', title: '提示', text: '请填写报销标题', okText: '知道了' });
    if (!s.basic.reimburser) return M_confirm({ type: 'warning', title: '提示', text: '请选择报销人', okText: '知道了' });
    if (!s.basic.businessType) return M_confirm({ type: 'warning', title: '提示', text: '请选择业务类型', okText: '知道了' });
    if (s.trips.length === 0) return M_confirm({ type: 'warning', title: '提示', text: '请至少补录一条行程', okText: '知道了' });

    // 分摊比例合计 = 100%
    const ratioSum = s.allocation.reduce((sum, r) => sum + Number(r.ratio || 0), 0);
    if (Math.round(ratioSum * 100) / 100 !== 1) {
      return M_confirm({ type: 'warning', title: '提示', text: '分摊比例合计必须为 100%', okText: '知道了' });
    }

    // 分摊金额合计 = 补助总金额
    const subTotal = s.subsidies.reduce((sum, x) => sum + Number(x.subsidyAmount || 0), 0);
    const allocAmount = s.allocation.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    if (Math.abs(subTotal - allocAmount) > 0.01) {
      return M_confirm({ type: 'warning', title: '提示', text: `分摊金额合计(${U.money(allocAmount)})必须等于补助总金额(${U.money(subTotal)})`, okText: '知道了' });
    }

    M_confirm({
      type: 'info',
      title: '提交成功',
      text: '提交成功！',
      okText: '确认',
      onOk: () => { window.close(); }
    });
  });

  // 关闭
  document.getElementById('btnClose').addEventListener('click', () => {
    M_confirm({
      type: 'warning',
      title: '确认关闭',
      text: '确定要关闭当前页面吗？',
      onOk: () => { window.close(); }
    });
  });

  // 订阅状态变化
  STATE.subscribe(() => {
    renderAll();
  });

  // 首次渲染
  renderAll();
})();
