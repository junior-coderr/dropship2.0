import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold text-[#53D695]">cupidcart</span>
    </Link>
  );
}