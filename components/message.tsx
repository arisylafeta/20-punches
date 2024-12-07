import type { Message } from 'ai';
import cx from 'classnames';
import { motion } from 'framer-motion';
import { SparklesIcon } from './icons';
import { Markdown } from './markdown';

export const PreviewMessage = ({
  message,
  isLoading,
}: {
  message: Message;
  isLoading: boolean;
}) => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={cx(
          'flex gap-4 rounded-xl p-4',
          message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto w-fit' : 'bg-muted'
        )}
      >
        {message.role === 'assistant' && (
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Markdown>{message.content as string}</Markdown>
          {isLoading && (
            <div className="text-sm text-muted-foreground">
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThinkingMessage = () => (
  <motion.div
    className="w-full mx-auto max-w-3xl px-4"
    initial={{ y: 5, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
  >
    <div className="flex gap-4 rounded-xl p-4 bg-muted">
      <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
        <SparklesIcon size={14} />
      </div>
      <div className="text-sm text-muted-foreground">
        Thinking...
      </div>
    </div>
  </motion.div>
);