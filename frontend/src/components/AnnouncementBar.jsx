const MESSAGES = [
  'Free Delivery Across India',
  'Thousands Trust Our Premium Cases',
  '30-Day Easy Returns',
  'Cash on Delivery Available',
];

export default function AnnouncementBar() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div className="announcement-bar">
      <div className="announcement-track">
        {items.map((msg, i) => (
          <span key={i}>
            <svg viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>{' '}
            {msg}
          </span>
        ))}
      </div>
    </div>
  );
}
