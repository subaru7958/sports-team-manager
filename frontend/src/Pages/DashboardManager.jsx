import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import Seasons from "./Dashboard/Seasons";
import Coaches from "./Dashboard/Coaches";
import Players from "./Dashboard/Players";
import Schedules from "./Dashboard/Schedules";
import Groups from "./Dashboard/Groups";
import MainDashboard from "./Dashboard/MainDashboard";
import Settings from "./Settings";
import AcademyPlayers from "./Dashboard/AcademyPlayers";
import AcademyCoaches from "./Dashboard/AcademyCoaches";
import AcademyGroups from "./Dashboard/AcademyGroups";

const DashboardManager = () => {
    const [activePage, setActivePage] = useState("dashboard");

    const renderPage = () => {
        switch (activePage) {
            case "dashboard":
                return <MainDashboard />;
            case "seasons":
                return <Seasons onPageChange={setActivePage} />;
            case "groups":
                return <Groups />;
            case "schedules":
                return <Schedules />;
            case "coaches":
                return <Coaches />;
            case "players":
                return <Players />;
            case "settings":
                return <Settings />;
            case "academy-players":
                return <AcademyPlayers />;
            case "academy-coaches":
                return <AcademyCoaches />;
            case "academy-groups":
                return <AcademyGroups />;
            default:
                return <MainDashboard />;
        }
    };

    return (
        <DashboardLayout activePage={activePage} onPageChange={setActivePage}>
            {renderPage()}
        </DashboardLayout>
    );
};

export default DashboardManager;
