'use client';
import { useState, useEffect } from 'react';
import ClientProviders from './ClientProviders';

export default function ClientLayoutWrapper({ children }) {
  // No need to initialize analytics here anymore - it's handled by AnalyticsTracker
  return <ClientProviders>{children}</ClientProviders>;
}
