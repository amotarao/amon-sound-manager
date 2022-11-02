import classNames from 'classnames';
import Link from 'next/link';

export type AppNavigationProps = {
  className?: string;
};

export const AppNavigation: React.FC<AppNavigationProps> = ({ className }) => {
  return (
    <nav className={classNames('flex h-full items-center border-b px-4', className)}>
      <Link href="/">amon sound manager</Link>
    </nav>
  );
};
