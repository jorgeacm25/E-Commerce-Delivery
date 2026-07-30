type ClassValue = string | number | null | undefined | false | ClassValue[];

// Combina clases de Tailwind condicionalmente sin depender de una librería externa.
export const cn = (...values: ClassValue[]): string => {
	const flatten = (value: ClassValue): string => {
		if (!value) return '';
		if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(' ');
		return String(value);
	};

	return values.map(flatten).filter(Boolean).join(' ');
};
