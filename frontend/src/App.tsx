import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import JobBoard from './pages/JobBoard';
import ApplicationFeedback from './pages/ApplicationFeedback';
export default function App(){return <BrowserRouter><Routes><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/><Route element={<ProtectedRoute/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/jobs" element={<JobBoard/>}/><Route path="/applications/:id" element={<ApplicationFeedback/>}/></Route><Route path="*" element={<Navigate to="/dashboard" replace/>}/></Routes></BrowserRouter>}
