import { describe, expect, it } from 'vitest';
import { ADMIN_ACCESS_ROLES, hasAdminAccess, hasRole } from '../roleGuards';

describe('roleGuards', () => {
	describe('hasRole', () => {
		it('devuelve true cuando el rol está en la lista permitida', () => {
			expect(hasRole('staff', ['staff'])).toBe(true);
		});

		it('devuelve false cuando el rol no está en la lista permitida', () => {
			expect(hasRole('customer', ['staff'])).toBe(false);
		});

		it('devuelve false cuando no hay rol', () => {
			expect(hasRole(null, ['staff'])).toBe(false);
			expect(hasRole(undefined, ['staff'])).toBe(false);
		});
	});

	describe('hasAdminAccess', () => {
		it('permite staff', () => {
			expect(hasAdminAccess('staff')).toBe(true);
		});

		it('no permite customer', () => {
			expect(hasAdminAccess('customer')).toBe(false);
		});

		it('no permite rol nulo/indefinido', () => {
			expect(hasAdminAccess(null)).toBe(false);
			expect(hasAdminAccess(undefined)).toBe(false);
		});
	});

	it('ADMIN_ACCESS_ROLES contiene exactamente staff', () => {
		expect(ADMIN_ACCESS_ROLES).toEqual(['staff']);
	});
});
