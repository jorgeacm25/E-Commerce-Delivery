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
//
// Las categorías van centradas en una capa del alto de la pantalla, así que
// debajo queda un hueco que crece con la altura del viewport. El margen
// negativo lo compensa (en lg proporcional a 50svh) para que "Cómo funciona"
// quede a una distancia parecida en cualquier pantalla. En móvil la sección
// ya ocupa casi toda la capa y no lleva margen para no solaparse.
export const HomePage = () => {
	return (
		<div className='flex flex-col gap-14 pb-8'>
			<ScrollZoomStage
				className='md:-mb-24 lg:mb-[min(-6rem,17rem-50svh)]'
				hero={<HeroSection />}
				next={<FeaturedCategoriesSection />}
			/>
			<Reveal>
				<HowItWorksSection />
			</Reveal>
			<Reveal>
				<FamilyCombosSection />
			</Reveal>
			<Reveal>
				<PopularProductsSection />
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
