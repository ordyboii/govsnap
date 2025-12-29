import './Header.scss';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <h1 className="header__title">{title}</h1>
    </header>
  );
}
