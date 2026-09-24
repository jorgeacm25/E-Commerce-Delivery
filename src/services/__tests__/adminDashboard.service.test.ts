import { describe, expect, it } from 'vitest';
import { getAdminRecentActivity } from '../adminDashboard.service';
import { adminRecentActivityMock } from '../../data/adminDashboard.mock';

describe('adminDashboard.service', () => {
	it('getAdminRecentActivity resuelve la actividad reciente simulada', async () => {
		await expect(getAdminRecentActivity()).resolves.toEqual(adminRecentActivityMock);
	});
});
