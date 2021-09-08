import { h } from "preact"
import { Box, Button, FormControl, FormControlLabel, FormLabel, LinearProgress, makeStyles, TextField, Typography } from "@material-ui/core"
import PublishIcon from '@material-ui/icons/Publish';
import { Ref, useRef, useState } from "react";
interface OwnProps
{
    label: string
    valid_file_types: string[]
    allow_multiple?:boolean
}

export function DragDropUploader(props:OwnProps) {
    const [selectedFiles, setSelectedFiles] = useState([] as File[]);
    const [validFiles, setValidFiles] = useState([] as File[]);
    const [unsupportedFiles, setUnsupportedFiles] = useState([] as File[]);
    const [errorMessage, setErrorMessage] = useState('');

    const interceptAndDoNothing = (e:DragEvent) => e.preventDefault();
    const drop = (e:any) => {
        e.preventDefault();
        const files:FileList = e.dataTransfer.files;
        if (files.length) {
            handle_files(files)
        }
    }

    const handle_files = (files:FileList) => {
        for(let i = 0; i < files.length; i++) {
            const file:File = files.item(i)!;
            // setSelectedFiles((prevArray:any[]) => [...prevArray, file]);
            if (validate_file(file)) {
                if (props.allow_multiple) {
                    setValidFiles((prevArray:any[]) => [...prevArray, file]);
                } else {
                    setValidFiles([file]);
                }
            } else {
                setUnsupportedFiles(prevArray => [...prevArray, file]);
                setErrorMessage('File type not permitted');
            }
        }
    }

    const validate_file = (file:File) => {
        if (props.valid_file_types.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }

    const filesSelected = () => {
        if (fileInputRef?.current?.files?.length) {
            handle_files(fileInputRef.current.files);
        }
    }

    const file_size = (size:number) => {
        if (size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const file_type = (file_name:string) => {
        return file_name.substring(file_name.lastIndexOf('.') + 1, file_name.length) || file_name;
    }

    const fileInputRef:Ref<HTMLInputElement> = useRef();
    const progressRef = useRef();

    const useStyles = makeStyles(theme => ({
        container: {
            borderColor:"red",
            borderStyle: "dashed",
            borderWidth: 2,
            display:"flex", flexDirection:"column",
            height:"100%",
            justifyContent: "center",   alignItems: "stretch",
        }
      }));
    const classes = useStyles();
    // onDragOver={interceptAndDoNothing}
    // onDragEnter={interceptAndDoNothing}
    // onDragLeave={interceptAndDoNothing}
    // onDrop={drop}
    return (
        <Box className={`${classes.container}`} >
            <TextField
                inputProps={{
                    accept:props.valid_file_types,
                }}
                inputRef={fileInputRef}
                multiple={props.allow_multiple || false}
                type="file"
                variant="outlined"
                onChange={filesSelected}
            />
            {validFiles.map((file:File, i) => {
                return (
                    <Box>
                        <LinearProgress variant="determinate" color="primary" value={89} ref={progressRef} />
                        <Typography component="span" className="file_type">{file_type(file.name)} </Typography>
                        <Typography component="span" className="file_name">{file.name} </Typography>
                        <Typography component="span" className="file_size">{file_size(file.size)} </Typography>
                    </Box>
                )
            })}
        </Box>
    )
}
