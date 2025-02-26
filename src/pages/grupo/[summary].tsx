import React, { Suspense, useState } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  ListSubheader,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import Footer from '../../components/Essentials/Footer';
import Header from '../../components/Essentials/Header';
import api from '../../services/api';
import DropDownGroupSelector from '../../components/Common/DropDownGroupSelector';
import { getCurrentYear } from '../../functions/currentYear';
import AgencyWithoutNavigation from '../../components/AnnualRemunerationGraph';
import { formatToAgency, orderStringsWithNum } from '../../functions/format';

export default function SummaryPage({
  pages,
  agencies,
  summary,
}: {
  pages: v2AgencyBasic[][];
  agencies: v2AgencyBasic[];
  summary: string;
}) {
  const router = useRouter();
  const { page } = router.query.page === undefined ? { page: 1 } : router.query;

  const pageTitle = `${formatToAgency(summary)}`;
  const [value, setValue] = useState('');
  const dataList = pages[+page - 1];

  const handleDropDownChange = (event: SelectChangeEvent<string>) => {
    const { value: eventValue } = event.target;

    setValue(eventValue);
    router.push(`/orgao/${eventValue.toLowerCase()}`);
  };

  return (
    <Page>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:image" content="/img/icon_dadosjus_background.png" />
        <meta
          property="og:title"
          content={`Veja os dados sobre ${formatToAgency(summary)}`}
        />
        <meta
          property="og:description"
          content="DadosJusBr é uma plataforma que realiza a libertação continua de dados de remuneração de sistema de justiça brasileiro"
        />
      </Head>
      <Header />
      <Container>
        <Grid
          container
          display="flex"
          justifyContent="space-between"
          py={4}
          my={4}
        >
          <Grid item pb={4}>
            <Typography>Selecione o grupo</Typography>

            <DropDownGroupSelector value={summary} inputType="outlined" />
          </Grid>
          <Grid item pb={4}>
            <Typography>Selecione o órgão</Typography>

            <FormControl fullWidth sx={{ m: 0, minWidth: 240, maxWidth: 250 }}>
              <Select
                id="orgaos-select"
                label="Estados"
                labelId="orgaos-select-label"
                defaultValue="Selecione um órgão"
                inputProps={{ 'aria-label': 'Dados por órgão' }}
                displayEmpty
                value={value}
                onChange={handleDropDownChange}
                input={<OutlinedInput />}
                renderValue={selected => {
                  if (selected.length === 0) {
                    return <em>Selecione</em>;
                  }
                  return selected;
                }}
                sx={{
                  height: 40,
                  pb: 0,
                  pt: 0,
                }}
              >
                <ListSubheader>
                  <em>Órgãos disponíveis</em>
                </ListSubheader>

                {agencies.map(ag => (
                  <MenuItem key={ag.id_orgao} value={ag.id_orgao.toUpperCase()}>
                    {ag.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <div>
          {(() => {
            if (typeof dataList !== 'undefined' && dataList.length > 0) {
              return dataList.map((agency, i) => (
                <Box
                  mb={i === dataList.length - 1 ? 0 : 12}
                  key={agency.id_orgao}
                >
                  <div id={agency.id_orgao}>
                    <Suspense fallback={<CircularProgress />}>
                      <AgencyWithoutNavigation
                        id={agency?.id_orgao}
                        title={agency?.nome}
                        year={getCurrentYear()}
                      />
                    </Suspense>
                  </div>
                </Box>
              ));
            }
            return (
              <Box
                m={4}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div>
                  <CircularProgress color="info" />
                </div>
                <p>Aguarde...</p>
              </Box>
            );
          })()}
        </div>
        {typeof dataList !== 'undefined' && dataList.length > 0 && (
          <Box display="flex" justifyContent="center" mt={4} mb={12}>
            <Pagination
              count={pages?.length}
              size="large"
              page={+page}
              onChange={(_, changeValue) => {
                router.replace(`/grupo/${summary}?page=${changeValue}`);
              }}
            />
          </Box>
        )}
      </Container>
      <Footer />
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    return {
      paths: [],
      fallback: 'blocking',
    };
  } catch (error) {
    return {
      paths: [],
      fallback: true,
    };
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { summary } = context.params;
  try {
    const { data } = await api.ui.get(`/v2/orgao/${summary}`);
    if (!data.orgaos) {
      // context.res.writeHead(301, {
      //   Location: `/404`,
      // });
      // context.res.end();
      return { props: {} };
    }

    const chunkArray = (array: [], size: number) => {
      const result = [];
      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }
      return result;
    };

    const agencies = data.orgaos.sort((a, b) =>
      orderStringsWithNum(a.id_orgao, b.id_orgao),
    );
    const orgaosChunks = chunkArray(agencies, 5);

    return {
      props: {
        pages: orgaosChunks,
        agencies,
        summary: data.grupo,
      },
      revalidate: 3600,
    };
  } catch (error) {
    throw new Error(`Erro ao buscar dados do grupo de órgãos - ${error}`);
  }
};
const Page = styled.div`
  background: #3e5363;
`;
