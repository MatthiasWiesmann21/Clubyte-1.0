'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

const Link = () => {
  const [favicon, setFavicon] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('/api/containers');
      const data = await response.data();
      setFavicon(data?.icon);
    };

    fetchData();
  }, []);

  return <link rel="icon" href={favicon} sizes="any" />;
};

export default Link;
