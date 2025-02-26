import React, { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ReactGA from 'react-ga4';
import {
  Container,
  Box,
  Typography,
  Button,
  ThemeProvider,
  Stack,
  CircularProgress,
  Tooltip,
  Link,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IosShareIcon from '@mui/icons-material/IosShare';
import useMediaQuery from '@mui/material/useMediaQuery';
import InfoIcon from '@mui/icons-material/Info';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ShareModal from '../Common/ShareModal';
import light from '../../styles/theme-light';
import { formatAgency, formatBytes } from '../../functions/format';
import Drawer from '../Common/Drawer';
import MoreInfoAccordion from '../Common/MoreInfoAccordion';
import SearchAccordion from './components/AnnualSearchAccordion';
import api from '../../services/api';
import { normalizePlotData } from '../../functions/normalize';
import * as url from '../../url';
import AnnualMoneyHeadingsChart from './components/AnnualMoneyHeadingsChart';
import { yearsWithoutData } from './functions';
import MoneyHeadingInfo from '../Common/MoneyHeadingInfo';

const AnnualRemunerationGraph = dynamic(
  () => import('./components/RemunerationChart'),
  {
    loading: () => <CircularProgress />,
    ssr: false,
  },
);

const IndexTabGraph = dynamic(
  () => import('../TransparencyChart/IndexTabChart'),
  {
    loading: () => <CircularProgress />,
    ssr: false,
  },
);

type chartDataType = {
  dados_anuais?: AnnualSummaryData[];
  orgao: Agency;
};

export interface AgencyPageWithoutNavigationProps {
  id: string;
  year: number;
  title: string;
}

const AgencyPageWithoutNavigation: React.FC<
  AgencyPageWithoutNavigationProps
> = ({ id, title, year }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [plotData, setPlotData] = useState<AggregateIndexes[]>([]);
  const [agencyInfo, setAgencyInfo] = useState<v2AgencyTotalsYear>();
  const [agency, setAgency] = useState<Agency>();
  const [data, setData] = useState<AnnualSummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const fileLink = `${process.env.S3_REPO_URL}/${id}/datapackage/${id}.zip`;
  const matches = useMediaQuery('(max-width:900px)');
  const router = useRouter();

  const hasData = !(agency?.coletando && !agency?.possui_dados);

  async function fetchPlotData() {
    if (!plotData.length) {
      try {
        const { data: transparencyPlot } = await api.default.get(
          `/indice/orgao/${id}`,
        );
        setPlotData(normalizePlotData(transparencyPlot));
      } catch (err) {
        throw new Error(
          `Erro ao buscar os dados do índice de transparência - ${err}`,
        );
      }
    }
  }

  const fetchAgencyInfo = async () => {
    try {
      const [{ data: resumo }, { data: response }] = await Promise.all([
        api.ui.get<chartDataType>(`/v2/orgao/resumo/${id}`),
        api.ui.get<v2AgencyTotalsYear>(`/v2/orgao/totais/${id}/${year}`),
      ]);

      setAgency(resumo.orgao);
      setData(resumo.dados_anuais);
      setAgencyInfo(response);
    } catch (err) {
      throw new Error(
        `Erro ao buscar a data da última coleta do ${title} - ${err}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencyInfo();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container fixed>
      <Box>
        <MoreInfoAccordion
          ombudsman={agency?.ouvidoria}
          twitterHandle={agency?.twitter_handle}
          timestamp={agencyInfo?.meses?.at(-1).timestamp.seconds}
          repository=""
        >
          <Typography variant="h2" textAlign="center" width="100%">
            {title} ({formatAgency(id.toLocaleUpperCase('pt'))})
          </Typography>
        </MoreInfoAccordion>
        {agency && agency.coletando && !agency.possui_dados ? (
          <></>
        ) : (
          <>
            {!matches ? (
              <Box display="flex" justifyContent="space-between">
                <Stack
                  spacing={2}
                  direction="row"
                  justifyContent="flex-start"
                  my={4}
                >
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                  >
                    VOLTAR
                  </Button>
                </Stack>

                <Stack
                  spacing={2}
                  direction="row"
                  justifyContent="flex-end"
                  my={4}
                >
                  <Button
                    variant="outlined"
                    color="info"
                    endIcon={<IosShareIcon />}
                    onClick={() => setModalIsOpen(true)}
                  >
                    COMPARTILHAR
                  </Button>
                  {agencyInfo?.package && (
                    <Button
                      variant="outlined"
                      color="info"
                      endIcon={<CloudDownloadIcon />}
                      onClick={() => {
                        ReactGA.event('file_download', {
                          category: 'download',
                          action: `From: ${window.location.pathname}`,
                        });
                      }}
                      href={url.downloadURL(fileLink)}
                      id="download-button"
                    >
                      <Typography variant="button" mr={1}>
                        BAIXAR
                      </Typography>
                      <Typography variant="button" color="#00bfa6">
                        {formatBytes(agencyInfo?.package.size)}
                      </Typography>
                    </Button>
                  )}
                </Stack>
              </Box>
            ) : (
              <Drawer>
                <Stack
                  direction="column"
                  spacing={1}
                  justifyContent="flex-start"
                  mt={3}
                  mx={6}
                >
                  <Button
                    variant="outlined"
                    color="info"
                    endIcon={<IosShareIcon />}
                    onClick={() => setModalIsOpen(true)}
                  >
                    COMPARTILHAR
                  </Button>
                  {agencyInfo?.package && (
                    <Button
                      variant="outlined"
                      color="info"
                      endIcon={<CloudDownloadIcon />}
                      onClick={() => {
                        ReactGA.event('file_download', {
                          category: 'download',
                          action: `From: ${window.location.pathname}`,
                        });
                      }}
                      href={url.downloadURL(fileLink)}
                      id="download-button"
                    >
                      <Typography variant="button" mr={1}>
                        BAIXAR
                      </Typography>
                      <Typography variant="button" color="#00bfa6">
                        {formatBytes(agencyInfo?.package.size)}
                      </Typography>
                    </Button>
                  )}
                </Stack>
              </Drawer>
            )}
          </>
        )}
      </Box>
      <ThemeProvider theme={light}>
        <Box>
          <Suspense fallback={<CircularProgress />}>
            <AnnualRemunerationGraph
              data={data}
              year={year}
              agency={agency}
              dataLoading={loading}
            />
          </Suspense>
        </Box>
        {hasData ? (
          <>
            <Box mt={2}>
              <Accordion
                onChange={() =>
                  ReactGA.event('click', {
                    category: 'open_component',
                    action: `From: Gráfico de rubricas`,
                  })
                }
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="#000">
                    Gráfico do gasto anual em benefícios
                    <Tooltip placement="bottom" title={<MoneyHeadingInfo />}>
                      <IconButton aria-label="Botão de informações">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Suspense fallback={<CircularProgress />}>
                    <AnnualMoneyHeadingsChart
                      data={data}
                      matches={matches}
                      yearsWithoutData={yearsWithoutData(data)}
                      width="100%"
                      height="500"
                    />
                  </Suspense>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box mt={2}>
              <Accordion onChange={fetchPlotData}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" color="#000">
                    Índice de transparência
                    <Tooltip
                      placement="bottom"
                      title={
                        <Typography fontSize={{ xs: '0.8rem', md: '0.9rem' }}>
                          O Índice de Transparência é composto por duas
                          dimensões: facilidade e completude. Cada uma das
                          dimensões, por sua vez, é composta por até seis
                          critérios em cada prestação de contas, que são
                          avaliados mês a mês. O índice corresponde à média
                          harmônica das duas dimensões.{' '}
                          <Link href="/indice" color="inherit">
                            Saiba mais
                          </Link>
                          .
                        </Typography>
                      }
                    >
                      <IconButton aria-label="Botão de informações">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Suspense fallback={<CircularProgress />}>
                    {plotData.length > 0 ? (
                      <IndexTabGraph
                        plotData={plotData}
                        height={60 * plotData.length}
                        mobileHeight={95 * plotData.length}
                        isAgency
                      />
                    ) : (
                      <CircularProgress />
                    )}
                  </Suspense>
                </AccordionDetails>
              </Accordion>
            </Box>

            <Box mt={2}>
              <SearchAccordion
                selectedAgencies={[agency]}
                agencyName={agency?.nome}
              />
            </Box>
          </>
        ) : null}
      </ThemeProvider>

      <ShareModal
        isOpen={modalIsOpen}
        agencyName={agency?.nome}
        url={`https://dadosjusbr.org/orgao/${id}`}
        onRequestClose={() => setModalIsOpen(false)}
      />
    </Container>
  );
};

export default AgencyPageWithoutNavigation;
