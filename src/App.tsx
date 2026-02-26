/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
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
  );
}
