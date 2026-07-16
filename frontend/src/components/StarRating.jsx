export default function StarRating({ rating = 0, count }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1 text-sm">
      <div className="flex text-amber-400">
        {stars.map((s) => (
          <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>
        ))}
      </div>
      {typeof count === 'number' && <span className="text-gray-500">({count})</span>}
    </div>
  );
}
