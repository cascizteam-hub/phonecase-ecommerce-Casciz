export default function Loader({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: 'var(--text-light)', gap: 12 }}>
      <div
        style={{
          height: 22,
          width: 22,
          borderRadius: '50%',
          border: '3px solid var(--green-100)',
          borderTopColor: 'var(--green-500)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
