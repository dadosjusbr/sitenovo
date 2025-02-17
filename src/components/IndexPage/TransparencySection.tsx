import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Link,
  CircularProgress,
} from '@mui/material';
import Video from '../Video';

const IndexTabGraph = dynamic(
  () => import('../TransparencyChart/IndexTabChart'),
  {
    loading: () => <CircularProgress />,
  },
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

type TransparencySectionProps = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  transparencyData: any[];
  formatedEndDate: string;
};

export default function TransparencySection({
  transparencyData,
  formatedEndDate,
}: TransparencySectionProps) {
  const [value, setValue] = useState(0);

  return (
    <Box my={4} pt={8} pb={4}>
      <Typography variant="h2" textAlign="center">
        Índice de Transparência
      </Typography>
      <Grid container justifyContent="center" py={4}>
        <Grid item width={900}>
          <Grid
            container
            justifyContent="space-between"
            flexDirection={{ xs: 'column-reverse', md: 'row' }}
          >
            <Grid item xs={12} md={4.5} mb={4}>
              <Video.Player
                src="https://www.youtube-nocookie.com/embed/ubccAzz4Sfo"
                allowFullScreen
                loading="lazy"
                aria-label="Vídeo sobre o Índice de Transparência"
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <p>
                O Índice de Transparência é composto por duas dimensões:
                facilidade e completude. Cada uma das dimensões, por sua vez, é
                composta por até seis critérios em cada prestação de contas, que
                são avaliados mês a mês. O índice corresponde à média harmônica
                das duas dimensões.{' '}
                <Link href="/indice" color="inherit">
                  Saiba mais
                </Link>
                .
              </p>
              <p>
                Este gráfico representa dados de <b>janeiro de 2018</b> até{' '}
                <b>{formatedEndDate.toLowerCase()}</b>.
              </p>
            </Grid>
          </Grid>
        </Grid>
        <Grid item width={900}>
          <Grid container justifyContent="center" pt={4} pb={2}>
            <Grid item>
              <Box sx={{ maxWidth: { xs: 320, sm: 720 } }}>
                <Tabs
                  value={value}
                  onChange={(event, newValue) => {
                    setValue(newValue);
                  }}
                  variant="scrollable"
                  scrollButtons
                  allowScrollButtonsMobile
                  aria-label="Gráfico do índice de transparência"
                >
                  <Tab label="Justiça estadual" {...a11yProps(0)} />
                  <Tab label="Ministérios públicos" {...a11yProps(1)} />
                  <Tab label="Justiça do trabalho" {...a11yProps(2)} />
                  <Tab label="Justiça militar" {...a11yProps(3)} />
                  <Tab label="Justiça federal" {...a11yProps(4)} />
                  <Tab label="Justiça eleitoral" {...a11yProps(5)} />
                  <Tab label="Justiça Superior" {...a11yProps(6)} />
                  <Tab label="Conselhos de justiça" {...a11yProps(7)} />
                </Tabs>
              </Box>
            </Grid>
          </Grid>
          <TabPanel value={value} index={0}>
            <IndexTabGraph plotData={transparencyData['justica-estadual']} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <IndexTabGraph
              plotData={transparencyData['ministerios-publicos']}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <IndexTabGraph plotData={transparencyData['justica-do-trabalho']} />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <IndexTabGraph plotData={transparencyData['justica-militar']} />
          </TabPanel>
          <TabPanel value={value} index={4}>
            <IndexTabGraph plotData={transparencyData['justica-federal']} />
          </TabPanel>
          <TabPanel value={value} index={5}>
            <IndexTabGraph plotData={transparencyData['justica-eleitoral']} />
          </TabPanel>
          <TabPanel value={value} index={6}>
            <IndexTabGraph plotData={transparencyData['justica-superior']} />
          </TabPanel>
          <TabPanel value={value} index={7}>
            <IndexTabGraph
              plotData={transparencyData['conselhos-de-justica']}
            />
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
}
