/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import PoemDetail from '@/pages/PoemDetail';
import PoetDetail from '@/pages/PoetDetail';
import Search from '@/pages/Search';
import Admin from '@/pages/Admin';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/poem/:id" element={<PoemDetail />} />
            <Route path="/poet/:id" element={<PoetDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
        <Toaster position="top-center" />
      </Router>
    </HelmetProvider>
  );
}
