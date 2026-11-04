import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Alert, { type AlertColor } from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { SnackbarContent, useSnackbar, type CustomContentProps } from "notistack";
import React, { forwardRef, useCallback, useState } from "react";

import { PROJECT_PREFIX } from "../global/var";

declare module "notistack" {
    interface VariantOverrides {
        detailsFile: true;
    }

    interface OptionsObject {
        detailsVariant?: AlertColor;
        allowDownload?: boolean;
        downloadButtonLabel?: string;
        detailsNode?: React.ReactNode;
        fileContent?: string;
        fileName?: string;
    }
}

const StyledSnackbarContent = styled(SnackbarContent)({
    "@media (min-width:600px)": {
        minWidth: "344px !important"
    }
});

interface DetailsSnackbarProps extends CustomContentProps {
    detailsVariant: AlertColor;
    allowDownload?: boolean;
    downloadButtonLabel?: string;
    detailsNode: React.ReactNode;
    fileName?: string;
    fileContent?: string;
}

const DetailsSnackbar = forwardRef<HTMLDivElement, DetailsSnackbarProps>(({ id, ...props }, ref) => {
    const { closeSnackbar } = useSnackbar();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = useCallback(() => {
        setExpanded((oldExpanded) => !oldExpanded);
    }, []);

    const handleDismiss = useCallback(() => {
        closeSnackbar(id);
    }, [id, closeSnackbar]);

    const downloadTxtFile = () => {
        if (!props.fileContent || !props.fileName) return;
        const errorRawObject = JSON.parse(props.fileContent);

        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(errorRawObject, null, 2)], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = props.fileName;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        element.remove();
    };

    return (
        <StyledSnackbarContent ref={ref}>
            <Alert
                variant="filled"
                severity={props.detailsVariant}
                iconMapping={{ error: <CancelIcon /> }}
                sx={{ [`&.${PROJECT_PREFIX}Alert-message`]: { pt: 1, pb: 1 } }}>
                <AlertTitle>
                    <Stack width="100%" direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2">{props.message}</Typography>
                        <IconButton
                            aria-label="Show more"
                            size="small"
                            sx={{
                                color: "inherit",
                                opacity: 0.8,
                                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "all .2s"
                            }}
                            onClick={handleExpandClick}>
                            <ExpandMoreIcon />
                        </IconButton>
                        <IconButton size="small" sx={{ color: "inherit", opacity: 0.8 }} onClick={handleDismiss}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </AlertTitle>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Paper sx={{ p: "16px", width: "86%" }}>
                        {!!props.detailsNode && props.detailsNode}
                        {props.allowDownload && (
                            <Button
                                size="small"
                                color="primary"
                                sx={{ p: 0, textTransform: "none" }}
                                onClick={downloadTxtFile}>
                                <CheckCircleIcon sx={{ fontSize: 20, pr: "4px" }} />
                                {props.downloadButtonLabel}
                            </Button>
                        )}
                    </Paper>
                </Collapse>
            </Alert>
        </StyledSnackbarContent>
    );
});

DetailsSnackbar.displayName = "DetailsSnackbar";

export default DetailsSnackbar;
