import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import { warningMessage } from '../functions';
import { graphOptions, graphSeries } from '../functions/graphConfigs';
import NotCollecting from '../../Common/NotCollecting';
import RemunerationChartLegend from '../../RemunerationChartLegend';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

type AnnualRemunerationGraphProps = {
  year: number;
  agency: Agency;
  data: AnnualSummaryData[];
  dataLoading: boolean;
};

const AnnualRemunerationGraph: React.FC<AnnualRemunerationGraphProps> = ({
  year,
  agency,
  data,
  dataLoading = true,
}) => {
  const matches = useMediaQuery('(max-width:500px)');
  const [hidingRemunerations, setHidingRemunerations] = useState(false);
  const [hidingWage, setHidingWage] = useState(false);
  const [hidingBenefits, setHidingBenefits] = useState(false);
  const [hidingNoData, setHidingNoData] = useState(false);
  const [graphType, setGraphType] = useState('media-por-membro');

  const baseRemunerationDataTypes = useMemo(() => {
    if (graphType === 'media-por-membro') {
      return 'remuneracao_base_por_membro';
    }
    if (graphType === 'media-mensal') {
      return 'remuneracao_base_por_mes';
    }
    return 'remuneracao_base';
  }, [graphType]);

  const otherRemunerationsDataTypes = useMemo(() => {
    if (graphType === 'media-por-membro') {
      return 'outras_remuneracoes_por_membro';
    }
    if (graphType === 'media-mensal') {
      return 'outras_remuneracoes_por_mes';
    }
    return 'outras_remuneracoes';
  }, [graphType]);

  const discountsDataTypes = useMemo(() => {
    if (graphType === 'media-por-membro') {
      return 'descontos_por_membro';
    }
    if (graphType === 'media-mensal') {
      return 'descontos_por_mes';
    }
    return 'descontos';
  }, [graphType]);

  return (
    <>
      {agency && agency?.coletando && !data ? (
        <NotCollecting agency={agency} />
      ) : (
        <Box>
          <Paper elevation={0}>
            <RemunerationChartLegend
              agency={agency}
              data={data}
              graphType={graphType}
              setGraphType={setGraphType}
              baseRemunerationDataTypes={baseRemunerationDataTypes}
              otherRemunerationsDataTypes={otherRemunerationsDataTypes}
              discountsDataTypes={discountsDataTypes}
              hidingRemunerations={hidingRemunerations}
              setHidingRemunerations={setHidingRemunerations}
              hidingWage={hidingWage}
              setHidingWage={setHidingWage}
              hidingBenefits={hidingBenefits}
              setHidingBenefits={setHidingBenefits}
              hidingNoData={hidingNoData}
              setHidingNoData={setHidingNoData}
              warningMessage={warningMessage(
                data,
                baseRemunerationDataTypes,
                otherRemunerationsDataTypes,
              )}
              annual
            />
            <Box px={2}>
              {agency && data && !dataLoading ? (
                <Grid display="flex" justifyContent="flex-end" mr={1} mt={1}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    endIcon={<ArrowForwardIosIcon />}
                    href={`/orgao/${agency.id_orgao}/${year}`}
                  >
                    EXPLORAR
                  </Button>
                </Grid>
              ) : null}
              {dataLoading ? (
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
              ) : (
                <>
                  {data.length > 0 ? (
                    <Box>
                      <Suspense fallback={<CircularProgress />}>
                        <Chart
                          options={graphOptions({
                            agency,
                            data,
                            matches,
                            baseRemunerationDataTypes,
                            otherRemunerationsDataTypes,
                          })}
                          series={graphSeries({
                            data,
                            baseRemunerationDataTypes,
                            otherRemunerationsDataTypes,
                            discountsDataTypes,
                            hidingRemunerations,
                            hidingBenefits,
                            hidingWage,
                            hidingNoData,
                            matches,
                          })}
                          width="100%"
                          height="500"
                          type="line"
                        />
                      </Suspense>
                    </Box>
                  ) : (
                    <Typography variant="body1" py={2} textAlign="center">
                      Não há dados para esse ano.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default AnnualRemunerationGraph;
