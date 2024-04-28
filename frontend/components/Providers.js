"use client"

import { SessionProvider } from "next-auth/react";
import React, {ReactNode} from "react";

const Providers = (props) => {
    return React.createElement(SessionProvider, null, props.children);
};

export default Providers