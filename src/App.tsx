/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Lotes from './pages/Lotes';
import TratoDiario from './pages/TratoDiario';
import Racao from './pages/Racao';
import Lancamentos from './pages/Lancamentos';
import Vendas from './pages/Vendas';
import ReceitasDiversas from './pages/ReceitasDiversas';
import Pesagem from './pages/Pesagem';
import Financeiro from './pages/Financeiro';
import AnaliseAvancada from './pages/AnaliseAvancada';
import Relatorios from './pages/Relatorios';
import Login from './pages/Login';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Lotes />} />
              <Route path="trato" element={<TratoDiario />} />
              <Route path="racao" element={<Racao />} />
              <Route path="lancamentos" element={<Lancamentos />} />
              <Route path="vendas" element={<Vendas />} />
              <Route path="receitas" element={<ReceitasDiversas />} />
              <Route path="pesagem" element={<Pesagem />} />
              <Route path="financeiro" element={<Financeiro />} />
              <Route path="analise" element={<AnaliseAvancada />} />
              <Route path="relatorios" element={<Relatorios />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
