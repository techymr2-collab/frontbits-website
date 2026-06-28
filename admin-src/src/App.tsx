import { Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import LeadDetail from '@/pages/LeadDetail'
import Bookings from '@/pages/Bookings'
import Clients from '@/pages/Clients'
import ClientDetail from '@/pages/ClientDetail'
import Projects from '@/pages/Projects'
import ProjectDetail from '@/pages/ProjectDetail'
import BlogPosts from '@/pages/BlogPosts'
import BlogPostDetail from '@/pages/BlogPostDetail'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetail />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/:id" element={<ClientDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="blog" element={<BlogPosts />} />
        <Route path="blog/:id" element={<BlogPostDetail />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
