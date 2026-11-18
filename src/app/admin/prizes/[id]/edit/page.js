'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PrizeForm from '@/components/PrizeForm';
import { api } from '@/lib/api';
import { useApp } from '@/context/Providers';

export default function EditPrize() {
  const { id } = useParams();
  const { toast } = useApp();
  const [d, setD] = useState(null);

  useEffect(() => {
    api(`/admin/prizes/${id}/members`).then(setD).catch((e) => toast(e.message, 'error'));
  }, [id, toast]);

  if (!d) return <p className="ed-sub">Loading…</p>;
  const hasCards = d.prize.sold > 0 || d.prize.reserved > 0;
  return <PrizeForm prize={d.prize} lockCards={hasCards} lockPlaces={d.placesDrawn > 0} />;
}