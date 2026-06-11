/* 补录行程弹窗 */

(function () {
  /**
   * 打开补录行程弹窗
   * @param {object} opts
   *   - mode: 'add' | 'edit' | 'copy'
   *   - data: 初始数据
   *   - excludeId: 校验重复时排除自己（编辑/复制）
   *   - onSave: (data) => void
   */
  function open(opts) {
    const { mode = 'add', data = {}, excludeId = null, onSave } = opts;
    const titleMap = { add: '补录行程', edit: '编辑行程', copy: '复制行程' };

    const initial = {
      reimburserId: data.reimburserId || (STATE.get().basic.reimburser || ''),
      startCity: data.startCity || '',
      endCity: data.endCity || '',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      description: data.description || ''
    };

    const content = document.createElement('div');

    // 提示信息
    const tip = document.createElement('div');
    tip.className = 'tip-box';
    tip.innerHTML = '<b>提示：</b>仅可补录未从申请单带入或未产生费用的行程信息<br>跨天跨城行程填写说明：<br>出发城市-到达城市：武汉-北京；出发日期-到达日期：1号-5号；1号~5号补助按到达城市（北京）匹配。';
    content.appendChild(tip);

    // 出行人
    const row1 = document.createElement('div');
    row1.className = 'modal-form-row';
    const lbl1 = document.createElement('span');
    lbl1.className = 'form-label';
    lbl1.innerHTML = '出行人<span class="req">*</span>';
    row1.appendChild(lbl1);
    const sel1 = C.createSelect({
      placeholder: '请选择',
      options: MOCK.employees.map(e => ({ id: e.reimburserId, name: `${e.reimburserName}/${e.reimburserNo}` })),
      value: initial.reimburserId,
      onChange: (v) => { initial.reimburserId = v; }
    });
    row1.appendChild(sel1.wrap);
    content.appendChild(row1);

    // 出发/到达城市
    const row2 = document.createElement('div');
    row2.className = 'modal-form-row';
    const lbl2 = document.createElement('span');
    lbl2.className = 'form-label';
    lbl2.innerHTML = '出发城市<span class="req">*</span>';
    row2.appendChild(lbl2);
    const cityOpts = MOCK.cities.map(c => ({ id: c.cityNo, name: c.cityName }));
    const sel2 = C.createSelect({
      placeholder: '请选择',
      options: cityOpts,
      value: initial.startCity,
      onChange: (v) => { initial.startCity = v; }
    });
    row2.appendChild(sel2.wrap);
    content.appendChild(row2);

    const row3 = document.createElement('div');
    row3.className = 'modal-form-row';
    const lbl3 = document.createElement('span');
    lbl3.className = 'form-label';
    lbl3.innerHTML = '到达城市<span class="req">*</span>';
    row3.appendChild(lbl3);
    const sel3 = C.createSelect({
      placeholder: '请选择',
      options: cityOpts,
      value: initial.endCity,
      onChange: (v) => { initial.endCity = v; }
    });
    row3.appendChild(sel3.wrap);
    content.appendChild(row3);

    // 出发/到达日期
    function makeDateInput(value) {
      const wrap = document.createElement('div');
      wrap.className = 'form-control';
      const i = document.createElement('input');
      i.type = 'date';
      i.value = value || '';
      wrap.appendChild(i);
      return { wrap, input: i };
    }
    const row4 = document.createElement('div');
    row4.className = 'modal-form-row';
    const lbl4 = document.createElement('span');
    lbl4.className = 'form-label';
    lbl4.innerHTML = '出发日期<span class="req">*</span>';
    row4.appendChild(lbl4);
    const date1 = makeDateInput(initial.startDate);
    row4.appendChild(date1.wrap);
    content.appendChild(row4);

    const row5 = document.createElement('div');
    row5.className = 'modal-form-row';
    const lbl5 = document.createElement('span');
    lbl5.className = 'form-label';
    lbl5.innerHTML = '到达日期<span class="req">*</span>';
    row5.appendChild(lbl5);
    const date2 = makeDateInput(initial.endDate);
    row5.appendChild(date2.wrap);
    content.appendChild(row5);

    // 行程说明
    const row6 = document.createElement('div');
    row6.className = 'modal-form-row';
    const lbl6 = document.createElement('span');
    lbl6.className = 'form-label';
    lbl6.innerHTML = '行程说明<span class="req">*</span>';
    row6.appendChild(lbl6);
    const descWrap = document.createElement('div');
    descWrap.className = 'form-control textarea';
    descWrap.style.width = '100%';
    descWrap.style.maxWidth = '560px';
    const descI = document.createElement('textarea');
    descI.rows = 3;
    descI.maxLength = 500;
    descI.value = initial.description;
    descI.placeholder = '请输入';
    descWrap.appendChild(descI);
    row6.appendChild(descWrap);
    content.appendChild(row6);

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

    const m = C.openModal({ title: titleMap[mode], content, footer });

    cancelBtn.onclick = () => m.close();

    function showError(text) {
      // 简单提示
      M_confirm({ type: 'warning', title: '提示', text, okText: '知道了', onOk: () => {} });
    }

    okBtn.onclick = () => {
      const startDate = date1.input.value;
      const endDate = date2.input.value;
      const desc = descI.value.trim();
      const data2 = {
        reimburserId: initial.reimburserId,
        startCity: initial.startCity,
        endCity: initial.endCity,
        startDate, endDate,
        description: desc
      };

      // 校验
      if (!data2.reimburserId) return showError('请选择出行人');
      if (!data2.startCity) return showError('请选择出发城市');
      if (!data2.endCity) return showError('请选择到达城市');
      if (!startDate) return showError('请选择出发日期');
      if (!endDate) return showError('请选择到达日期');
      if (U.parseDate(endDate) < U.parseDate(startDate)) return showError('到达日期不可早于出发日期');
      const today = U.fmtDate(new Date());
      if (endDate > today) return showError('到达日期不可晚于当前日期');
      if (!desc) return showError('请输入行程说明');

      // 人员+日期范围重复校验
      const trips = STATE.get().trips;
      const conflict = trips.find(t => {
        if (t.id === excludeId) return false;
        if (t.reimburserId !== data2.reimburserId) return false;
        // 日期区间重叠
        return !(U.parseDate(endDate) < U.parseDate(t.startDate) || U.parseDate(startDate) > U.parseDate(t.endDate));
      });
      if (conflict) {
        const emp = MOCK.employees.find(e => e.reimburserId === data2.reimburserId);
        return showError(`出行人 ${emp ? emp.reimburserName : ''} 在 ${conflict.startDate} 至 ${conflict.endDate} 已存在行程，不可重复`);
      }

      m.close();
      onSave && onSave(data2);
    };

    return m;
  }

  window.M_trip = { open };
})();
