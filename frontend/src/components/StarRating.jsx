export default function StarRating({ rating = 0, count }) {
  const filled = Math.round(rating);
  return (
    <div className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          style={{ fill: i < filled ? '#f4c430' : '#e0e0e0' }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {typeof count === 'number' && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginLeft: 6 }}>({count})</span>
      )}
    </div>
  );
}
