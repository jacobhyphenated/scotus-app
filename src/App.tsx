import './App.css';
import { Navigate, Route, Routes } from 'react-router';
import { Link } from 'react-router-dom';
import Home from './ui/home/containers/home';
import Admin from './ui/admin/containers/admin';
import CasePage from './ui/case/containers/case';
import LowerCourtPage from './ui/case/containers/lowerCourt';
import AllTermCasesPage from './ui/home/containers/allTermCases';
import TermJusticeSummary from './ui/home/containers/termJusticeSummary';
import HomeIcon from '@mui/icons-material/Home';
import { Button, Grid, Paper, IconButton } from '@mui/material';

export const App = () => (
  <div>
    <Paper elevation={2}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Link to="/">
          <IconButton size="large">
            <HomeIcon color="action" />
          </IconButton>
        </Link>
        SCOTUS App
        <Button component={Link} to="/admin" color="primary" variant="text">admin</Button>
      </Grid>
    </Paper>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="term/:termId">
        <Route index element={<Home />} />
        <Route path="justice/:justiceId" element={<TermJusticeSummary />} />
        <Route path="all" element={<AllTermCasesPage />} />
      </Route>
      <Route path="/case/:id/lowerCourt" element={<LowerCourtPage />} />
      <Route path="/case/:id" element={<CasePage />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);
