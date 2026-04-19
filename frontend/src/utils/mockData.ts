import { MasterItem } from '@/context/types';

export const MOCK_MASTER_ITEMS: MasterItem[] = [
  {
    id: '1',
    name: 'Tent - Big Dome',
    description: 'Large white dome tent, capacity 100+',
    pricePerDay: 5000,
    gstPercent: 18,
    category: 'Tents',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Tent - Canopy',
    description: 'Open-sided canopy tent',
    pricePerDay: 3000,
    gstPercent: 18,
    category: 'Tents',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Tables - Banquet',
    description: 'Long tables for seating',
    pricePerDay: 500,
    gstPercent: 12,
    category: 'Furniture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Chairs - Chiavari',
    description: 'Elegant wooden chairs',
    pricePerDay: 100,
    gstPercent: 12,
    category: 'Furniture',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Sound System - Basic',
    description: 'Basic PA system with microphone',
    pricePerDay: 2000,
    gstPercent: 18,
    category: 'Audio/Video',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Sound System - Premium',
    description: 'High-end sound system with DJ setup',
    pricePerDay: 5000,
    gstPercent: 18,
    category: 'Audio/Video',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Lighting - LED Strips',
    description: 'RGB LED lighting strips',
    pricePerDay: 1000,
    gstPercent: 18,
    category: 'Lighting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Projector - Full HD',
    description: 'Full HD projector with screen',
    pricePerDay: 3000,
    gstPercent: 18,
    category: 'Audio/Video',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'Catering - Buffet Setup',
    description: 'Complete buffet setup with servers',
    pricePerDay: 10000,
    gstPercent: 5,
    category: 'Catering',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Decoration - Floral Arch',
    description: 'Beautiful floral arch decoration',
    pricePerDay: 2000,
    gstPercent: 18,
    category: 'Decoration',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initializeMockData = () => {
  const storageKey = 'rental_master_items';
  const existing = localStorage.getItem(storageKey);
  
  if (!existing) {
    localStorage.setItem(storageKey, JSON.stringify(MOCK_MASTER_ITEMS));
  }
};
