import React, { Suspense, useState } from 'react';
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
import AlertWithTitle from '../Common/AlertWithTitle';

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

export interface AgencyPageWithoutNavigationProps {
  id: string;
  agencyTotals: v2AgencyTotalsYear;
  year: number;
  agency: Agency;
  title: string;
  data: AnnualSummaryData[];
  dataLoading: boolean;
}

const AgencyPageWithoutNavigation: React.FC<
  AgencyPageWithoutNavigationProps
> = ({ id, agencyTotals, title, year, agency, data, dataLoading }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [plotData, setPlotData] = useState<AggregateIndexes[]>([]);
  const fileLink = `${process.env.S3_REPO_URL}/${id}/datapackage/${id}.zip`;
  const matches = useMediaQuery('(max-width:900px)');
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const hasData =
    (!agency?.coletando && !agency?.possui_dados) ||
    (agency?.coletando && agency?.possui_dados);

  async function fetchPlotData() {
    if (!plotData.length) {
      try {
        const { data: transparencyPlot } = await api.default.get(
          `/indice/orgao/${id}`,
        );
        setPlotData(normalizePlotData(transparencyPlot));
      } catch (err) {
        router.push('/404');
      }
    }
  }

  return (
    <Container fixed>
      <Box>
        <MoreInfoAccordion
          ombudsman={agency?.ouvidoria}
          twitterHandle={agency?.twitter_handle}
          timestamp={agencyTotals?.meses?.at(-1).timestamp.seconds}
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
                  {agencyTotals?.package && (
                    <AlertWithTitle
                      open={open}
                      handleClose={handleClose}
                      downloadLink={url.downloadURL(fileLink)}
                    >
                      <Button
                        variant="outlined"
                        color="info"
                        endIcon={<CloudDownloadIcon />}
                        onClick={() => {
                          ReactGA.event('file_download', {
                            category: 'download',
                            action: `From: ${window.location.pathname}`,
                          });
                          handleOpen();
                        }}
                        id="download-button"
                      >
                        <Typography variant="button" mr={1}>
                          BAIXAR
                        </Typography>
                        <Typography variant="button" color="#00bfa6">
                          {formatBytes(agencyTotals?.package.size)}
                        </Typography>
                      </Button>
                    </AlertWithTitle>
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
                  {agencyTotals?.package && (
                    <AlertWithTitle
                      open={open}
                      handleClose={handleClose}
                      downloadLink={url.downloadURL(fileLink)}
                    >
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
                        id="download-button"
                      >
                        <Typography variant="button" mr={1}>
                          BAIXAR
                        </Typography>
                        <Typography variant="button" color="#00bfa6">
                          {formatBytes(agencyTotals?.package.size)}
                        </Typography>
                      </Button>
                    </AlertWithTitle>
                  )}
                </Stack>
              </Drawer>
            )}
          </>
        )}
      </Box>
      <ThemeProvider theme={light}>
        <Box>
          <AnnualRemunerationGraph
            data={data}
            year={year}
            agency={agency}
            dataLoading={dataLoading}
          />
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
                    <Tooltip
                      placement="bottom"
                      title={
                        <Typography fontSize={{ xs: '0.8rem', md: '0.9rem' }}>
                          <b>Auxílio-alimentação: </b> Custeio de alimentação
                          não incorporável ao salário.
                          <hr />
                          <b>Licença-prêmio: </b>
                          A cada 5 anos de serviço, o servidor tem direito a 3
                          meses de licença.
                          <hr />
                          <b>Indenização de Férias: </b>
                          Venda de períodos de férias não usufruídos.
                          <hr />
                          <b>Gratificação Natalina: </b>
                          Corresponde ao 13° salário.
                          <hr />
                          <b>Licença-compensatória: </b>
                          Horas extras não compensadas no mesmo mês.
                          <hr />
                          <b>Auxílio-saúde: </b>
                          Reembolso de despesas com planos de saúde, inclusive
                          excedentes do teto.
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
              <SearchAccordion selectedAgencies={[agency]} />
            </Box>
          </>
        ) : null}
      </ThemeProvider>

      <ShareModal
        isOpen={modalIsOpen}
        url={`https://dadosjusbr.org/orgao/${id}`}
        onRequestClose={() => setModalIsOpen(false)}
      />
    </Container>
  );
};

export default AgencyPageWithoutNavigation;
