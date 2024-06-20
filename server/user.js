const { app, pool, uploadId } = require('./db');

const bcrypt = require('bcrypt');

// 거절된 사용자 정보 가져오기 엔드포인트
app.get('/rejectUserEdit/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // 사용자 조회
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ? AND admin = "rejected"', [userId]);
        const user = userRows[0];

        if (!user) {
            // 사용자가 존재하지 않거나 거절된 사용자가 아닌 경우
            return res.status(404).json({ error: '거절된 사용자를 찾을 수 없습니다.' });
        }

        // 거절된 사용자 정보 전송
        res.status(200).json({ user });

    } catch (error) {
        console.error('거절된 사용자 정보 가져오기 오류:', error);
        res.status(500).json({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' });
    }
});

app.post('/editUserData', uploadId.single('studentIdImage'), async (req, res) => {
    const { id, password, email, department, grade, name } = req.body;

    // 비밀번호 확인
    if (password !== req.body.confirmPassword) {
        return res.status(400).json({ error: '비밀번호와 비밀번호 재입력이 일치하지 않습니다.' });
    }

    // 비밀번호 유효성 검사
    const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
    if (!isValidPassword) {
        return res.status(400).json({ error: '비밀번호는 영문, 숫자, 특수문자를 조합하여 10~16자로 입력해주세요.' });
    }

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 이미지 URL 처리
        const studentIdImageUrl = req.file ? req.file.filename : null;

        // 사용자 정보 업데이트 쿼리 실행
        const updateUserQuery = `
        UPDATE users
        SET password = ?, email = ?, department = ?, grade = ?, name = ?, student_id_image_url = ?, admin = 'pending'
        WHERE id = ?
      `;

        // 사용자 정보 업데이트
        await pool.execute(updateUserQuery, [hashedPassword, email, department, grade, name, studentIdImageUrl, id]);

        // 사용자 정보 업데이트 성공 응답
        res.status(200).json({ message: '사용자 정보 업데이트 성공' });
    } catch (error) {
        console.error('사용자 정보 업데이트 오류:', error);
        res.status(500).json({ error: '사용자 정보 업데이트에 실패했습니다.' });
    }
});

