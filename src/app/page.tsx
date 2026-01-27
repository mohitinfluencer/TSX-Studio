import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#05070D',
      color: 'white',
      fontFamily: 'sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div style={{
        padding: '40px',
        borderRadius: '24px',
        border: '1px solid rgba(39, 242, 255, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#27F2FF' }}>TSX Studio Live 🚀</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: 0.8 }}>
          The production studio is active and routing correctly.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <Link href="/login" style={{
            padding: '12px 24px',
            backgroundColor: '#27F2FF',
            color: 'black',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Login
          </Link>
          <Link href="/signup" style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
