import React from 'react';
import PropTypes from 'prop-types';
import { Box, LinearProgress, Typography } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';

const LinearProgressBar = withStyles((theme) =>
  createStyles({
    root: {
      height: 20,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
      backgroundColor: '#1a90ff',
    },
  }),
)(LinearProgress);

function ProgressBar(props: { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgressBar
          id="progress-bar"
          variant="determinate"
          {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

ProgressBar.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default ProgressBar