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

export const HomePage = () => {
	return (
		<div className='flex flex-col gap-14 py-8'>
			<HeroSection />
			<FeaturedCategoriesSection />
			<FamilyCombosSection />
			<PopularProductsSection />
			<HowItWorksSection />
			<DeliveryZonesSection />
			<BenefitsSection />
			<GuaranteesSection />
			<TestimonialsSection />
			<FaqSection />
			<CtaSection />
			<ContactSupportSection />
		</div>
	);
};
