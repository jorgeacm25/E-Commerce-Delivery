import { z } from 'zod';

export const workerFormSchema = z.object({
	fullName: z.string().trim().min(2, 'El nombre es requerido'),
	role: z.string().trim().min(1, 'El rol es requerido'),
	pendingAmountUsd: z.coerce.number().min(0, 'Debe ser 0 o mayor'),
});
export type WorkerFormValues = z.infer<typeof workerFormSchema>;
