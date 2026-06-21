import { useState, useEffect } from 'react';

/* Reusable pagination hook.
   resetKey: any string — when it changes (e.g. search/filter text) the page resets to 1.
   The page is also clamped, so removing items never leaves you on an empty page. */
export function usePagination(items, perPage = 5, resetKey) {
  const [page, setPage] = useState(1);
  useEffect(() => { setPage(1); }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = items.slice((safePage - 1) * perPage, safePage * perPage);

  return { pageItems, page: safePage, totalPages, setPage, total: items.length };
}

/* Pagination bar — renders nothing while everything fits on one page. */
export default function Pagination({ page, totalPages, onChange, shown, total, noun = 'مورد' }) {
  if (totalPages <= 1) return null;
  const fa = n => n.toLocaleString('fa-IR');

  return (
    <>
      <div className="pagination no-print">
        <button className="page-btn page-btn-nav" disabled={page === 1} onClick={() => onChange(page - 1)}>
          قبلی
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => onChange(p)}>
            {fa(p)}
          </button>
        ))}
        <button className="page-btn page-btn-nav" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          بعدی
        </button>
      </div>
      <div className="page-result-count no-print">
        نمایش {fa(shown)} از {fa(total)} {noun} — صفحه {fa(page)} از {fa(totalPages)}
      </div>
    </>
  );
}
