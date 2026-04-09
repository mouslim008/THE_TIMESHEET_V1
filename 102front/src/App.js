import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeLanguageProvider } from './ThemeLanguageContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/AdminDashboard';
import CreateUser from './pages/CreateUser';
import AssignRoles from './pages/AssignRoles';
import AddProject from './pages/AddProject';
import ResetPassword from './pages/ResetPassword';
import Notify from './pages/Notify';
import ExportData from './pages/ExportData';
import Notifications from './pages/Notifications';
import UserDashboard from './pages/UserDashboard';
import UserNotifications from './pages/UserNotifications';
import UserReporting from './pages/UserReporting';
import UserCollaboration from './pages/UserCollaboration';
import UserLeaveRequests from './pages/UserLeaveRequests';
import UserProfile from './pages/UserProfile';
import WorkAttachments from './pages/WorkAttachments';
import UserTimesheets from './pages/UserTimesheets';
import UserExpenses from './pages/UserExpenses';
import TeamChat from './pages/TeamChat';
import AdminLeaveRequests from './pages/AdminLeaveRequests';
import AllRoles from './pages/AllRoles';
import UserList from './pages/UserList';
import AdminList from './pages/AdminList';
import ProjectList from './pages/ProjectList';
import ProjectArchiveDetail from './pages/ProjectArchiveDetail';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <ThemeLanguageProvider>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    
                    {/* Admin/SuperAdmin Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute roles={['admin', 'superadmin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/team-chat" element={
                        <ProtectedRoute roles={['admin', 'superadmin']}>
                            <TeamChat />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin-leave-requests" element={
                        <ProtectedRoute roles={['admin', 'superadmin']}>
                            <AdminLeaveRequests />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/user-dashboard" element={
                        <ProtectedRoute roles={['user']}>
                            <UserDashboard />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/user-notifications" element={
                        <ProtectedRoute roles={['user']}>
                            <UserNotifications />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-reporting" element={
                        <ProtectedRoute roles={['user']}>
                            <UserReporting />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-collaboration" element={
                        <ProtectedRoute roles={['user']}>
                            <UserCollaboration />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-timesheets" element={
                        <ProtectedRoute roles={['user']}>
                            <UserTimesheets />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-expenses" element={
                        <ProtectedRoute roles={['user']}>
                            <UserExpenses />
                        </ProtectedRoute>
                    } />
                    <Route path="/work-attachments" element={
                        <ProtectedRoute roles={['user', 'admin', 'superadmin']}>
                            <WorkAttachments />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-leave-requests" element={
                        <ProtectedRoute roles={['user']}>
                            <UserLeaveRequests />
                        </ProtectedRoute>
                    } />
                    <Route path="/user-profile" element={
                        <ProtectedRoute roles={['user']}>
                            <UserProfile />
                        </ProtectedRoute>
                    } />
                    
                    {/* SuperAdmin Only Routes */}
                    <Route path="/create-user" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <CreateUser role="user" />
                        </ProtectedRoute>
                    } />
                    <Route path="/create-admin" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <CreateUser role="admin" />
                        </ProtectedRoute>
                    } />
                    <Route path="/assign-roles" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <AssignRoles />
                        </ProtectedRoute>
                    } />
                    <Route path="/all-roles" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <AllRoles />
                        </ProtectedRoute>
                    } />
                    <Route path="/add-project" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <AddProject />
                        </ProtectedRoute>
                    } />
                    <Route path="/reset-password" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <ResetPassword />
                        </ProtectedRoute>
                    } />
                    <Route path="/notify" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <Notify />
                        </ProtectedRoute>
                    } />
                    <Route path="/export-timesheets" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <ExportData type="timesheets" />
                        </ProtectedRoute>
                    } />
                    <Route path="/export-expenses" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <ExportData type="expenses" />
                        </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <Notifications />
                        </ProtectedRoute>
                    } />

                    <Route path="/users-list" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <UserList />
                        </ProtectedRoute>
                    } />
                    <Route path="/admins-list" element={
                        <ProtectedRoute roles={['superadmin']}>
                            <AdminList />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects-list" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <ProjectList />
                        </ProtectedRoute>
                    } />
                    <Route path="/project-archive/:id" element={
                        <ProtectedRoute roles={['superadmin', 'admin']}>
                            <ProjectArchiveDetail />
                        </ProtectedRoute>
                    } />

                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
            </ThemeLanguageProvider>
        </Router>
    );
}

export default App;
