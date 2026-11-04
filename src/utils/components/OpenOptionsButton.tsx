import type { ButtonPropsVariantOverrides } from "@mui/material";
import Button from "@mui/material/Button";
import type { OverridableStringUnion } from "@mui/types";

// import ExtensionTarget from '../types/ExtensionTarget';
import { isFirefox } from "~utils/global/var";

import MessageManager from "../global/MessageManager";
import { MessageType } from "../types/Message";

export type OpenOptionsButtonProps = {
    text?: string | null;
    variant?: OverridableStringUnion<"text" | "outlined" | "contained", ButtonPropsVariantOverrides>;
};

function OpenOptionsButton(props: OpenOptionsButtonProps) {
    const { text, variant } = props;

    return isFirefox ? null : (
        <Button
            variant={variant}
            onClick={() => {
                MessageManager.sendMessage(MessageType.OPENOPTIONS);
            }}>
            {text ?? "Open option screen"}
        </Button>
    );
}

export default OpenOptionsButton;