// 사용자 등록 엔드포인트
app.post('/signup', uploadId.single('studentIdImage'), async (req, res) => {
    const { id, password, email, department, grade, name } = req.body;

    // 비밀번호 확인
    if (password !== req.body.confirmPassword) {
        return res.status(400).json({ error: '비밀번호와 비밀번호 재입력이 일치하지 않습니다.' });
    }

    // 비밀번호 유효성 검사
    const isValidPassword = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{10,16}$/.test(password);
    if (!isValidPassword) {
        return res.status(400).json({ error: '비밀번호는 영문, 숫자, 특수문자를 조합하여 10~16자로 입력해주세요.' });
    }

    try {
        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);

        // 이미지 URL 처리
        const studentIdImageUrl = req.file ? req.file.filename : null;

        // 사용자 추가 쿼리 실행
        const addUserQuery = `
        INSERT INTO users (id, password, email, department, grade, name, student_id_image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

        // 사용자 등록
        await pool.execute(addUserQuery, [id, hashedPassword, email, department, grade, name, studentIdImageUrl]);

        // 사용자 등록 성공 응답
        res.status(201).json({ message: '사용자 등록 성공' });
    } catch (error) {
        console.error('사용자 등록 오류:', error);
        res.status(500).json({ error: '사용자 등록에 실패했습니다.' });
    }
});

// 사용자 로그인 엔드포인트
app.post('/login', async (req, res) => {
    const { id, password } = req.body;

    try {
        // 사용자 조회
        const [userRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
        const user = userRows[0];

        if (!user) {
            // 사용자가 존재하지 않는 경우
            return res.status(401).json({ error: '사용자가 존재하지 않습니다.' });
        }

        if (user.admin === 'pending') {
            // 승인 대기 중인 사용자인 경우
            return res.status(403).json({ error: '승인 대기 중입니다. 관리자의 승인을 기다려주세요.' });
        }

        // 비밀번호 비교
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            // 비밀번호 불일치
            return res.status(401).json({ error: '비밀번호가 잘못되었습니다.' });
        }

        if (user.admin === 'rejected') {
            // 반려된 사용자인 경우
            const rejectionReason = user.rejection_reason || '관리자에게 문의하세요.';
            return res.status(403).json({ error: '승인이 거절되었습니다.', rejectionReason });
        }

        // 로그인 성공
        const isAdmin = user.admin === 'admin';
        const message = isAdmin ? '관리자로 로그인 되었습니다.' : '로그인 성공';
        res.status(200).json({ message, id: user.id, isAdmin });

    } catch (error) {
        console.error('로그인 오류:', error);
        res.status(500).json({ error: '로그인에 실패했습니다.' });
    }
});


// 아이디 찾기 엔드포인트
app.post('/find-id', async (req, res) => {
    try {
        const { email, department, grade } = req.body;

        // MySQL 쿼리 실행
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT id FROM users WHERE email = ? AND department = ? AND grade = ?',
            [email, department, grade]
        );
        connection.release();

        // 결과가 있는 경우
        if (rows.length > 0) {
            res.status(200).json({ id: rows[0].id });
        } else {
            res.status(404).json({ error: '아이디를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('아이디 찾기 오류:', error);
        res.status(500).json({ error: '서버 오류' });
    }
});

// 비밀번호 해싱 함수
const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

// 비밀번호 재설정 엔드포인트
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        // 임시 비밀번호 생성 (예시로 랜덤 문자열 생성)
        const temporaryPassword = Math.random().toString(36).slice(-8);

        // 비밀번호 해싱
        const hashedPassword = await hashPassword(temporaryPassword);

        // 데이터베이스에 새로운 비밀번호 저장
        const [result] = await pool.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        // 데이터베이스에 새로운 비밀번호가 업데이트되었는지 확인
        if (result.affectedRows > 0) {
            // 임시 비밀번호와 함께 성공 메시지 응답 전송
            res.status(200).json({ message: `임시 비밀번호는 ${temporaryPassword} 입니다. 로그인 후에 비밀번호를 변경해주세요.` });
        } else {
            res.status(404).json({ error: '해당 이메일을 가진 사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('비밀번호 재설정 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 비밀번호를 재설정할 수 없습니다.' });
    }
});

// 사용자의 승인 상태를 업데이트하는 API 엔드포인트
app.put('/users/:userId/approval', async (req, res) => {
    const { userId } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    try {
        // 사용자의 승인 상태 업데이트
        await pool.query('UPDATE users SET admin = ?, rejection_reason = ? WHERE id = ?', [approvalStatus, rejectionReason, userId]);
        res.status(200).json({ message: '사용자 승인 상태가 업데이트되었습니다.' });
    } catch (error) {
        console.error('사용자 승인 상태 업데이트 오류:', error);
        res.status(500).json({ error: '사용자 승인 상태를 업데이트하는 중에 오류가 발생했습니다.' });
    }
});

// 승인 완료된 사용자 정보 가져오는 엔드포인트
app.get('/users/approved', async (req, res) => {
    try {
        // 승인 완료된 사용자 정보를 가져오는 쿼리 실행
        const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin = 'approved'`;
        const [rows] = await pool.query(query);

        res.status(200).json(rows);
    } catch (error) {
        console.error('승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
        res.status(500).json({ error: '승인된 사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
    }
});


// 중복 확인 엔드포인트
app.get('/checkUser', async (req, res) => {
    const userId = req.query.id; // 클라이언트로부터 요청된 아이디를 가져옵니다.

    try {
        // 사용자 조회 쿼리 실행
        const findUserQuery = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await pool.execute(findUserQuery, [userId]); // 사용자 ID를 쿼리 매개변수로 전달합니다.

        if (rows.length > 0) {
            // 사용자가 이미 존재할 경우
            res.status(200).json({ available: false });
        } else {
            // 사용자가 존재하지 않을 경우
            res.status(200).json({ available: true });
        }
    } catch (error) {
        console.error('사용자 조회 오류:', error);
        res.status(500).json({ error: '사용자 조회 중 오류가 발생했습니다.' });
    }
});
//내정보 엔드포인트
app.post('/myinfo', async (req, res) => {
    const { userId, password } = req.body;

    try {
        // 사용자 조회 쿼리 실행
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length > 0) {
            // 사용자가 존재할 경우 비밀번호 확인
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // 비밀번호가 일치할 경우 사용자 정보 응답
                res.status(200).json({
                    id: user.id,
                    name: user.name,
                    grade: user.grade,
                    department: user.department,
                    email: user.email
                });
            } else {
                // 비밀번호가 일치하지 않을 경우 에러 응답
                res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
            }
        } else {
            // 사용자가 존재하지 않을 경우 에러 응답
            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('내 정보 확인 오류:', error);
        res.status(500).json({ error: '내 정보를 가져오는 중 오류가 발생했습니다.' });
    }
});

// 회원 탈퇴 엔드포인트
app.post('/deleteaccount', async (req, res) => {
    const { userId, password } = req.body;

    try {
        // 사용자 조회 쿼리 실행
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length > 0) {
            // 사용자가 존재할 경우 비밀번호 확인
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // 비밀번호가 일치할 경우 사용자 삭제
                await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
                res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
            } else {
                // 비밀번호가 일치하지 않을 경우 에러 응답
                res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
            }
        } else {
            // 사용자가 존재하지 않을 경우 에러 응답
            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('회원 탈퇴 오류:', error);
        res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
    }
});

