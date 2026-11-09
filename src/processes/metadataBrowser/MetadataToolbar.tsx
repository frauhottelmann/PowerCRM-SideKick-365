import MenuItem from "@mui/material/MenuItem";
import {
    GridCsvExportMenuItem,
    gridFilteredSortedRowEntriesSelector,
    GridPrintExportMenuItem,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarExportContainer,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
    useGridApiContext,
    type GridToolbarProps
} from "@mui/x-data-grid";
import { useSnackbar } from "notistack";

import { downloadJsonFile } from "../../utils/global/common";

/**
 * The default grid toolbar, with two extra entries in the Export menu: download the rows as a JSON file
 * and copy them to the clipboard. The JSON holds the complete metadata objects as Zoho returns them,
 * not only the visible columns, and follows the current filter and sort like the CSV export does.
 * The file name comes from `csvOptions.fileName`.
 */
function MetadataToolbar(props: GridToolbarProps) {
    const { csvOptions, printOptions, showQuickFilter = true, quickFilterProps } = props;
    const fileName = csvOptions?.fileName ?? "zoho-metadata";

    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExportContainer>
                <GridCsvExportMenuItem options={csvOptions} />
                <GridPrintExportMenuItem options={printOptions} />
                <JsonDownloadMenuItem fileName={fileName} />
                <JsonCopyMenuItem />
            </GridToolbarExportContainer>
            <div style={{ flex: 1 }} />
            {showQuickFilter && <GridToolbarQuickFilter {...quickFilterProps} />}
        </GridToolbarContainer>
    );
}

interface JsonMenuItemProps {
    /** Injected by GridToolbarExportContainer */
    hideMenu?: () => void;
}

function useExportedRows() {
    const apiRef = useGridApiContext();
    return () => gridFilteredSortedRowEntriesSelector(apiRef).map((entry) => entry.model);
}

function JsonDownloadMenuItem(props: JsonMenuItemProps & { fileName: string }) {
    const getRows = useExportedRows();
    return (
        <MenuItem
            onClick={() => {
                downloadJsonFile(getRows(), `${props.fileName}.json`);
                props.hideMenu?.();
            }}>
            Download as JSON
        </MenuItem>
    );
}

function JsonCopyMenuItem(props: JsonMenuItemProps) {
    const getRows = useExportedRows();
    const { enqueueSnackbar } = useSnackbar();
    return (
        <MenuItem
            onClick={() => {
                const rows = getRows();
                navigator.clipboard
                    .writeText(JSON.stringify(rows, null, 2))
                    .then(() => enqueueSnackbar(`${rows.length} entries copied as JSON.`, { variant: "default" }))
                    .catch((error) => {
                        console.warn("Copy failed", error);
                        enqueueSnackbar("Copying the JSON failed.", { variant: "error" });
                    });
                props.hideMenu?.();
            }}>
            Copy as JSON
        </MenuItem>
    );
}

export default MetadataToolbar;
