import { ReactNode } from 'react';
import {
	FiCheckCircle,
	FiClock,
	FiDollarSign,
	FiMessageCircle,
	FiRefreshCw,
	FiShield,
	FiTruck,
} from 'react-icons/fi';
import { HomeIconKey } from '../../interfaces';

export const homeIconMap: Record<HomeIconKey, ReactNode> = {
	dollar: <FiDollarSign aria-hidden='true' />,
	truck: <FiTruck aria-hidden='true' />,
	shield: <FiShield aria-hidden='true' />,
	chat: <FiMessageCircle aria-hidden='true' />,
	refresh: <FiRefreshCw aria-hidden='true' />,
	clock: <FiClock aria-hidden='true' />,
	check: <FiCheckCircle aria-hidden='true' />,
};
