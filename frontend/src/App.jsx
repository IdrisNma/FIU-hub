import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NewsPage from './pages/NewsPage'
import TypologiesPage from './pages/TypologiesPage'
import QAPage from './pages/QAPage'
import GroupsPage from './pages/GroupsPage'
import EventsPage from './pages/EventsPage'
import JurisdictionsPage from './pages/JurisdictionsPage'
import EditProfilePage from './pages/EditProfilePage'
import CreateEventPage from './pages/CreateEventPage'
import CreateGroupPage from './pages/CreateGroupPage'

export default function App() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main shell — Navbar + Outlet */}
      <Route element={<MainLayout />}>
        <Route index                  element={<HomePage />} />
        <Route path="/news"           element={<NewsPage />} />
        <Route path="/typologies"     element={<TypologiesPage />} />
        <Route path="/qa"             element={<QAPage />} />
        <Route path="/groups"         element={<GroupsPage />} />
        <Route path="/events"         element={<EventsPage />} />
        <Route path="/jurisdictions"  element={<JurisdictionsPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings/profile" element={<EditProfilePage />} />
          <Route path="/events/new"        element={<CreateEventPage />} />
          <Route path="/groups/new"         element={<CreateGroupPage />} />
          <Route path="/bookmarks"          element={<div className="p-8 text-gray-500">Bookmarks coming soon.</div>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
