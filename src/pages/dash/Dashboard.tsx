export default function DashDashboard() {
  return (
    <div style={{ padding: '32px' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display, var(--font-sans))',
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 8,
        }}
      >
        Dashboard
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 14,
          color: 'var(--color-text-muted)',
        }}
      >
        Dashboard em construção
      </p>
    </div>
  );
}
