import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
            <p className="mb-8">Could not find requested resource</p>
            <Link href="/">
                <button className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    Return Home
                </button>
            </Link>
        </div>
    );
}
