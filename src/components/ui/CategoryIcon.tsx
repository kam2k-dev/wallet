import React from 'react';
import { Category } from '../../types';
import {
  ShoppingBagIcon,
  TruckIcon,
  HomeIcon,
  BanknotesIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  HeartIcon,
  AcademicCapIcon,
  GiftIcon,
  BoltIcon,
  BriefcaseIcon,
  ReceiptPercentIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  MusicalNoteIcon,
  GlobeAltIcon,
  CircleStackIcon,
  ShoppingCartIcon,
  FilmIcon,
  TvIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  DevicePhoneMobileIcon,
  BookOpenIcon,
  ClockIcon,
  FireIcon,
  CameraIcon,
  ShieldCheckIcon,
  TrophyIcon,
  CakeIcon,
} from '@heroicons/react/24/solid';

interface CategoryIconProps {
  category?: Category | null;
  fallbackIcon?: string;
  fallbackBgHex?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const CATEGORY_ICONS_PRESET = [
  { id: 'shopping-bag', label: 'Belanja' },
  { id: 'shopping-cart', label: 'Supermarket' },
  { id: 'truck', label: 'Transportasi' },
  { id: 'home', label: 'Rumah & Utilitas' },
  { id: 'building-storefront', label: 'Kuliner & Cafe' },
  { id: 'banknotes', label: 'Gaji & Uang' },
  { id: 'credit-card', label: 'Tagihan & Kartu' },
  { id: 'computer-desktop', label: 'Freelance & Kerja' },
  { id: 'device-phone-mobile', label: 'Pulsa & Kuota' },
  { id: 'arrow-trending-up', label: 'Investasi & Saham' },
  { id: 'circle-stack', label: 'Tabungan & Dana' },
  { id: 'sparkles', label: 'Hiburan & Hobi' },
  { id: 'film', label: 'Bioskop & Streaming' },
  { id: 'tv', label: 'Langganan TV' },
  { id: 'musical-note', label: 'Musik & Konser' },
  { id: 'heart', label: 'Kesehatan & Medis' },
  { id: 'academic-cap', label: 'Pendidikan & Kursus' },
  { id: 'book-open', label: 'Buku & Belajar' },
  { id: 'gift', label: 'Hadiah & Donasi' },
  { id: 'cake', label: 'Ulang Tahun & Pesta' },
  { id: 'bolt', label: 'Listrik & Energi' },
  { id: 'fire', label: 'Gas & Dapur' },
  { id: 'globe-alt', label: 'Travel & Liburan' },
  { id: 'camera', label: 'Fotografi' },
  { id: 'wrench-screwdriver', label: 'Perbaikan & Servis' },
  { id: 'receipt-percent', label: 'Pajak & Diskon' },
  { id: 'shield-check', label: 'Asuransi & Proteksi' },
  { id: 'trophy', label: 'Bonus & Hadiah' },
];

const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Scarlab & Notion Standard Icons
  'shopping-bag': ShoppingBagIcon,
  'shopping-cart': ShoppingCartIcon,
  'truck': TruckIcon,
  'home': HomeIcon,
  'building-storefront': BuildingStorefrontIcon,
  'banknotes': BanknotesIcon,
  'credit-card': CreditCardIcon,
  'computer-desktop': ComputerDesktopIcon,
  'device-phone-mobile': DevicePhoneMobileIcon,
  'arrow-trending-up': ArrowTrendingUpIcon,
  'circle-stack': CircleStackIcon,
  'sparkles': SparklesIcon,
  'film': FilmIcon,
  'tv': TvIcon,
  'musical-note': MusicalNoteIcon,
  'heart': HeartIcon,
  'academic-cap': AcademicCapIcon,
  'book-open': BookOpenIcon,
  'gift': GiftIcon,
  'cake': CakeIcon,
  'bolt': BoltIcon,
  'fire': FireIcon,
  'globe-alt': GlobeAltIcon,
  'camera': CameraIcon,
  'wrench-screwdriver': WrenchScrewdriverIcon,
  'receipt-percent': ReceiptPercentIcon,
  'shield-check': ShieldCheckIcon,
  'trophy': TrophyIcon,
  'tag': TagIcon,
  'clock': ClockIcon,
  'briefcase': BriefcaseIcon,

  // Fallbacks / Legacy mapping
  'shopping_bag': ShoppingBagIcon,
  'bi-bag': ShoppingBagIcon,
  'directions_car': TruckIcon,
  'bi-car-front': TruckIcon,
  'event': SparklesIcon,
  'bi-controller': SparklesIcon,
  'bi-house-door': HomeIcon,
  'payments': BanknotesIcon,
  'bi-cash-stack': BanknotesIcon,
  'work': BriefcaseIcon,
  'bi-laptop': ComputerDesktopIcon,
  'trending_up': ArrowTrendingUpIcon,
  'bi-graph-up-arrow': ArrowTrendingUpIcon,
  'savings': CircleStackIcon,
  'bi-piggy-bank': CircleStackIcon,
  'receipt': ReceiptPercentIcon,
  'bi-receipt': ReceiptPercentIcon,
  'restaurant': BuildingStorefrontIcon,
  'bi-cup-hot': BuildingStorefrontIcon,
  'flight': GlobeAltIcon,
  'bi-airplane': GlobeAltIcon,
  'fitness_center': HeartIcon,
  'medical_services': HeartIcon,
  'bi-heart-pulse': HeartIcon,
  'school': AcademicCapIcon,
  'bi-mortarboard': AcademicCapIcon,
};

const sizeMap = {
  sm: {
    container: 'w-5 h-5 rounded-lg',
    icon: 'w-3 h-3',
  },
  md: {
    container: 'w-8 h-8 rounded-xl',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'w-10 h-10 rounded-xl',
    icon: 'w-5 h-5',
  },
  xl: {
    container: 'w-14 h-14 rounded-2xl',
    icon: 'w-7 h-7',
  },
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  fallbackIcon = 'shopping-bag',
  fallbackBgHex = '#2170e4',
  size = 'lg',
  className = '',
}) => {
  const iconKey = category?.icon || fallbackIcon;
  const IconComponent = iconComponentMap[iconKey] || ShoppingBagIcon;
  const bgHex = category?.bgHex || category?.color || fallbackBgHex;
  const config = sizeMap[size];

  return (
    <div
      className={`${config.container} flex items-center justify-center text-white shrink-0 shadow-xs ${className}`}
      style={{ backgroundColor: bgHex }}
    >
      <IconComponent className={`${config.icon} text-white shrink-0`} />
    </div>
  );
};
