"use client";

import { useEffect } from 'react';

export default function FocusRefresh() {
  useEffect(() => {
    const onFocus = () => window.location.reload();

    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return null;
}
