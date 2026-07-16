export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 mr-3" />
      {label}
    </div>
  );
}