// 사용자 정보 수정 엔드포인트
app.post('/edituserinfo', async (req, res) => {
    const { userId, editedUserInfo } = req.body;

    try {
        // 사용자 조회 쿼리 실행
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length > 0) {
            // 사용자가 존재할 경우 사용자 정보 업데이트
            const user = rows[0];
            const updatedUserInfo = { ...user, ...editedUserInfo };

            // 사용자 정보 업데이트 쿼리 실행
            await pool.execute(
                'UPDATE users SET name = ?, grade = ?, department = ?, email = ? WHERE id = ?',
                [updatedUserInfo.name, updatedUserInfo.grade, updatedUserInfo.department, updatedUserInfo.email, userId]
            );

            res.status(200).json({ message: '사용자 정보가 성공적으로 수정되었습니다.' });
        } else {
            // 사용자가 존재하지 않을 경우 에러 응답
            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('사용자 정보 수정 오류:', error);
        res.status(500).json({ error: '사용자 정보를 수정하는 중 오류가 발생했습니다.' });
    }
});

// 비밀번호 변경 엔드포인트
app.post('/changepassword', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: '모든 필드를 입력해주세요.' });
    }

    try {
        // 사용자 조회 쿼리 실행
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

        if (rows.length > 0) {
            // 사용자가 존재할 경우 현재 비밀번호 확인
            const user = rows[0];
            const passwordMatch = await bcrypt.compare(currentPassword, user.password);

            if (passwordMatch) {
                // 비밀번호가 일치할 경우 새로운 비밀번호 해싱
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                // 새로운 비밀번호로 사용자 정보 업데이트
                await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

                res.status(200).json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
            } else {
                // 현재 비밀번호가 일치하지 않을 경우 에러 응답
                res.status(401).json({ error: '현재 비밀번호가 일치하지 않습니다.' });
            }
        } else {
            // 사용자가 존재하지 않을 경우 에러 응답
            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        res.status(500).json({ error: '비밀번호를 변경하는 중 오류가 발생했습니다.' });
    }
});

