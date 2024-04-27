import React from "react";

import SignInButton from "./SignInButton";

const AppBar = () => {
    return (
        <header className="flex items-center justify-between pl-10 pr-10 h-20 gap-4 bg-gradient-to-b from-white to-gray-200 shadow">
            <h1 className="text-black">solveMyProblem</h1>
            <SignInButton></SignInButton>
        </header>
    )
}

export default AppBar;