/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

export interface ButtonDropdownItem {
  title: string;
  onClick: () => void;
  becomePrimary?: boolean;
  disabled?: boolean;
}

export default function ButtonDropdown(props: {
  dropdownItems: ButtonDropdownItem[];
  styles?: React.CSSProperties;
}): JSX.Element {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [lastSelectedIndex, setLastSelectedIndex] = React.useState(0);
  const [lastPrimaryIndex, setLastPrimaryIndex] = React.useState(-1);
  const curItem = props.dropdownItems[currentIndex];

  const primaryIndex = props.dropdownItems.findIndex(
    (dropdownItem) => dropdownItem.becomePrimary === true
  );
  if (primaryIndex !== lastPrimaryIndex) {
    setLastPrimaryIndex(primaryIndex);
    setCurrentIndex(primaryIndex !== -1 ? primaryIndex : lastSelectedIndex);
  }

  const handleClick = () => {
    curItem.onClick();
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number
  ) => {
    setLastSelectedIndex(index);
    setCurrentIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };
  return (
    <div data-cy="dropdown-button-list" style={props.styles}>
      <ButtonGroup variant="contained" color="primary" ref={anchorRef}>
        <Button
          data-cy="active-button"
          disabled={curItem.disabled}
          onClick={handleClick}
        >
          {curItem.title}
        </Button>
        <Button
          color="primary"
          size="small"
          aria-controls={open ? "split-button-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="menu"
          onClick={handleToggle}
          data-cy="dropdown-button"
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {props.dropdownItems.map((dropdownItem, index) => (
                    <MenuItem
                      key={index}
                      disabled={dropdownItem.disabled}
                      selected={index === currentIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                      data-cy={`dropdown-item-${index}`}
                    >
                      {dropdownItem.title}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}
