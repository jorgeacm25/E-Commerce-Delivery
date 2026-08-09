import { describe, expect, it } from 'vitest';
import { getAdminDashboardMockStats, getAdminRecentActivity } from '../adminDashboard.service';
import { adminDashboardMockStats, adminRecentActivityMock } from '../../data/adminDashboard.mock';

describe('adminDashboard.service', () => {
	it('getAdminDashboardMockStats resuelve las stats simuladas', async () => {
		await expect(getAdminDashboardMockStats()).resolves.toEqual(adminDashboardMockStats);
	});

	it('getAdminRecentActivity resuelve la actividad reciente simulada', async () => {
		await expect(getAdminRecentActivity()).resolves.toEqual(adminRecentActivityMock);
	});
});
