import React, { useState, useEffect } from 'react';
import swal from 'sweetalert';
import { useNavigate } from 'react-router-dom';
import serverHost from '../../utils/host';
import '../../styles/reportList.css';
import { AppBar, Modal, Box, Button, TextField, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import PendingIcon from '@mui/icons-material/Pending';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const drawerWidth = 240;

const ReportList = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isRejectionFormOpen, setIsRejectionFormOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showApprovedUsers, ] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${serverHost}:8800/reportsList`);
        if (response.ok) {
          const data = await response.json();
          setReports(data);
        } else {
          console.error('Failed to fetch reports:', response.status);
        }
      } catch (error) {
        console.error('Fetch reports error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleRejectButton = (report) => {
    setSelectedReport(report);
    setIsRejectionFormOpen(true);
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const handleRejectFormSubmit = async (event) => {
    event.preventDefault();
    if (!selectedReport) return;
    try {
      const response = await fetch(`${serverHost}:8800/users/${selectedReport.seller_id}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ approvalStatus: 'rejected', rejectionReason })
      });

      if (response.ok) {
        swal("판매자가 거부되었습니다.", "", "error");
        setIsRejectionFormOpen(false);
        setRejectionReason('');
        setSelectedReport(null);
        const updatedReports = reports.filter(report => report.seller_id !== selectedReport.seller_id);
        setReports(updatedReports);
      } else {
        console.error('Failed to reject seller:', response.status);
      }
    } catch (error) {
      console.error('Error rejecting seller:', error);
    }
  };

  const handleApprovedUsersClick = () => {
    navigate('/AdminPage'); // 로그인 페이지로 이동
  };

  const handleViewReportsForUser = () => {
    navigate('/ReportList'); // 로그인 페이지로 이동
  }

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin'); // 세션에서 isAdmin 정보 삭제
    localStorage.removeItem('isAdmin'); // 로컬 스토리지에서 isAdmin 정보 삭제
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/login'); // 로그인 페이지로 이동
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>로딩 중...</p>
      </div>
    );
  }
  const translateReason = (reason) => {
    switch (reason) {
      case 'fraud':
        return '사기';
      case 'misleading':
        return '허위 정보';
      case 'abuse':
        return '악용';
      case 'other':
        return '기타';
      default:
        return reason;
    }
  };


  return (
    <div className="admin-container">
      <div className="report-list-container">

        <AppBar position="fixed">
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">
              관리자 페이지: 신고내역
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="persistent"
          anchor="left"
          open={isSidebarOpen}
          sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          <Toolbar />
          <List>
            <ListItem button onClick={handleApprovedUsersClick}>
              <ListItemIcon>{showApprovedUsers ? <PendingIcon /> : <PeopleIcon />}</ListItemIcon>
              <ListItemText primary={showApprovedUsers ? "승인 대기 사용자" : "승인 완료 사용자"} />
            </ListItem>
            <ListItem button onClick={handleViewReportsForUser}>
              <ListItemIcon><ReportProblemIcon /></ListItemIcon>
              <ListItemText primary="신고 내역 보기" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="로그인 페이지" />
            </ListItem>
          </List>
        </Drawer>
        {isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}

        <Typography variant="h4" component="h2" gutterBottom>
          신고 내역
        </Typography>
        <TableContainer component={Paper}>
          <Table className="report-table">
            <TableHead>
              <TableRow>
                <TableCell>상품 ID</TableCell>
                <TableCell>신고자 ID</TableCell>
                <TableCell>판매자 ID</TableCell>
                <TableCell>신고 사유</TableCell>
                <TableCell>상세 내용</TableCell>
                <TableCell>신고 날짜</TableCell>
                <TableCell>액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.product_id}</TableCell>
                  <TableCell>{report.user_id}</TableCell>
                  <TableCell>{report.seller_id}</TableCell>
                  <TableCell>{translateReason(report.reason)}</TableCell>
                  <TableCell>{report.details}</TableCell>
                  <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="error" onClick={() => handleRejectButton(report)}>
                      사용자 반려
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Modal
          open={isRejectionFormOpen}
          onClose={() => setIsRejectionFormOpen(false)}
          aria-labelledby="rejection-modal-title"
          aria-describedby="rejection-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 1
          }}>
            <Typography id="rejection-modal-title" variant="h6" component="h2">
              사용자 반려
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setIsRejectionFormOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <form onSubmit={handleRejectFormSubmit}>
              <TextField
                label="반려 사유"
                multiline
                rows={4}
                value={rejectionReason}
                onChange={handleRejectionReasonChange}
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="error">
                  반려하기
                </Button>
              </div>
            </form>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ReportList;
