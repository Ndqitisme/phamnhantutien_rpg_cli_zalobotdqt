/**
 * TextSearch.js
 * Tiện ích chuẩn hóa và tìm kiếm gần đúng cho tiếng Việt
 */

/**
 * Chuẩn hóa chuỗi: bỏ dấu, hạ chữ, thay đ->d, gom khoảng trắng
 * @param {string} str
 * @returns {string}
 */
export function normalizeKeyword(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Kiểm tra khớp theo chuỗi prefix của từng từ theo thứ tự
 * Ví dụ query "thanh ng" khớp "thanh nguu tran"
 * @param {string} candidate
 * @param {string} query
 * @returns {boolean}
 */
export function isPrefixSequenceMatch(candidate, query) {
  const nameTokens = normalizeKeyword(candidate).split(" ").filter(Boolean);
  const kwTokens = normalizeKeyword(query).split(" ").filter(Boolean);
  if (kwTokens.length === 0) return false;
  let i = 0;
  for (const t of nameTokens) {
    if (t.startsWith(kwTokens[i])) i++;
    if (i >= kwTokens.length) return true;
  }
  return false;
}

/**
 * Tính điểm tương đồng đơn giản giữa candidate và query (đã chuẩn hóa)
 * @param {string} candidate
 * @param {string} query
 * @returns {number} score 0..100
 */
export function similarityScore(candidate, query) {
  const a = normalizeKeyword(candidate);
  const b = normalizeKeyword(query);
  if (!a || !b) return 0;
  if (a === b) return 100;
  if (a.includes(b)) return 85;
  if (isPrefixSequenceMatch(a, b)) return 75;
  return 0;
}

/**
 * Lọc danh sách theo fuzzy và sắp xếp theo điểm giảm dần
 * @template T
 * @param {T[]} items
 * @param {(item:T)=>string} getText
 * @param {string} query
 * @param {number} minScore
 * @returns {Array<{item:T, score:number}>}
 */
export function fuzzyFilter(items, getText, query, minScore = 1) {
  const scored = [];
  for (const it of items) {
    const s = similarityScore(getText(it) || "", query || "");
    if (s >= minScore) scored.push({ item: it, score: s });
  }
  scored.sort((x, y) => y.score - x.score);
  return scored;
}

/**
 * Tìm phần tử tốt nhất theo fuzzy
 * @template T
 * @param {T[]} items
 * @param {(item:T)=>string} getText
 * @param {string} query
 * @returns {T|null}
 */
export function fuzzyFindBest(items, getText, query) {
  const list = fuzzyFilter(items, getText, query, 1);
  return list.length ? list[0].item : null;
}

/**
 * Tìm theo id (exact, không phân biệt hoa thường) hoặc theo tên (fuzzy)
 * @template T
 * @param {T[]} items
 * @param {string} query
 * @param {{ getId:(item:T)=>string, getName:(item:T)=>string, minScore?:number }} opts
 * @returns {{item:T, score:number}|null}
 */
export function findByIdOrNameFuzzy(items, query, opts) {
  const { getId, getName, minScore = 1 } = opts || {};
  if (!Array.isArray(items) || !getId || !getName) return null;
  const q = String(query || "");
  // Exact by id
  const exact = items.find((it) => String(getId(it)).toLowerCase() === q.toLowerCase());
  if (exact) return { item: exact, score: 100 };
  // Fuzzy by name
  const list = fuzzyFilter(items, getName, q, minScore);
  return list.length ? list[0] : null;
}

/**
 * Tìm nhiều theo tên (fuzzy) trả về danh sách ứng viên kèm điểm
 * @template T
 * @param {T[]} items
 * @param {string} query
 * @param {{ getName:(item:T)=>string, minScore?:number, limit?:number }} opts
 * @returns {Array<{item:T, score:number}>}
 */
export function findAllByNameFuzzy(items, query, opts) {
  const { getName, minScore = 1, limit = 8 } = opts || {};
  if (!Array.isArray(items) || !getName) return [];
  const list = fuzzyFilter(items, getName, query, minScore);
  return list.slice(0, limit);
}

/**
 * Tìm theo id (exact, không phân biệt hoa thường) hoặc theo tên (fuzzy)
 */
export function findByIdOrName(object, nameOrId) {
  if (!object || object.length === 0) return null;
  const q = String(nameOrId || "");
  let found = object.find((it) => String(it.id).toLowerCase() === q.toLowerCase());
  if (found) return found;
  const qNorm = normalizeKeyword(q);
  found = object.find((it) => normalizeKeyword(it.name) === qNorm);
  return found;
}
