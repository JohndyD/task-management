import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentTasks from "./pages/StudentTasks";
import AdminTaskDetails from "./pages/AdminTaskDetails";

import AdminDashboard from "./pages/AdminDashboard";
import AdminSubmissions from "./pages/AdminSubmissions";
import AdminTasks from "./pages/AdminTasks";
import AddTask from "./pages/AddTask";
import EditTask from "./pages/EditTask";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* LOGIN */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* STUDENT */}

                <Route
                    path="/student"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/student/tasks"
                    element={<StudentTasks />}
                />


                {/* ADMIN */}

                <Route
                    path="/admin"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/tasks"
                    element={<AdminTasks />}
                />

                <Route
                    path="/admin/tasks/add"
                    element={<AddTask />}
                />

                <Route
                    path="/admin/tasks/:id/edit"
                    element={<EditTask />}
                />

                <Route
                    path="/admin/tasks/:id"
                    element={<AdminTaskDetails />}
                />

                <Route
                    path="/admin/submissions"
                    element={<AdminSubmissions />}
                />

            </Routes>

        </BrowserRouter>

    );
}


export default App;