import { CheckCircle, Lock, Award } from 'lucide-react';

const items = [
  { num: '01', icon: CheckCircle, title: 'Verificação instantânea', desc: 'Qualquer pessoa escaneia o QR Code e vê o histórico completo do atleta em 0,3 segundos.' },
  { num: '02', icon: Lock, title: 'Imutável por criptografia', desc: 'Hash SHA-256 único por graduação. Ninguém pode alterar — nem a academia, nem nós.' },
  { num: '03', icon: Award, title: 'Passaporte vitalício', desc: 'O atleta leva o link para sempre. Troca de academia, fecha a escola — o passaporte permanece.' },
];

export function SolutionSection() {
  return (
    <section style={{ background: 'var(--color-bg-dark)' }}>
      <div className="fp-container" style={{ padding: 'var(--section-py) 0' }}>
        <div className="section-inner">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            A SOLUÇÃO
          </p>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.035em', lineHeight: 1.08, color: '#FFFFFF', maxWidth: 560, marginTop: 24, marginBottom: 64 }}>
            Um sprint para modernizar o jeito que sua academia certifica atletas.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 1 }}>
            {items.map((item) => (
              <div key={item.num} style={{ background: 'rgba(255,255,255,0.04)', padding: '40px 32px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.3)', marginBottom: 48 }}>{item.num}</p>
                <item.icon size={28} color="rgba(255,255,255,0.6)" />
                <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: 20, color: '#FFFFFF', letterSpacing: '-0.01em', marginTop: 24, marginBottom: 12 }}>{item.title}</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
