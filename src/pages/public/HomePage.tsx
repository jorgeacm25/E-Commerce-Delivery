import {
	BenefitsSection,
	ContactSupportSection,
	CtaSection,
	DeliveryZonesSection,
	FaqSection,
	FamilyCombosSection,
	FeaturedCategoriesSection,
	GuaranteesSection,
	HeroSection,
	HowItWorksSection,
	PopularProductsSection,
	TestimonialsSection,
} from '../../components/home';
import { Reveal } from '../../components/ui';

// Reveal envuelve cada sección para que aparezca al hacer scroll
// (IntersectionObserver). El Hero se queda fuera: ya está visible al cargar.
export const HomePage = () => {
	return (
		<div className='flex flex-col gap-14 py-8'>
			<HeroSection />
			<Reveal>
				<FeaturedCategoriesSection />
			</Reveal>
			<Reveal>
				<FamilyCombosSection />
			</Reveal>
			<Reveal>
				<PopularProductsSection />
			</Reveal>
			<Reveal>
				<HowItWorksSection />
			</Reveal>
			<Reveal>
				<DeliveryZonesSection />
			</Reveal>
			<Reveal>
				<BenefitsSection />
			</Reveal>
			<Reveal>
				<GuaranteesSection />
			</Reveal>
			<Reveal>
				<TestimonialsSection />
			</Reveal>
			<Reveal>
				<FaqSection />
			</Reveal>
			<Reveal>
				<CtaSection />
			</Reveal>
			<Reveal>
				<ContactSupportSection />
			</Reveal>
		</div>
	);
};
