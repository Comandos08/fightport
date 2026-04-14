import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'A escola cadastra seus atletas',
    desc: 'Nome completo, foto e dados únicos. O sistema garante que não há duplicatas.',
  },
  {
    num: '02',
    title: 'Registra a graduação e recebe os elementos',
    desc: 'Hash SHA-256 e QR Code de alta resolução, prontos para o certificado físico da academia.',
  },
  {
    num: '03',
    title: 'Qualquer pessoa verifica em segundos',
    desc: 'Escaneia o QR, cai na página pública do atleta. Imutável. Verificável. Para sempre.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-28 lg:py-32 px-4 bg-surface">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-10">
          <h2 className="font-display font-bold text-[40px] md:text-[48px] text-ink uppercase" style={{ lineHeight: '1' }}>
            Como funciona
          </h2>
          <p className="font-body text-lg text-ink-muted mt-2 md:mt-0">
            Simples para a academia. Poderoso para a credibilidade.
          </p>
        </div>

        <div className="w-full h-px mb-12" style={{ backgroundColor: 'var(--color-border)' }} />

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              {i > 0 && <div className="w-full h-px my-0" style={{ backgroundColor: 'var(--color-border)' }} />}
              <div className="flex items-start gap-8 md:gap-12 py-10">
                <span
                  className="font-display font-extrabold text-[64px] md:text-[80px] leading-none shrink-0"
                  style={{ color: 'rgba(200,241,53,0.6)' }}
                >
                  {step.num}
                </span>
                <div className="pt-3">
                  <h3 className="font-body font-medium text-xl text-ink mb-2">{step.title}</h3>
                  <p className="font-body text-[15px] text-ink-muted max-w-lg" style={{ lineHeight: '1.6' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
