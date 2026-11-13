'use client';
import { useParams } from 'next/navigation';
import DrawStage from '@/components/DrawStage';

export default function DrawPage() {
  const { id } = useParams();
  return <DrawStage prizeId={id} />;
}
