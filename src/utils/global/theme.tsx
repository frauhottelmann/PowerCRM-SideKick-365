import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useMemo } from "react";

import { DRAWER_CONTAINER_ID, PROJECT_PREFIX } from "./var";

// Zoho CRM sets a small root font size (html { font-size: 62.5% }). MUI sizes text in rem, so without
// this correction every tool renders at roughly 60% of its intended size.
function getPageRootFontSize(): number {
    const size = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return size > 0 ? size : 16;
}

// Tooltips, menus and dialogs render in the side panel's own container. Inside <body> they would be laid out
// relative to the narrowed Zoho page while the panel is open, and could end up behind the panel.
function getPortalContainer(): HTMLElement {
    return document.getElementById(PROJECT_PREFIX + DRAWER_CONTAINER_ID) ?? document.body;
}

export function SidekickThemeProvider(props: { children: React.ReactNode }) {
    const theme = useMemo(
        () =>
            createTheme({
                typography: { htmlFontSize: getPageRootFontSize() },
                components: {
                    MuiPopper: { defaultProps: { container: getPortalContainer } },
                    MuiModal: { defaultProps: { container: getPortalContainer } }
                }
            }),
        []
    );
    return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
}
