// This file is a legacy MVP stub and is no longer used.
// The active student page is: src/pages/student/StudentDashboard.jsx
// App.jsx routes /student/dashboard to StudentDashboard, not this file.
//
// Kept only to avoid breaking any stale import references.
// DO NOT add this to App.jsx routes — it has no authentication.

import React from 'react';
import { Navigate } from 'react-router-dom';

const StudentPage = () => <Navigate to="/student/dashboard" replace />;

export default StudentPage;
