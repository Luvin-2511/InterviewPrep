import {BrowserRouter, Route, Routes, useLocation} from 'react-router-dom'
import Login from "./Features/Auth/Pages/Login.jsx";
import Register from "./Features/Auth/Pages/Register.jsx";
import Public from "./Features/Auth/components/Public.jsx";
import Home from "./Features/Auth/Pages/Home.jsx";
import InterviewPage from './Features/Interview/pages/InterviewPage.jsx';
import Private from './Features/Interview/components/Private.jsx';
import ReportPage from './Features/Interview/pages/ReportPage.jsx';
import ReportByIdPage from './Features/Interview/pages/ReportbyId.jsx';
import PageTransition from './Features/Auth/components/PageTransition.jsx';

function AnimatedRoutes() {
    const location = useLocation()
    return (
        <PageTransition>
            <Routes location={location}>
                <Route
                    path="/login"
                    element={
                        <Public>
                            <Login/>
                        </Public>
                    }/>

                <Route
                    path="/register"
                    element={
                        <Public>
                            <Register/>
                        </Public>
                    }/>

                <Route
                    path="/home"
                    element={
                        <Public>
                            <Home/>
                        </Public>
                    }
                />
                <Route
                    path="/"
                    element={
                        <Private>
                            <InterviewPage/>
                        </Private>
                    }
                />
                <Route
                    path="/reports/"
                    element={
                        <Private>
                            <ReportPage/>
                        </Private>
                    }
                />
                <Route
                    path="/report/:reportId"
                    element={
                        <Private>
                            <ReportByIdPage/>
                        </Private>
                    }
                />
            </Routes>
        </PageTransition>
    )
}

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <AnimatedRoutes />
        </BrowserRouter>
    )
}
export default AppRoutes
