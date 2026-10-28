import { motion } from 'motion/react';
import { ease } from '../../lib/motion';
import { Fragment, type ReactNode } from 'react';
import { useChapter } from '../../lib/chapter';

/** Fades content up once as it enters the viewport. Respects reduced motion via <MotionConfig>. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'header';
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, ease: ease.out, delay }}
    >
      {children}
    </M>
  );
}

const headVariants = { hidden: {}, shown: { transition: { staggerChildren: 0.045 } } };
const wordVariants = {
  hidden: { y: '105%', opacity: 0 },
  shown: { y: '0%', opacity: 1, transition: { duration: 0.75, ease: ease.out } },
};
const fadeVariants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.out } },
};

/** A string title rises word by word from behind a mask; other titles fade up as a block. */
function Words({ text }: { text: string }) {
  const words = text.split(' ');
  return words.map((w, i) => (
    <Fragment key={i}>
      <span className="word-mask">
        <motion.span className="word" variants={wordVariants}>
          {w}
        </motion.span>
      </span>
      {i < words.length - 1 && ' '}
    </Fragment>
  ));
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  id: string;
}) {
  const chapter = useChapter();
  return (
    <motion.header
      className="section-head"
      variants={headVariants}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
    >
      <motion.p className="eyebrow" variants={fadeVariants}>
        {chapter && (
          <span className="eyebrow-num" aria-hidden="true">
            {chapter}
          </span>
        )}
        {eyebrow}
      </motion.p>
      <h2 className="h2" id={id}>
        {typeof title === 'string' ? <Words text={title} /> : <motion.span variants={fadeVariants}>{title}</motion.span>}
      </h2>
      {lead && (
        <motion.p className="lead" variants={fadeVariants}>
          {lead}
        </motion.p>
      )}
    </motion.header>
  );
}
