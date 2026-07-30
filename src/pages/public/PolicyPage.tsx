import { BreadcrumbItem, PageHeader } from '../../components/ui';

interface Props {
	title: string;
	breadcrumb: BreadcrumbItem[];
	paragraphs: string[];
}

export const PolicyPage = ({ title, breadcrumb, paragraphs }: Props) => {
	return (
		<div className='container flex flex-col gap-8 py-8'>
			<PageHeader title={title} breadcrumb={breadcrumb} />

			<div className='prose prose-neutral max-w-2xl text-sm text-neutral-600'>
				{paragraphs.map((paragraph, index) => (
					<p key={index}>{paragraph}</p>
				))}
			</div>
		</div>
	);
};
