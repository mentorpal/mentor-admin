/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  TableCell,
  TableHead,
  TableSortLabel,
  TableRow,
} from "@material-ui/core";

export interface ColumnDef {
  id: string;
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
  sortAsc: boolean;
  onSort: (id: string) => void;
}) => {
  const { columns, sortBy, sortAsc, onSort } = props;

  return (
    <TableHead id="column-header">
      <TableRow>
        {columns.map((column) => (
          <TableCell
            id={column.id}
            key={column.id}
            align={column.align}
            style={{ minWidth: column.minWidth }}
          >
            {!column.sortable ? (
              column.label
            ) : (
              <TableSortLabel
                id="sort"
                active={sortBy === column.id}
                direction={sortAsc ? "asc" : "desc"}
                onClick={() => {
                  onSort(column.id);
                }}
              >
                {column.label}
              </TableSortLabel>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
