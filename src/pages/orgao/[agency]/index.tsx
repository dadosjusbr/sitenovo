import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { Box, CircularProgress } from '@mui/material';
import Header from '../../../components/Essentials/Header';
import Footer from '../../../components/Essentials/Footer';
import api from '../../../services/api';
import { getCurrentYear } from '../../../functions/currentYear';

const AgencyWithoutNavigation = dynamic(
  () => import('../../../components/AnnualRemunerationGraph'),
  { loading: () => <CircularProgress />, ssr: false },
);

export default function AnualAgencyPage({
  id,
  fullName,
}: {
  id: string;
  fullName: string;
}) {
  return (
    <Box>
      <Head>
        <title>{fullName}</title>
        <meta property="og:image" content="/img/icon_dadosjus_background.png" />
        <meta
          property="og:title"
          content={`Veja os dados do orgão: ${fullName}`}
        />
        <meta
          property="og:description"
          content="DadosJusBr é uma plataforma que realiza a libertação continua de dados de remuneração de sistema de justiça brasileiro"
        />
      </Head>
      <Header />
      <Box display="flex" my={10} justifyContent="center">
        <AgencyWithoutNavigation
          id={id}
          year={getCurrentYear()}
          title={fullName}
        />
      </Box>
      <Footer />
    </Box>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  const { agency: id } = context.params;

  let plotData: AggregateIndexes[] = [];

  try {
    const { data: plotDataResponse } = await api.default.get(
      `/indice/orgao/${id}`,
    );
    plotData = plotDataResponse;
  } catch (err) {
    plotData = [];
  }

  try {
    const { data: agency } = await api.ui.get(`/v2/orgao/resumo/${id}`);
    return {
      props: {
        id,
        agency: agency?.orgao,
        fullName: agency?.orgao.nome,
        plotData,
      },
    };
  } catch (err) {
    throw new Error('Erro ao buscar dados do orgão');
  }
};
