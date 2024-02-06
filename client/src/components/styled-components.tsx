/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import styled from "styled-components";
export const ChatHeader = styled.span`
  font-weight: bold;
  font-size: 1.5rem;
`;

export const ColumnDiv = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ColumnCenterDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const RowDivSB = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`;

export const RowDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const JsonDisplay = styled.pre`
  white-space: pre-wrap;
  overflow-wrap: break-word;
  padding: 10px;
`;

export const BoldSpan = styled.span`
  font-weight: bold;
`;

export const SmallGreyText = styled.span`
  font-size: 0.8rem;
  color: grey;
`;
