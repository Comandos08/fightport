import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="py-32 lg:py-36 px-4 bg-dark relative overflow-hidden">
      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.03 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ctaGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ctaGrid)" />
        </svg>
      </div>

      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="font-display font-extrabold text-[64px] md:text-[96px] mb-6"
            style={{ color: '#FFFFFF', lineHeight: '0.88' }}
          >
            SUA ACADEMIA<br />
            <span className="relative inline-block">
              MERECE ISSO.
              <span
                className="absolute bottom-0 left-0 w-full"
                style={{ height: '3px', backgroundColor: 'var(--color-accent)', bottom: '-4px' }}
              />
            </span>
          </h2>

          <p className="font-body text-lg mb-10" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Cadastro gratuito. Você só paga quando graduar.
          </p>

          <Link to="/cadastro">
            <Button
              className="font-body font-semibold text-base px-12 py-5 h-auto rounded-lg transition-all duration-200 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-ink)' }}
            >
              Cadastre sua escola
            </Button>
          </Link>

          <p className="mt-6 font-body text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sem cartão de crédito · Sem contrato · Cancele quando quiser
          </p>
        </motion.div>
      </div>
    </section>
  );
}
