import { Drawer } from "@mui/material";
import React, { type PropsWithChildren } from "react";

import type { ToolPanelButton } from "../../global/.toolPanelButton";

interface PanelDrawerItemProps {
    width: ToolPanelButton["width"];
    open: boolean;
    /** Distance from the top of the window, so the panel starts below Zoho's top bar */
    top: number;
}

function PanelDrawerItem(props: PanelDrawerItemProps & PropsWithChildren) {
    const { width, open, top, children } = props;

    return (
        <div>
            <Drawer
                anchor={"right"}
                open={open}
                hideBackdrop
                ModalProps={{
                    disableScrollLock: true,
                    keepMounted: true
                }}
                PaperProps={{
                    sx: {
                        top: "unset",
                        bottom: 0,
                        right: 47,
                        height: `calc(100% - ${top}px)`,
                        zIndex: 1199,
                        width: width,
                        overflow: "visible",
                        // Wide panels lie over the white Zoho page, so set them off with a line and a shadow
                        borderTop: 1,
                        borderLeft: 1,
                        borderColor: "divider",
                        boxShadow: "-4px 4px 16px rgba(0, 0, 0, 0.12)"
                    },
                    style: {
                        visibility: "visible"
                    }
                }}
                sx={{
                    width: width
                }}
                variant="persistent">
                {children}
            </Drawer>
        </div>
    );
}

export default PanelDrawerItem;
