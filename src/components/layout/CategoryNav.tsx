import { NavLink, useNavigate } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { placeholderCategories } from '../../constants/navigation';
import { Dropdown } from '../ui';

export const CategoryNav = () => {
	const navigate = useNavigate();

	return (
		<Dropdown
			trigger={
				<span className='inline-flex items-center gap-1 text-sm font-medium text-white/85 transition-colors hover:text-white'>
					Categorías
					<FiChevronDown aria-hidden='true' />
				</span>
			}
			items={placeholderCategories.map(category => ({
				value: category.slug,
				label: category.label,
			}))}
			onSelect={slug => navigate(`/categoria/${slug}`)}
		/>
	);
};

interface CategoryLinksProps {
	className?: string;
	onNavigate?: () => void;
}

// Variante en lista, pensada para el menú móvil
export const CategoryLinksList = ({ className, onNavigate }: CategoryLinksProps) => {
	return (
		<ul className={className}>
			{placeholderCategories.map(category => (
				<li key={category.slug}>
					<NavLink
						to={`/categoria/${category.slug}`}
						onClick={onNavigate}
						className={({ isActive }) =>
							`block rounded-lg px-3 py-2 text-sm font-medium ${
								isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-100'
							}`
						}
					>
						{category.label}
					</NavLink>
				</li>
			))}
		</ul>
	);
};
