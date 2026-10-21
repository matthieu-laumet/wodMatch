import { useCallback, useRef, useState } from 'react';
import ConfirmSheet from '@/components/ConfirmSheet';

type Options = { message: string; confirmLabel?: string; cancelLabel?: string };

export function useConfirmSheet() {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<Options>({ message: '' }); // conservé pendant le fade-out
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback(
    (options: Options) =>
      new Promise<boolean>(resolve => {
        resolver.current = resolve;
        setOpts(options);
        setVisible(true);
      }),
    [],
  );

  const close = (value: boolean) => {
    setVisible(false);
    resolver.current?.(value);
    resolver.current = null;
  };

  const sheet = (
    <ConfirmSheet
      visible={visible}
      message={opts.message}
      confirmLabel={opts.confirmLabel ?? 'Confirmer'}
      cancelLabel={opts.cancelLabel ?? 'Annuler'}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, sheet };
}