import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { CloudItem } from "../cloudDrive";
import { convertBytes } from "../utils";

export const ListView = (props: { files: CloudItem[] }) => {
  const files = props.files;
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            <TableCell>File name</TableCell>
            <TableCell align="right">Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((file: CloudItem) => (
            <TableRow
              key={file.id}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>
                <img
                  srcSet={`${file.iconLink}?w=161&fit=crop&auto=format&dpr=2 2x`}
                  src={`${file.iconLink}?w=161&fit=crop&auto=format`}
                  alt={file.iconLink}
                  loading="lazy"
                />
              </TableCell>
              <TableCell component="th" scope="row">
                {file.name}
              </TableCell>
              {file.size ? (
                <TableCell align="right">{convertBytes(file.size)}</TableCell>
              ) : (
                <TableCell align="right"></TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
