'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect to feed — creation happens via modal
export default function CreatePage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/feed');
  }, [router]);
  return null;
}
