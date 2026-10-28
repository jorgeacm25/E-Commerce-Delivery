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
import { Reveal, ScrollZoomStage } from '../../components/ui';

// Reveal envuelve cada sección para que aparezca cada vez que entra al
// hacer scroll (hacia abajo o hacia arriba). El hero y las categorías van en
// ScrollZoomStage: el hero se acerca a la pantalla y las categorías se abren
// desde el centro con el zoom inverso (ya tienen su propia animación).
export const HomePage = () => {
	return (
		<div className='flex flex-col gap-14 pb-8'>
			<ScrollZoomStage
				className='-mb-14'
				hero={<HeroSection />}
				next={<FeaturedCategoriesSection />}
			/>
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
