'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideoConverterPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/file-conversion');
  }, [router]);

  return null;
}