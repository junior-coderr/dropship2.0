export function LoadingState() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#53D695] animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-4 h-4 rounded-full bg-[#53D695] animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-4 h-4 rounded-full bg-[#53D695] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
