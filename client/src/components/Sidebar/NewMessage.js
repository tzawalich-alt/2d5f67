import { Box, Typography } from "@material-ui/core";
 import { makeStyles } from '@material-ui/core/styles';


 const NewMessage = ({newCount}) => {

    const useStyles = makeStyles(() => ({
        root: {
            borderRadius: 16,
            padding: 10,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: "blue",
            '&:hover': {
            cursor: 'grab',
            },
        },
        newCount: {
            fontSize: 20,
            letterSpacing: -0.29,
            fontWeight: 'bold',
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