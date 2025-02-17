import { useEffect, useMemo, useState } from 'react';
import { AxiosResponse } from 'axios';
import { GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import styled from 'styled-components';
import { Container, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import Header from '../components/Essentials/Header';
import api from '../services/api';
import MONTHS from '../@types/MONTHS';
import light from '../styles/theme-light';
import { getCurrentYear } from '../functions/currentYear';
import ShareModal from '../components/Common/ShareModal';
import DownloadDumpDialog from '../components/Common/DownloadDumpDialog';
import { useDownloadDump } from '../hooks/useDownloadDump';
import IndexPage from '../components/IndexPage';

const Footer = dynamic(() => import('../components/Essentials/Footer'));

export default function Index({
  startDate,
  endDate,
  recordAmount,
  finalValue,
  ais,
  transparencyData,
}: {
  startDate: string;
  endDate: string;
  recordAmount: number;
  finalValue: number;
  ais: Agency[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  transparencyData: any[];
}) {
  const formatedStartDate = useMemo<string>(() => {
    const d = new Date(startDate);
    return `${MONTHS[d.getMonth() + 1]} de ${d.getFullYear()}`;
  }, [startDate]);
  const formatedEndDate = useMemo<string>(() => {
    const d = new Date(endDate);
    return `${MONTHS[d.getMonth() + 1]} de ${d.getFullYear()}`;
  }, [endDate]);
  const [completeChartData, setCompleteChartData] = useState([]);
  const [year, setYear] = useState(getCurrentYear());
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [fileLink, dumpDate] = useDownloadDump();
  const nextDateIsNavigable = useMemo<boolean>(
    () => year !== new Date().getFullYear(),
    [year],
  );
  const previousDateIsNavigable = useMemo<boolean>(() => year !== 2018, [year]);
  useEffect(() => {
    fetchGeneralChartData();
  }, [year]);

  async function fetchGeneralChartData() {
    try {
      const { data }: AxiosResponse<MensalRemuneration[]> = await api.ui.get(
        `/v2/geral/remuneracao/${year}`,
      );

      setCompleteChartData(
        data.map(d => ({
          remuneracao_base: d.remuneracao_base,
          outras_remuneracoes: d.outras_remuneracoes,
          descontos: d.descontos,
          remuneracoes: d.remuneracoes,
          // eslint-disable-next-line no-underscore-dangle
          mes: d.mes,
        })),
      );
    } catch (error) {
      setCompleteChartData([]);
    }
    setLoading(false);
  }

  const collecting = ais?.filter(
    ag => ag.coletando === undefined || ag.possui_dados,
  );

  return (
    <Page>
      <Head>
        <title>DadosJusBr</title>
        <meta property="og:image" content="/img/icon_dadosjus_background.png" />
        <meta property="og:title" content="DadosJusBr" />
        <meta
          property="og:description"
          content="DadosJusBr é uma plataforma que realiza a libertação continua de dados de remuneração de sistema de justiça brasileiro."
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/img/icon_dadosjus_background.png"
        />
      </Head>
      <Header />
      <Container fixed>
        <Headline>
          <IndexPage.HeadlineSection
            collecting={collecting}
            finalValue={finalValue}
            formatedEndDate={formatedEndDate}
            formatedStartDate={formatedStartDate}
            recordAmount={recordAmount}
            setOpenDialog={setOpenDialog}
          />
        </Headline>
      </Container>
      <ThemeProvider theme={light}>
        <Paper elevation={0} square>
          <Container>
            <IndexPage.TransparencySection
              formatedEndDate={formatedEndDate}
              transparencyData={transparencyData}
            />
          </Container>
        </Paper>
        <Container>
          <IndexPage.GeneralRemunerationSection
            completeChartData={completeChartData}
            loading={loading}
            year={year}
            dumpDate={dumpDate}
            nextDateIsNavigable={nextDateIsNavigable}
            previousDateIsNavigable={previousDateIsNavigable}
            setYear={setYear}
            setOpenDialog={setOpenDialog}
            setModalIsOpen={setModalIsOpen}
          />

          <ShareModal
            isOpen={modalIsOpen}
            agencyName="Total das remunerações do sistema de Justiça"
            url="https://dadosjusbr.org#remuneration-graph"
            onRequestClose={() => setModalIsOpen(false)}
          />

          <DownloadDumpDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            fileLink={fileLink}
          />
        </Container>
      </ThemeProvider>
      <Footer />
    </Page>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  try {
    const { data } = await api.ui.get('/v2/geral/resumo');
    const res = await api.default.get('/orgaos');
    const { data: transparencyData } = await api.default.get(
      'indice?agregado=true',
    );

    return {
      props: {
        agencyAmount: data.num_orgaos,
        startDate: data.data_inicio,
        endDate: data.data_fim,
        recordAmount: `${data.num_meses_coletados}`,
        finalValue: `${data.remuneracao_total}`,
        ais: res.data,
        transparencyData,
      },
      revalidate: 3600,
    };
  } catch (err) {
    throw new Error(
      `Os dados da página inicial não estão sendo retornados pela API - ${err}`,
    );
  }
};
const Page = styled.div`
  background: #3e5363;
`;
const Headline = styled.div`
  padding-top: 4rem;
  padding-bottom: 8rem;
  padding-right: 1rem;
  padding-left: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  background-image: url('img/bg.svg');
  background-position: right top;
  background-repeat: no-repeat;
  background-size: auto;
  @media (min-width: 600px) {
    padding-right: 0;
    padding-left: 0;
    font-size: 2rem;
  }
  @media (min-width: 900px) {
    padding-right: 0rem;
    font-size: 2.5rem;
  }
`;
