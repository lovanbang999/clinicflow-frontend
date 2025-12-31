import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>404 - Page Not Found</h1>
          <p>The page you are looking for does not exist.</p>
          <Link href={`/en`}>
            <p style={{ color: 'blue', textDecoration: 'underline' }}>
              Go back to Homepage
            </p>
          </Link>
        </div>
      </body>
    </html>
  );
}
