import { Box, Typography } from "@material-ui/core";
 import { makeStyles } from '@material-ui/core/styles';


 const NewMessage = ({newCount}) => {

    const useStyles = makeStyles(() => ({
        root: {
            borderRadius: "15px",
            padding: "5px 10px",
            display: 'flex',
            alignItems: 'center',
            backgroundColor: "#3F92FF",
        },
        newCount: {
            fontSize: '10px',
            letterSpacing: -0.29,
            color: "#fff",
        }
    }));

    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <Typography className={classes.newCount}>{newCount}</Typography>
        </Box>
    )
}

export default NewMessage;