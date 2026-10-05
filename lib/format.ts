// 112350 → «112 350 ₸». Разряды расставляем сами, а не через Intl: сервер и браузер
// могут вставить разные виды пробела, и React выдаст ошибку гидрации
export function formatPrice(value: number) {
  return `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₸`
}
