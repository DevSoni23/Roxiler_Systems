function AuthLayout({ title, children }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        background: 'var(--surface)',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow)',
        width: '380px',
      }}>
        <h2 style={{ marginBottom: '24px', fontSize: '22px' }}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;