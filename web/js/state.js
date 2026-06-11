/* 全局状态管理 */

window.STATE = (function () {
  // 初始默认演示数据
  const initial = {
    meta: {
      title: '差旅费用报销单',
      submitDate: '2026-04-23'
    },
    basic: {
      title: '徐年年项目出差',
      reimburser: '13AB3A3F72409002',          // 徐年年
      department: '',
      reimCompany: '',
      businessType: '1B5FEB7DD4396000',         // 项目出差
      reason: ''
    },
    trips: [
      {
        id: 't_1',
        reimburserId: '13AB3A3F72409002',      // 徐年年
        startCity: '10458',                    // 武汉
        endCity: '10119',                      // 北京
        startDate: '2026-04-13',
        endDate: '2026-04-17',
        description: '行程说明'
      }
    ],
    subsidies: [
      {
        id: 's_1',
        tripId: 't_1',
        reimburserId: '13AB3A3F72409002',
        startDate: '2026-04-13',
        endDate: '2026-04-17',
        days: 5,
        startCity: '10458',
        endCity: '10119',
        subsidyCity: '10119',
        applyAmount: 0.00,
        subsidyAmount: 0.00,
        calendar: []
      }
    ],
    allocation: [
      { id: 'a_1', company: '成本中心-管理层类', project: '', ratio: 1.0, amount: 0.00 }
    ],
    remark: '',
    ui: {
      collapsed: {
        basic: false,
        trip: false,
        subsidy: false,
        total: false,
        allocation: false,
        remark: false
      }
    }
  };

  const state = JSON.parse(JSON.stringify(initial));
  const listeners = new Set();

  function get() { return state; }

  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function emit() { listeners.forEach(fn => fn(state)); }

  function setBasic(patch) {
    Object.assign(state.basic, patch);
    emit();
  }

  function addTrip(trip) {
    const id = U.uid('t');
    state.trips.push({ id, ...trip });
    // 同步生成补助信息
    state.subsidies.push(buildSubsidyFromTrip(id, trip));
    emit();
  }

  function updateTrip(id, patch) {
    const idx = state.trips.findIndex(t => t.id === id);
    if (idx === -1) return;
    Object.assign(state.trips[idx], patch);
    // 同步补助信息
    const subIdx = state.subsidies.findIndex(s => s.tripId === id);
    if (subIdx !== -1) {
      state.subsidies[subIdx] = buildSubsidyFromTrip(id, state.trips[idx]);
    }
    emit();
  }

  function deleteTrip(id) {
    state.trips = state.trips.filter(t => t.id !== id);
    state.subsidies = state.subsidies.filter(s => s.tripId !== id);
    emit();
  }

  function copyTrip(id) {
    const src = state.trips.find(t => t.id === id);
    if (!src) return;
    const clone = U.clone(src);
    const newId = U.uid('t');
    clone.id = newId;
    // 时间范围保持不变
    state.trips.push(clone);
    state.subsidies.push(buildSubsidyFromTrip(newId, clone));
    emit();
  }

  function buildSubsidyFromTrip(tripId, trip) {
    return {
      id: U.uid('s'),
      tripId,
      reimburserId: trip.reimburserId,
      startDate: trip.startDate,
      endDate: trip.endDate,
      days: U.diffDays(trip.startDate, trip.endDate),
      startCity: trip.startCity,
      endCity: trip.endCity,
      subsidyCity: trip.endCity,
      applyAmount: 0.00,
      subsidyAmount: 0.00,
      calendar: buildDefaultCalendar(trip)
    };
  }

  function buildDefaultCalendar(trip) {
    const dates = U.dateRange(trip.startDate, trip.endDate);
    const mealStd = MOCK.cityMealStandard(trip.endCity);
    const trafficStd = MOCK.cityTrafficStandard();
    const commStd = MOCK.cityCommStandard();
    return dates.map(d => ({
      date: d,
      meal: { checked: false, std: mealStd, value: mealStd },
      traffic: { checked: false, std: trafficStd, value: trafficStd },
      comm: { checked: false, std: commStd, value: commStd }
    }));
  }

  function updateSubsidyCalendar(subId, calendar) {
    const sub = state.subsidies.find(s => s.id === subId);
    if (!sub) return;
    sub.calendar = calendar;
    // 重新计算申请金额和补助金额
    let apply = 0, actual = 0;
    calendar.forEach(row => {
      if (row.meal.checked) {
        apply += row.meal.std;
        actual += Number(row.meal.value || 0);
      }
      if (row.traffic.checked) {
        apply += row.traffic.std;
        actual += Number(row.traffic.value || 0);
      }
      if (row.comm.checked) {
        apply += row.comm.std;
        actual += Number(row.comm.value || 0);
      }
    });
    sub.applyAmount = apply;
    sub.subsidyAmount = actual;
    emit();
  }

  function setAllocation(list) {
    state.allocation = list;
    emit();
  }

  function setRemark(text) {
    state.remark = text;
    emit();
  }

  function togglePanel(key) {
    state.ui.collapsed[key] = !state.ui.collapsed[key];
    emit();
  }

  return {
    get, subscribe, emit,
    setBasic,
    addTrip, updateTrip, deleteTrip, copyTrip,
    updateSubsidyCalendar,
    setAllocation,
    setRemark,
    togglePanel
  };
})();
