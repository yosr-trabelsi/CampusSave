const KEY = 'campussave_demo_orders'

export const getDemoOrders = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY)) || [] } catch { return [] }
}

export const saveDemoOrders = (list) => sessionStorage.setItem(KEY, JSON.stringify(list))

export const addDemoOrder = (order) => {
  const list = [order, ...getDemoOrders()]
  saveDemoOrders(list)
  return list
}