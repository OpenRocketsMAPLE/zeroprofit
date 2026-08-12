// Buttons — neo-brutalist offset shadows (Press `.solid-button` parity).

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'rust' | 'navy' | 'forest' | 'ghost' | 'danger' | 'default';
export type ButtonSize = 'sm' | 'md' | 'lg';

function btnClass(variant: ButtonVariant, size: ButtonSize, block?: boolean, extra = ''): string {
  return ['btn', `btn--${variant}`, size !== 'md' ? `btn--${size}` : '', block ? 'btn--block' : '', extra]
    .filter(Boolean)
    .join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function Button({ variant = 'default', size = 'md', block, className, ...rest }: ButtonProps) {
  return <button className={btnClass(variant, size, block, className)} {...rest} />;
}

interface ButtonLinkBase {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ to, href, variant = 'default', size = 'md', block, className, children, ...rest }: ButtonLinkBase & { to?: string; href?: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = btnClass(variant, size, block, className);
  if (href) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={cls} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a className={cls} {...rest}>
      {children}
    </a>
  );
}
