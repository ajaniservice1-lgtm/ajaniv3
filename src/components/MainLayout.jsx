// src/components/MainLayout.jsx
import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen ">
      {/* <Header /> */}
      {/* This empty div pushes content down below the fixed header */}
      <div className="h-16"></div>
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;