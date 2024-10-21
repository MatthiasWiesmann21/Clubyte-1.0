'use client';

import { useEffect, useState } from 'react';

const Link = () => {
  const [favicon, setFavicon] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/containers');
      const data = await response.json();
      setFavicon(data?.icon);
    };

    fetchData();
  }, []);

  return <link rel="icon" href={favicon} sizes="any" />;
};

export default Link;
