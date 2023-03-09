import { useRouter } from 'next/router';
import React, { HTMLAttributes } from 'react';
import {
  FormControl,
  ListSubheader,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import STATE_AGENCIES from '../@types/STATE_AGENCIES';

export interface DropDownGroupSelectorProps
  extends Omit<HTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value?: STATE_AGENCIES;
}

const DropDownGroupSelector: React.FC<DropDownGroupSelectorProps> = ({
  value,
}) => {
  const router = useRouter();
  const [agencyName, setAgencyName] = React.useState(value || '');
  const handleChange = (event: SelectChangeEvent) => {
    const v = event.target.value as string;
    setAgencyName(v);
    router.push(`/grupo/${v}`);
  };

  return (
    <FormControl fullWidth sx={{ m: 1, minWidth: 240, maxWidth: 250 }}>
      <Select
        id="orgaos-select"
        labelId="orgaos-select-label"
        defaultValue=""
        value={agencyName}
        label="Estados"
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Dados por órgão' }}
        input={<OutlinedInput />}
        renderValue={selected => {
          if (selected.length === 0) {
            return <em>Selecione</em>;
          }
          return formatToAgency(selected);
        }}
      >
        <ListSubheader>
          <em>Grupos disponíveis</em>
        </ListSubheader>
        <MenuItem key="0" value="JUSTICA-ESTADUAL">
          Justiça Estadual
        </MenuItem>
        <MenuItem key="1" value="MINISTERIOS-PUBLICOS">
          Ministérios Públicos
        </MenuItem>
        <MenuItem key="2" value="JUSTICA-DO-TRABALHO">
          Justiça do Trabalho
        </MenuItem>
        <MenuItem key="3" value="JUSTICA-MILITAR">
          Justiça Militar
        </MenuItem>
        <MenuItem key="4" value="JUSTICA-FEDERAL">
          Justiça Federal
        </MenuItem>
        <MenuItem key="5" value="JUSTICA-ELEITORAL">
          Justiça Eleitoral
        </MenuItem>
        <MenuItem key="6" value="JUSTICA-SUPERIOR">
          Justiça Superior
        </MenuItem>
        <MenuItem key="7" value="CONSELHOS-DE-JUSTICA">
          Conselhos de Justiça
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default DropDownGroupSelector;

export function formatToAgency(agency: string) {
  if (agency === '') {
    return '';
  }
  const sub = agency.split('-');
  const formatedSubs = sub.map(s => {
    const a = s.toLowerCase();
    const newString = a.split('');
    newString[0] = a[0].toLocaleUpperCase();
    return newString.join('');
  });
  const a = formatedSubs.join(' ');
  const final = a.includes('Justica')
    ? a.replace('Justica', 'Justiça')
    : a.includes('Ministerios Publicos')
    ? a.replace('Ministerios Publicos', 'Ministérios Públicos')
    : a;

  return final.split(' ').length > 2
    ? `${final.split(' ')[0]} 
    ${final.split(' ')[1].toLowerCase()} 
    ${final.split(' ')[2]}`
    : final;
}
