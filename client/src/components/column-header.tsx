/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { TableCell, TableHead, TableSortLabel, TableRow } from "@mui/material";

export interface ColumnDef {
  id: string;
  subField?: string[];
  name?: string;
  label: string;
  minWidth: number;
  align?: "right" | "left" | "center";
  sortable?: boolean;
  format?: (v: number) => string;
}

export const ColumnHeader = (props: {
  columns: ColumnDef[];
  sortBy: string;
  sortSub?: string[];
  sortAsc: boolean;
  onSort: (id: string, subField?: string[]) => void;
}): JSX.Element => {
  const { columns, sortBy, sortSub, sortAsc, onSort } = props;

  return (
    <TableHead data-cy="column-header">
      <TableRow>
        {columns.map((column) => {
          return (
            <TableCell
              data-cy={column.id}
              key={`${column.id}${column.subField?.toString() || ""}`}
              align={column.align}
              style={{ minWidth: column.minWidth }}
            >
              {!column.sortable ? (
                column.label
              ) : (
                <TableSortLabel
                  data-cy="sort"
                  active={sortBy === column.id && sortSub === column.subField}
                  direction={sortAsc ? "asc" : "desc"}
                  onClick={() => {
                    onSort(column.id, column.subField);
                  }}
                >
                  {column.label}
                </TableSortLabel>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
};