// 모든 승인되지 않은 사용자 정보를 가져오는 엔드포인트
app.get('/users', async (req, res) => {
    try {
        // 모든 승인되지 않은 사용자 정보를 가져오는 쿼리 실행
        const query = `SELECT id, name, email, department, grade, student_id_image_url, admin FROM users WHERE admin != 'admin' AND admin != 'approved'`;
        const [rows] = await pool.query(query);

        // 반환된 사용자 목록이 비어있는지 확인
        if (rows.length === 0) {
            // 비어있는 경우 204 No Content 상태 코드 반환
            res.status(204).send();
        } else {
            // 사용자 정보가 있는 경우 200 OK 상태 코드와 함께 데이터 반환
            res.status(200).json(rows);
        }
    } catch (error) {
        // 오류 발생 시 500 Internal Server Error 상태 코드 반환
        console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
        res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
    }
});


// DELETE 엔드포인트 - /deletefromadmin/:userId
app.delete('/deletefromadmin/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const connection = await pool.getConnection();
        const [results, fields] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
        connection.release();

        if (results.affectedRows > 0) {
            res.status(200).json({ message: '사용자 삭제 성공' });
        } else {
            res.status(404).json({ error: '해당 사용자를 찾을 수 없음' });
        }
    } catch (error) {
        console.error('사용자 삭제 중 오류 발생:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 세션에 저장된 사용자 ID를 기반으로 사용자 정보를 반환하는 엔드포인트
app.get('/getUserInfo', async (req, res) => {
    try {
        // 세션에서 사용자 ID 가져오기
        const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

        // 사용자 ID가 없으면 권한 없음(401) 응답 보내기
        if (!userId) {
            return res.status(401).send('Unauthorized');
        }

        // 데이터베이스에서 해당 사용자 정보 가져오기
        const query = `SELECT id, name, department, grade, rates FROM users WHERE id = ?`;
        const [rows] = await pool.query(query, [userId]);

        // 사용자 정보가 없으면 사용자를 찾을 수 없음(404) 응답 보내기
        if (rows.length === 0) {
            return res.status(404).send('User not found');
        }

        // 사용자 정보 반환
        let userInfo = rows[0];
        // 학과명을 매핑하기 위한 객체
        const departmentMap = {
            'software_engineering': '소프트웨어학과',
            'computer_science': '컴퓨터공학과',
            'design': '디자인학과',
            'business-administration': '경영학과'
            // 필요에 따라 추가적인 부서를 매핑할 수 있습니다.
        };

        // 매핑된 학과명으로 변경
        userInfo.department = departmentMap[userInfo.department];

        // 사용자의 결제 내역을 가져와서 총 판매액을 계산하고, 이를 기반으로 잔액을 계산
        const [sales] = await pool.execute('SELECT IFNULL(SUM(p.amount), 0) AS total_sales FROM payments p WHERE p.seller_id = ?', [userId]);
        const totalSales = sales[0].total_sales;

        // 사용자가 판매한 상품의 총 가격을 가져옵니다.
        const [soldProducts] = await pool.execute('SELECT IFNULL(SUM(pr.price), 0) AS total_price FROM products pr JOIN payments p ON pr.id = p.product_id WHERE pr.user_id = ?', [userId]);
        const totalPriceOfSoldProducts = soldProducts[0].total_price;

        // 사용자의 잔액을 계산합니다.
        const balance = totalSales - totalPriceOfSoldProducts;

        // 사용자 정보에 총 판매액과 잔액 정보를 추가하여 클라이언트에 응답
        const userInfoWithSalesAndBalance = {
            ...userInfo,
            total_sales: totalSales,
            balance: balance
        };
        res.json(userInfoWithSalesAndBalance);

    } catch (error) {
        console.error('사용자 정보를 가져오는 중에 오류가 발생했습니다:', error);
        res.status(500).json({ error: '사용자 정보를 가져오는 중에 오류가 발생했습니다.' });
    }
});
