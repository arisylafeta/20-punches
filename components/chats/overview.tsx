import { motion } from 'framer-motion';
import Link from 'next/link';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="flex min-h-[80vh] items-center justify-center w-full px-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-bold">Welcome to 20Punches</h1>
        <p className="text-lg">
          Engage in insightful conversations with the legendary Warren Buffett AI. Gain wisdom from decades of investment experience and business acumen.
        </p>
        <p className="text-lg">
          Our AI-powered chatbot brings the Oracle of Omaha&lsquo;s principles to life, offering:
        </p>
        <ul className="text-left list-disc list-inside">
          <li>Investment strategies and advice</li>
          <li>Business analysis and insights</li>
          <li>Warren&apos;s folksy wisdom and anecdotes</li>
          <li>Long-term financial planning guidance</li>
        </ul>
        <p className="text-lg">
          Whether you&apos;re a seasoned investor or just starting out, 20Punches provides a unique opportunity to learn from one of the world&apos;s most successful investors.
        </p>
        <p className="text-lg font-semibold">
          Start your conversation with Warren Buffett AI and punch up your investment knowledge today!
        </p>
      </div>
    </motion.div>
  );
};
