import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Paper,
  Button,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import MONTHS from '../../../@types/MONTHS';
import light from '../../../styles/theme-light';
import TransitionModal from '../TransitionModal';

const ErrorTable: React.FC<{
  agency: Agency;
  month: number;
  year: number;
}> = ({ agency, month, year }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#3e5363',
    border: '1px solid white',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };
  return (
    <>
      <ThemeProvider theme={light}>
        <Box m={4}>
          <Stack
            spacing={2}
            direction="row"
            justifyContent="space-between"
            mt={2}
            mb={4}
          >
            <Button
              variant="outlined"
              color="info"
              startIcon={<ArrowBackIcon />}
              href={`/orgao/${agency?.id_orgao}/${year}`}
            >
              VOLTAR PARA EXPLORAR POR ANO
            </Button>
            <TransitionModal
              agency={agency}
              open={open}
              handleClose={handleClose}
              style={style}
            >
              <Button onClick={handleOpen} variant="outlined" color="info">
                AJUDE-NOS A ABRIR OS DADOS
              </Button>
            </TransitionModal>
          </Stack>
          <Paper elevation={0}>
            <Box textAlign="center">
              <Image
                src="/img/undraw_cancel.svg"
                alt="cancelar"
                width={200}
                height={200}
              />
              <Typography variant="body1" py={2}>
                O <strong>{agency?.id_orgao.toUpperCase()}</strong> não
                disponibilizou os dados de{' '}
                <strong>
                  {MONTHS[month]} de {year}
                </strong>
                .
              </Typography>
            </Box>
          </Paper>
        </Box>
      </ThemeProvider>
    </>
  );
};

export default ErrorTable;
