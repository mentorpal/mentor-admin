// import clsx from "clsx";
// import React, { useContext, useState } from "react";
// import { useCookies } from "react-cookie";
// import { navigate } from "gatsby";
// import {
//   Button,
//   Card,
//   CardActions,
//   CardContent,
//   CircularProgress,
//   Collapse,
//   Grid,
//   IconButton,
//   List,
//   ListItem,
//   MenuItem,
//   Paper,
//   Select,
//   Typography,
// } from "@material-ui/core";
// import { makeStyles } from "@material-ui/core/styles";
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import { fetchMentor } from "api";
// import { Mentor, Question, Status } from "types";
// import Context from "context";
// import NavBar from "components/nav-bar";
// import ProgressBar from "components/progress-bar";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     width: "100%",
//     height: "100%",
//     flexGrow: 1,
//   },
//   panel: {
//     height: "100%",
//     padding: 10,
//   },
//   expand: {
//     transform: "rotate(0deg)",
//     marginLeft: "auto",
//     transition: theme.transitions.create("transform", {
//       duration: theme.transitions.duration.shortest,
//     }),
//   },
//   expandOpen: {
//     transform: "rotate(180deg)",
//   },
// }));

// function QuestionList(props: {
//   id: string,
//   header: string,
//   questions: Question[],
//   classes: any,
// }): JSX.Element {
//   const { id, header, questions, classes } = props;
//   const [isExpanded, setExpanded] = React.useState(false);

//   return (
//     <Card id={id} elevation={0} style={{ textAlign: "left" }} >
//       <CardContent style={{ padding: 0 }}>
//         <div style={{ display: "flex", flexDirection: "row" }}>
//           <CardActions>
//             <IconButton
//               id="expand"
//               size="small"
//               aria-expanded={isExpanded}
//               className={clsx(classes.expand, {
//                 [classes.expandOpen]: isExpanded,
//               })}
//               onClick={() => setExpanded(!isExpanded)}
//             >
//               <ExpandMoreIcon />
//             </IconButton>
//           </CardActions>
//           <Typography variant="h6" style={{ padding: 15 }}>
//             {header} ({questions.length})
//           </Typography>
//         </div>
//         <Collapse
//           in={isExpanded}
//           timeout="auto"
//           unmountOnExit
//           style={{ paddingLeft: 15, paddingTop: 10 }}
//         >
//           <List>
//             {
//               questions.map((q, i) =>
//                 <ListItem key={`${id}-${i}`}>

//                 </ListItem>
//               )
//             }
//           </List>
//         </Collapse>
//       </CardContent>
//     </Card>
//   )
// }

// function QuestionsPanel(props: {
//   classes: any,
//   questions: Question[],
// }): JSX.Element {
//   const { classes, questions } = props;
//   const [topicFilter, setTopicFilter] = useState("");
//   const [selected, setSelected] = useState<Question[]>([]);
//   const [status, setStatus] = useState(Status.INCOMPLETE);

//   const complete = questions.filter((q) => { return q.status === Status.COMPLETE })
//   const incomplete = questions.filter((q) => { return q.status === Status.INCOMPLETE });

//   function onUpdateSelected(): void {

//   }

//   function onUpdateStatus(): void {

//   }

//   return (
//     <Paper id="questions" className={classes.panel}>
//       <div id="progress" style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
//         <Typography variant="h6">
//           Questions ({complete.length} / {questions.length})
//         </Typography>
//         <div style={{ flexGrow: 1, marginLeft: 25, }}>
//           <ProgressBar value={complete.length / questions.length} />
//         </div>
//       </div>
//       <QuestionList id="complete-questions" header="Approved" questions={complete} classes={classes} />
//       <QuestionList id="incomplete-questions" header="Incomplete" questions={incomplete} classes={classes} />
//       <Grid container spacing={1} style={{ paddingTop: 20, paddingBottom: 20 }}>
//         <Grid item xs={6} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
//           <Typography style={{ fontWeight: "bold" }}>
//             Set Status:
//           </Typography>
//           <Select
//             id="select-grade"
//             value={status.toString()}
//             onChange={(event: React.ChangeEvent<{ value: unknown; name?: unknown }>) => { setStatus(event.target.value as Status) }}
//             style={{ marginLeft: 10 }}
//           >
//             <MenuItem id="incomplete" value={Status.INCOMPLETE}>
//               {Status.INCOMPLETE}
//             </MenuItem>
//             <MenuItem id="complete" value={Status.COMPLETE}>
//               {Status.COMPLETE}
//             </MenuItem>
//           </Select>
//           <IconButton onClick={onUpdateStatus}>
//             <CheckCircleIcon />
//           </IconButton>
//         </Grid>
//         <Grid item xs={6} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
//           <Button>
//             Normalize
//           </Button>
//         </Grid>
//       </Grid>
//       <Button id="update" variant="contained" color="primary">
//         Update Questions
//       </Button>
//     </Paper>
//   )
// }

// function DetailsPanel(): JSX.Element {
//   return (
//     <div>
//     </div>
//   )
// }

// function ConfigPage(): JSX.Element {
//   const classes = useStyles();
//   const context = useContext(Context);
//   const [cookies] = useCookies(["accessToken"]);
//   const [mentor, setMentor] = useState<Mentor>();

//   React.useEffect(() => {
//     if (!cookies.accessToken) {
//       navigate("/login");
//     }
//   }, [cookies]);

//   React.useEffect(() => {
//     if (!context.user) {
//       return;
//     }
//     fetchMentor(context.user._id, cookies.accessToken)
//       .then((mentor) => {
//         setMentor(mentor);
//       })
//       .catch((err) => console.error(err));
//   }, [context.user]);

//   if (!context.user || !mentor) {
//     return (
//       <div>
//         <NavBar title="Mentor Config" />
//         <CircularProgress />
//       </div>
//     )
//   }

//   return (
//     <div className={classes.root}>
//       <NavBar title="Mentor Config" back={true} />
//       <Grid container spacing={1}>
//         <Grid item xs={6}>
//           <QuestionsPanel classes={classes} questions={mentor.questions} />
//         </Grid>
//         <Grid item xs={6}>
//           <DetailsPanel />
//         </Grid>
//       </Grid>
//     </div>
//   )
// }

// export default ConfigPage
