import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { SignupPage } from '@/features/auth/SignupPage';
import { OtpPage } from '@/features/auth/OtpPage';
import { HomePage } from '@/features/home/HomePage';
import { ItemDetailPage } from '@/features/items/ItemDetailPage';
import { CartPage } from '@/features/cart/CartPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  // Default path: Always redirect to /signup when visiting root URL without a specific subpath
  {
    path: '/',
    element: <Navigate to="/signup" replace />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/verify',
    element: <OtpPage />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/items/:id',
    element: (
      <ProtectedRoute>
        <ItemDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    ),
  },
  // Catch-all: Any unmatched or invalid route redirects to /signup
  {
    path: '*',
    element: <Navigate to="/signup" replace />,
  },
]);
