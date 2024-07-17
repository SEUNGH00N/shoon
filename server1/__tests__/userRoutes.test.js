const request = require('supertest');
const express = require('express');
const userRouter = require('../routes/userRoutes'); // 실제 경로를 사용하십시오
const userController = require('../controllers/userController'); // 실제 경로를 사용하십시오
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use('/users', userRouter);

// 각 테스트 전에 모킹 초기화
jest.mock('../controllers/userController');

describe('User Routes', () => {
  describe('POST /users/signup', () => {
    it('should sign up a new user', async () => {
      userController.signup.mockImplementation((req, res) => res.status(201).json({ message: 'User signed up successfully' }));

      const testImageBuffer = Buffer.from('test image content', 'utf-8');

      const res = await request(app)
        .post('/users/signup')
        .field('name', 'testuser')
        .attach('studentIdImage', testImageBuffer, 'testfile.jpg')
        .expect(201);

      expect(res.body).toEqual({ message: 'User signed up successfully' });
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user', async () => {
      userController.login.mockImplementation((req, res) => res.status(200).json({ token: 'testToken' }));

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'testuser', password: 'testpassword' })
        .expect(200);

      expect(res.body).toEqual({ token: 'testToken' });
    });
  });

  describe('GET /users/checkUser', () => {
    it('should check if a user exists', async () => {
      userController.checkUser.mockImplementation((req, res) => res.status(200).json({ exists: false }));

      const res = await request(app)
        .get('/users/checkUser')
        .query({ username: 'testuser' })
        .expect(200);

      expect(res.body).toEqual({ exists: false });
    });
  });

  describe('GET /users/pending', () => {
    it('should get pending users', async () => {
      userController.getPendingUsers.mockImplementation((req, res) => res.status(200).json([{ id: 1, name: 'PendingUser' }]));

      const res = await request(app)
        .get('/users/pending')
        .expect(200);

      expect(res.body).toEqual([{ id: 1, name: 'PendingUser' }]);
    });
  });

  describe('PUT /users/:userId/approval', () => {
    it('should update user approval status', async () => {
      userController.updateApprovalStatus.mockImplementation((req, res) => res.status(200).json({ message: 'User approved' }));

      const res = await request(app)
        .put('/users/1/approval')
        .send({ approved: true })
        .expect(200);

      expect(res.body).toEqual({ message: 'User approved' });
    });
  });

  describe('GET /users/approved', () => {
    it('should get approved users', async () => {
      userController.getApprovedUsers.mockImplementation((req, res) => res.status(200).json([{ id: 1, name: 'ApprovedUser' }]));

      const res = await request(app)
        .get('/users/approved')
        .expect(200);

      expect(res.body).toEqual([{ id: 1, name: 'ApprovedUser' }]);
    });
  });

  describe('GET /users/type', () => {
    it('should get user type', async () => {
      userController.getUserType.mockImplementation((req, res) => res.status(200).json({ userType: 'admin' }));

      const res = await request(app)
        .get('/users/type')
        .query({ userId: 1 })
        .expect(200);

      expect(res.body).toEqual({ userType: 'admin' });
    });
  });

  describe('POST /users/myinfo', () => {
    it('should get my info', async () => {
      userController.getMyInfo.mockImplementation((req, res) => res.status(200).json({ id: 1, name: 'MyInfo' }));

      const res = await request(app)
        .post('/users/myinfo')
        .send({ token: 'testToken' })
        .expect(200);

      expect(res.body).toEqual({ id: 1, name: 'MyInfo' });
    });
  });

  describe('GET /users/getUserInfo', () => {
    it('should get user info from session', async () => {
      userController.getUserInfo.mockImplementation((req, res) => res.status(200).json({ id: 1, name: 'UserInfo' }));

      const res = await request(app)
        .get('/users/getUserInfo')
        .expect(200);

      expect(res.body).toEqual({ id: 1, name: 'UserInfo' });
    });
  });

  describe('POST /users/changepassword', () => {
    it('should change user password', async () => {
      userController.changePassword.mockImplementation((req, res) => res.status(200).json({ message: 'Password changed' }));

      const res = await request(app)
        .post('/users/changepassword')
        .send({ userId: 1, oldPassword: 'oldpass', newPassword: 'newpass' })
        .expect(200);

      expect(res.body).toEqual({ message: 'Password changed' });
    });
  });

  describe('POST /users/edituserinfo', () => {
    it('should edit user info', async () => {
      userController.editUserInfo.mockImplementation((req, res) => res.status(200).json({ message: 'User info updated' }));

      const res = await request(app)
        .post('/users/edituserinfo')
        .send({ userId: 1, newName: 'NewName' })
        .expect(200);

      expect(res.body).toEqual({ message: 'User info updated' });
    });
  });

  describe('GET /products/seller/:productId', () => {
    it('should get seller info for a product', async () => {
      userController.getSellerInfo.mockImplementation((req, res) => res.status(200).json({ id: 1, name: 'SellerInfo' }));

      const res = await request(app)
        .get('/users/seller/1')
        .expect(200);

      expect(res.body).toEqual({ id: 1, name: 'SellerInfo' });
    });
  });
});
