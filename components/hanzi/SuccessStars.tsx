'use client';

import React, { useState, useEffect } from 'react';
import Star from './Star';

const SuccessStars = () => {
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('hanzi-challenge-success') || '0', 10);
    setStarCount(count);

    const handleStorageChange = () => {
      const newCount = parseInt(localStorage.getItem('hanzi-challenge-success') || '0', 10);
      setStarCount(newCount);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div id="success-star-counter" className="fixed top-4 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-full shadow-md">
      <Star size={24} color="#FFD700" />
      <span className="font-bold text-lg text-yellow-500">{starCount}</span>
    </div>
  );
};

export default SuccessStars;