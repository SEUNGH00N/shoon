import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import swal from 'sweetalert';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardActions,
  Button,
  Modal,
  Box,
  TextField,
  Menu,
  MenuItem
} from '@mui/material';
import PendingIcon from '@mui/icons-material/Pending';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import MenuIcon from '@mui/icons-material/Menu';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PeopleIcon from '@mui/icons-material/People';
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // 로그인 페이지 아이콘 추가
import CloseIcon from '@mui/icons-material/Close'; // CloseIcon 추가
import serverHost from '../../utils/host';
import '../../styles/admin.css';

const drawerWidth = 240;

function AdminPage() {

  const navigate = useNavigate(); // 네비게이트 훅 사용

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [verificationResult, setVerificationResult] = useState('');
  const [isRejectionFormOpen, setIsRejectionFormOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [showApprovedUsers, setShowApprovedUsers] = useState(false);
  const [showOptionsForUser, setShowOptionsForUser] = useState(null);
  const [showNavMenu, setShowNavMenu] = useState(false); // State for controlling overlay
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchApprovedUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/users`);
      if (response.status === 204) {
        console.log('No pending users found.');
        setUsers([]);
        return;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch users.');
      }
      const userData = await response.json();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const response = await fetch(`${serverHost}:8800/users/approved`);
      const approvedUserData = await response.json();
      setApprovedUsers(approvedUserData);
    } catch (error) {
      console.error('Error fetching approved users:', error);
    }
  };

  const handleUpdateApproval = async (userId, newStatus) => {
    try {
      let bodyData = { approvalStatus: newStatus };
      if (newStatus === 'rejected') {
        bodyData = { ...bodyData, rejectionReason };
      }

      const response = await fetch(`${serverHost}:8800/users/${userId}/approval`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      await response.json();

      // 배열 업데이트 및 초기화
      await fetchUsers();
      await fetchApprovedUsers();

      setIsRejectionFormOpen(false);
      setRejectionReason('');

      // 사용자 승인 후 알람 표시 및 모달 닫기
      if (newStatus === 'approved') {
        swal("사용자가 승인되었습니다.", "", "success");
        handleAdminModalClose();
      } else if (newStatus === 'rejected') {
        swal("사용자가 거부되었습니다.", "", "error");
        handleAdminModalClose();
      }
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };


  const handleAdminModalOpen = (user) => {
    setSelectedUser(user);
  };

  const handleAdminModalClose = () => {
    setSelectedUser(null);
    setVerificationResult('');
    setIsRejectionFormOpen(false);
  };

  const sendImageForOCR = async (userId, imageUrl) => {
    try {
      const response = await fetch(`${serverHost}:8800/api/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, imageUrl })
      });
      const result = await response.json();

      if (result && result.similarity !== undefined && result.ocrResult !== undefined) {
        if (result.similarity >= 70) {
          const extractedText = `[${result.ocrResult}]`;
          const match = extractedText.match(/\b(\d{7})\b/); // 정규식을 이용하여 7자리 숫자를 추출합니다.
          if (match) {
            const studentId = match[1];
            const highlightedText = extractedText.replace(new RegExp(`(${studentId})`, 'g'), '<span style="color: green; font-weight: bold;">$1</span>');

            swal({
              title: "학생증 확인",
              text: `유사도: ${result.similarity.toFixed(2)}%`,
              content: {
                element: "div",
                attributes: {
                  innerHTML: `추출결과: ${highlightedText}`
                }
              },
              icon: "success",
              buttons: false, // 버튼 비활성화
            });
          } else {
            swal({
              title: "학생증 확인",
              text: `유사도: ${result.similarity.toFixed(2)}%`,
              content: {
                element: "div",
                attributes: {
                  innerHTML: `추출결과: ${extractedText}`
                }
              },
              icon: "success",
              buttons: false, // 버튼 비활성화
            });
          }
        } else {
          swal({
            title: "학생증 확인",
            text: `유사도: ${result.similarity.toFixed(2)}%`,
            content: {
              element: "div",
              attributes: {
                innerHTML: `추출결과: [${result.ocrResult}]`
              }
            },
            icon: "error",
            buttons: false, // 버튼 비활성화
          });
        }
      } else {
        swal({
          title: "오류",
          text: "학생증 확인 중 오류가 발생했습니다.",
          icon: "error",
        });
      }

    } catch (error) {
      console.error('Error in OCR verification:', error);
    }
  };

  const handleDetailModalOpen = async (userId, imageUrl) => {
    await sendImageForOCR(userId, imageUrl);
  };

  const handleRejectButton = (userId) => {
    setIsRejectionFormOpen(true);
    setSelectedUser({ id: userId });
    setVerificationResult('');
  };

  const handleRejectionReasonChange = (event) => {
    setRejectionReason(event.target.value);
  };

  const handleRejectFormSubmit = (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    handleUpdateApproval(selectedUser.id, 'rejected');
    setSelectedUser(null);
    setIsRejectionFormOpen(false);
    setRejectionReason('');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setShowNavMenu(!showNavMenu); // Toggle overlay
  };

  const handleApprovedUsersClick = () => {
    setShowApprovedUsers(!showApprovedUsers);
  };

  const handleViewReportsForUser = () => {
    navigate('/ReportList'); // 로그인 페이지로 이동
  }

  const handleToggleOptions = (userId, event) => {
    setShowOptionsForUser((prevUserId) => (prevUserId === userId ? null : userId));
    setAnchorEl(event.currentTarget);
  };


  const handleCloseOptions = () => {
    setAnchorEl(null);
  };


  const handleDeleteUser = (userId) => {
    swal({
      title: "정말로 삭제하시겠습니까?",
      text: "삭제 후에는 복구할 수 없습니다!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        deleteUser(userId);
        swal("사용자가 삭제되었습니다!", {
          icon: "success",
        });
      } else {
        swal("사용자 삭제가 취소되었습니다.");
      }
    });
  };


  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${serverHost}:8800/deletefromadmin/${userId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchUsers(); // 사용자 목록을 업데이트함
        swal("사용자가 삭제되었습니다!", {
          icon: "success",
        }).then(() => {
          window.location.reload(); // 페이지 새로고침
        });
      } else {
        console.error('Error deleting user');
        swal("사용자 삭제에 실패했습니다. 다시 시도해 주세요.", {
          icon: "error",
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      swal("오류가 발생했습니다. 다시 시도해 주세요.", {
        icon: "error",
      });
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin'); // 세션에서 isAdmin 정보 삭제
    localStorage.removeItem('isAdmin'); // 로컬 스토리지에서 isAdmin 정보 삭제
    sessionStorage.removeItem('userId');
    localStorage.removeItem('userId');
    navigate('/login'); // 로그인 페이지로 이동
  };

  return (
    <div className="admin-container">
      <AppBar position="fixed">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            관리자 페이지
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
      {showNavMenu && <div className="overlay" onClick={toggleSidebar}></div>} {/* Overlay for closing sidebar */}
      <main style={{ flexGrow: 1, padding: '20px', marginLeft: `${isSidebarOpen ? drawerWidth : 0}px`, transition: 'margin 0.3s' }}>
        <Toolbar />
        <Typography variant="h4" gutterBottom>사용자 관리</Typography>
        <div className="admin-card-grid">
          {(showApprovedUsers ? approvedUsers : users).map((user) => (
            <Card key={user.id} className="admin-user-card">
              <CardContent>
                <Typography variant="h5" component="div">{user.name}</Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">ID: {user.id}</Typography>
                <Typography variant="body2">이메일 : {user.email}</Typography>
                <Typography variant="body2">학과 : {user.department}</Typography>
                <Typography variant="body2">학년 : {user.grade}</Typography>
                <Typography variant="body2" className={`admin-status ${user.admin}`}>
                  {user.admin === 'pending' ? '승인 대기중' : user.admin === 'approved' ? '승인 완료' : '승인 거절'}
                </Typography>
              </CardContent>
              <CardActions>
                <div className="admin-options-container">
                  <IconButton onClick={(event) => handleToggleOptions(user.id, event)} style={{ position: 'absolute', top: 8, right: 8 }}>
                    <MoreHorizIcon />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl && showOptionsForUser === user.id)}
                    onClose={handleCloseOptions}
                  >
                    <MenuItem onClick={() => handleAdminModalOpen(user)}>학생증 확인</MenuItem>
                    <MenuItem onClick={() => { handleDeleteUser(user.id); handleCloseOptions(); }}>유저 삭제</MenuItem>
                  </Menu>
                </div>


              </CardActions>
            </Card>
          ))}
        </div>
      </main>
      {selectedUser && (
        <Modal
          open={Boolean(selectedUser)}
          onClose={handleAdminModalClose}
          aria-labelledby="admin-modal-modal-title"
          aria-describedby="admin-modal-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <IconButton
              aria-label="close"
              onClick={handleAdminModalClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <a href={`${serverHost}:8800/uploads_id/${selectedUser.id}.jpg`} target="_blank" rel="noopener noreferrer">
              <img
                src={`${serverHost}:8800/uploads_id/${selectedUser.id}.jpg`}
                alt="Student ID"
                style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
              />
            </a>

            {verificationResult && <Typography id="admin-modal-modal-description" sx={{ mt: 2 }}>{verificationResult}</Typography>}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Button variant="contained" onClick={() => handleDetailModalOpen(selectedUser.id, `${serverHost}:8800/uploads_id/${selectedUser.id}.jpg`)}>상세 정보 보기</Button>
              <Button variant="contained" color="success" onClick={() => handleUpdateApproval(selectedUser.id, 'approved')}>승인</Button>
              <Button variant="contained" color="error" onClick={() => handleRejectButton(selectedUser.id)}>반려</Button>
            </div>
            {isRejectionFormOpen && (
              <div style={{ position: 'absolute', right: -330, top: 0, width: '300px', padding: '15px', backgroundColor: '#ffffff' }}>
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
                  />
                  <div style={{ marginTop: '10px', marginLeft: '110px' }}>
                    <Button type="submit" variant="contained" color="error">반려 하기</Button>
                  </div>
                </form>
              </div>
            )}
          </Box>
        </Modal>
      )}
      <Footer /> {/* Add Footer component here */}
    </div>

  );
}

export default AdminPage;