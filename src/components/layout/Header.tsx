import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { mainNavLinks } from '../../constants/navigation';
import { IconButton, SearchInput } from '../ui';
import { Logo } from './Logo';
import { CategoryNav } from './CategoryNav';
import { CartLink } from './CartLink';
import { AccountLink } from './AccountLink';
import { MobileMenu } from './MobileMenu';

export const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [search, setSearch] = useState('');
	const navigate = useNavigate();

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (search.trim()) {
			navigate(`/catalogo?buscar=${encodeURIComponent(search.trim())}`);
		}
	};

	return (
		<header className='sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur'>
			<div className='container flex items-center gap-4 py-3'>
				<IconButton
					icon={<FiMenu />}
					label='Abrir menú'
					className='lg:hidden'
					onClick={() => setIsMenuOpen(true)}
				/>

				<Logo />

				<nav className='hidden items-center gap-6 lg:flex'>
					{mainNavLinks.map(link => (
						<NavLink
							key={link.href}
							to={link.href}
							className={({ isActive }) =>
								`text-sm font-medium transition-colors ${
									isActive ? 'text-primary-700' : 'text-neutral-700 hover:text-primary-700'
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
					<CategoryNav />
				</nav>

				<form onSubmit={handleSearchSubmit} className='ml-auto hidden max-w-xs flex-1 md:block'>
					<SearchInput
						value={search}
						onChange={e => setSearch(e.target.value)}
						onClear={() => setSearch('')}
						placeholder='Buscar productos...'
					/>
				</form>

				<div className='ml-auto flex items-center gap-2 md:ml-0'>
					<AccountLink />
					<CartLink />
				</div>
			</div>

			<MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
		</header>
	);
};
