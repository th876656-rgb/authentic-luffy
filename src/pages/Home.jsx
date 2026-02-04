import React from 'react';
import Hero from '../components/Hero';
import TrustSignals from '../components/TrustSignals';
import CategoryGrid from '../components/CategoryGrid';
import ProductCarousel from '../components/ProductCarousel';
import BrandWall from '../components/BrandWall';

const Home = () => {
  return (
    <main>
      <Hero />
      <TrustSignals />
      <CategoryGrid />
      <ProductCarousel />
      <BrandWall />
    </main>
  );
};

export default Home;
