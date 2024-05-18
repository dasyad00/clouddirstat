import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableSortLabel,
  Box,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { CloudFolder, CloudItem } from "../cloudDrive";
import { convertBytes } from "../utils";
import React, { useMemo, useState } from "react";

type Order = "asc" | "desc";

interface HeaderCell {
  id: keyof CloudItem;
  label: string;
  numeric: boolean;
}

const headerCells: readonly HeaderCell[] = [
  {
    id: "name",
    label: "Name",
    numeric: false,
  },
  {
    id: "size",
    label: "Size",
    numeric: true,
  },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function instanceOfCloudFolder(object: CloudItem): object is CloudFolder {
  return "children" in object;
}

const folderFirstSort = (a: CloudItem, b: CloudItem) => {
  if (instanceOfCloudFolder(a) && !instanceOfCloudFolder(b)) {
    return -1;
  }
  if (!instanceOfCloudFolder(a) && instanceOfCloudFolder(b)) {
    return 1;
  }
  return -descendingComparator(a, b, "name");
};

function getComparator(
  order: Order,
  orderBy: keyof CloudItem
): (a: CloudItem, b: CloudItem) => number {
  if (orderBy === "name") {
    return order === "desc"
      ? (a, b) => folderFirstSort(a, b)
      : (a, b) => -folderFirstSort(a, b);
  }
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface ListViewProps {
  files: CloudItem[];
  // onRequestSort: (event: React.MouseEvent<unknown>, property: keyof CloudItem) => void;
}

export const ListView = (props: ListViewProps) => {
  const { files } = props;
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof CloudItem>("name");

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: keyof CloudItem
  ) => {
    const isAsc = orderBy === property && order === "asc";
    console.log(`property=${property}, isAsc=${isAsc}`);
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const createSortHandler =
    (property: keyof CloudItem) => (event: React.MouseEvent) => {
      // onRequestSort(event, property);
      handleRequestSort(event, property);
    };

  const visibleRows = useMemo(
    () => files.sort(getComparator(order, orderBy)),
    [files, order, orderBy]
  );

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" />
            {headerCells.map((headerCell) => (
              <TableCell
                key={headerCell.id}
                align={headerCell.numeric ? "right" : "left"}
                sortDirection={orderBy === headerCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headerCell.id}
                  direction={orderBy === headerCell.id ? order : "asc"}
                  onClick={createSortHandler(headerCell.id)}
                >
                  {headerCell.label}
                  {orderBy === headerCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((file: CloudItem) => (
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
