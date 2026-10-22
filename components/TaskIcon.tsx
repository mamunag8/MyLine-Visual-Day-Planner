import React from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Coffee,
  Dumbbell,
  Flame,
  Heart,
  Laptop,
  Moon,
  ShoppingBag,
  Sparkles,
  Sun,
  Utensils,
  Zap,
} from 'lucide-react';

interface TaskIconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

export const AVAILABLE_TASK_ICONS = [
  'CheckCircle2',
  'BookOpen',
  'Dumbbell',
  'Utensils',
  'ShoppingBag',
  'Moon',
  'Sparkles',
  'Calendar',
  'Coffee',
  'Laptop',
  'Heart',
  'Zap',
] as const;

export const TaskIcon: React.FC<TaskIconProps> = ({
  name,
  size = 18,
  color = 'currentColor',
  className = '',
}) => {
  switch (name) {
    case 'Dumbbell':
      return <Dumbbell size={size} color={color} className={className} />;
    case 'BookOpen':
      return <BookOpen size={size} color={color} className={className} />;
    case 'Utensils':
      return <Utensils size={size} color={color} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} color={color} className={className} />;
    case 'Moon':
      return <Moon size={size} color={color} className={className} />;
    case 'Sparkles':
      return <Sparkles size={size} color={color} className={className} />;
    case 'Calendar':
      return <Calendar size={size} color={color} className={className} />;
    case 'Coffee':
      return <Coffee size={size} color={color} className={className} />;
    case 'Laptop':
      return <Laptop size={size} color={color} className={className} />;
    case 'Heart':
      return <Heart size={size} color={color} className={className} />;
    case 'Zap':
      return <Zap size={size} color={color} className={className} />;
    case 'Flame':
      return <Flame size={size} color={color} className={className} />;
    case 'Sun':
      return <Sun size={size} color={color} className={className} />;
    case 'CheckCircle2':
    default:
      return <CheckCircle2 size={size} color={color} className={className} />;
  }
};
