const { app, pool, upload } = require('./db');

//상품 관련

// 상품 검색 및 검색어 저장 엔드포인트
app.get('/products', async (req, res) => {
    const searchTerm = req.query.search;
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    try {
        if (!searchTerm) {
            // 검색어가 없는 경우 모든 상품을 반환
            const [rows] = await pool.execute('SELECT * FROM products');

            // 각 상품의 이미지 파일 경로를 클라이언트로 전달
            const productsWithImagePath = rows.map(product => {
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    createdAt: product.createdAt,
                    user_id: product.user_id,
                    views: product.views,
                    status: product.status,
                    image: product.image ? `https://${req.get('host')}/uploads/${product.image}` : null
                };
            });

            res.json(productsWithImagePath);
        } else {
            // 검색어가 있는 경우 해당 검색어를 포함하는 상품을 반환
            const [rows] = await pool.execute('SELECT * FROM products WHERE name LIKE ?', [`%${searchTerm}%`]);

            // 각 상품의 이미지 파일 경로를 클라이언트로 전달
            const productsWithImagePath = rows.map(product => {
                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    createdAt: product.createdAt,
                    user_id: product.user_id,
                    views: product.views,
                    status: product.status,
                    image: product.image ? `https://${req.get('host')}/uploads/${product.image}` : null
                };
            });

            // 검색어 저장
            if (userId) {
                await saveSearchTerm(searchTerm, userId);
            }

            res.json(productsWithImagePath);
        }
    } catch (error) {
        console.error('Error fetching products from database:', error);
        res.status(500).json({ error: 'Failed to fetch products from database' });
    }
});
//상품관리 엔드포인트
app.get('/productsmanage', async (req, res) => {
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.

    // 사용자 ID가 없는 경우
    if (!userId) {
        return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
    }

    try {
        // 해당 사용자가 작성한 상품 목록 조회 쿼리
        const [rows] = await pool.query('SELECT * FROM products WHERE user_id = ?', [userId]);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('상품 목록 가져오기 오류:', error);
        return res.status(500).json({ error: '상품 목록을 가져오는 중 오류가 발생했습니다.' });
    }
});

// Assuming you're using Express and have initialized 'app' and 'pool' properly
// Function to execute queries
const executeQuery = async (pool, query, values) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query, values);
        return rows;
    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// Example function to fetch product details by ID
const getProductById = async (pool, productId) => {
    try {
        const query = 'SELECT * FROM products WHERE id = ?';
        const values = [productId];
        const products = await executeQuery(pool, query, values);
        return products[0]; // Assuming there's only one product with the given ID
    } catch (error) {
        throw error;
    }
};

// Fetch product by ID
app.get('/productsD/:productId', async (req, res) => {
    const productId = req.params.productId;
    try {
        const product = await getProductById(pool, productId);
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 상품 삭제 엔드포인트
app.delete('/productsmanage/:productId', async (req, res) => {
    const productId = req.params.productId;
    const userId = req.header('user_id');

    // 사용자 ID가 없는 경우
    if (!userId) {
        return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
    }

    try {
        // 외래 키를 참조하는 다른 테이블의 레코드 삭제
        await pool.query('DELETE FROM favorites WHERE product_id = ?', [productId]);
        await pool.query('DELETE FROM messages WHERE productId = ?', [productId]);
        await pool.query('DELETE FROM product_ratings WHERE product_id = ?', [productId]); // 추가: product_ratings 테이블에서 관련된 레코드 삭제

        // 상품과 사용자의 일치 여부 확인 쿼리
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId]);

        // 상품이 존재하지 않는 경우
        if (rows.length === 0) {
            return res.status(404).json({ error: '해당 상품을 찾을 수 없거나 삭제할 권한이 없습니다.' });
        }

        // 상품 삭제 쿼리
        await pool.query('DELETE FROM products WHERE id = ?', [productId]);

        return res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('상품 삭제 오류:', error);
        return res.status(500).json({ error: '상품 삭제 중 오류가 발생했습니다.' });
    }
});


// AddProduct 엔드포인트에서 이미지 파일의 이름만을 데이터베이스에 저장
app.post('/addProduct', upload.single('image'), async (req, res) => {
    const userId = req.headers.user_id; // 사용자 ID는 요청 헤더에서 가져옵니다.
    const { name, description, price } = req.body;

    // 요청 본문의 데이터가 올바르게 전달되는지 확인합니다.
    if (!name || !price || isNaN(price)) {
        return res.status(400).send('상품 이름과 가격을 올바르게 입력해주세요.');
    }

    // 이미지 파일이 있는 경우에만 이미지 URL을 생성합니다.
    let imageUrl = req.file ? req.file.filename : null;

    const INSERT_PRODUCT_QUERY = `INSERT INTO products (user_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`;

    try {
        const [result] = await pool.execute(INSERT_PRODUCT_QUERY, [userId, name, description, price, imageUrl]);
        console.log('상품이 성공적으로 추가되었습니다.');
        res.status(200).send('상품이 성공적으로 추가되었습니다.');
    } catch (error) {
        console.error('상품 추가 오류:', error);
        res.status(500).send('상품 추가에 실패했습니다.');
    }
});

// 검색어 저장 함수
async function saveSearchTerm(searchTerm, userId) {
    try {
        // 검색어와 사용자 ID가 모두 유효한 경우에만 처리
        if (searchTerm !== undefined && userId !== undefined) {
            const [result] = await pool.execute('INSERT INTO search_history (search_term, user_id) VALUES (?, ?)', [searchTerm, userId]);
            console.log(`검색어 로그: 검색어 "${searchTerm}"가 사용자 ID "${userId}"에 의해 저장되었습니다.`);
            console.log('검색어가 성공적으로 저장되었습니다.');
        } else {
            console.error('검색어 또는 사용자 ID가 유효하지 않습니다.');
        }
    } catch (error) {
        console.error('검색어 저장 오류:', error);
    }
}

// 검색어 저장 엔드포인트
app.post('/searchHistory', async (req, res) => {
    const { searchTerm, userId } = req.body; // 클라이언트에서 userId도 함께 전송합니다.
    if (searchTerm && userId) {
        try {
            const [result] = await pool.execute('INSERT INTO search_history (search_term, user_id) VALUES (?, ?)', [searchTerm, userId]);
            console.log('검색어가 성공적으로 저장되었습니다.');
            res.sendStatus(200);
        } catch (error) {
            console.error('검색어 저장 오류:', error);
            res.sendStatus(500);
        }
    } else {
        res.status(400).send('검색어 또는 사용자 ID가 제공되지 않았습니다.');
    }
});

// 저장된 검색어 기록을 반환하는 엔드포인트
app.get('/searchHistory', async (req, res) => {
    try {
        const [result] = await pool.execute('SELECT * FROM search_history ORDER BY search_date DESC LIMIT 1');
        if (result.length > 0) {
            res.json({ searchTerm: result[0].search_term });
        } else {
            res.json({ searchTerm: '' });
        }
    } catch (error) {
        console.error('저장된 검색어 불러오기 오류:', error);
        res.sendStatus(500);
    }
});

// products/latest 엔드포인트를 만듭니다.
app.get('/products/latest', async (req, res) => {
    try {
        // 최신순으로 상품을 조회하는 쿼리를 실행합니다.
        const latestProductsQuery = `
        SELECT *
        FROM products
        ORDER BY createdAt desc
      `;
        // 쿼리를 실행하여 최신순으로 정렬된 상품 목록을 가져옵니다.
        const [latestProductsRows] = await pool.execute(latestProductsQuery);

        // 최신순으로 정렬된 상품 목록을 클라이언트에 응답합니다.
        res.json(latestProductsRows);
    } catch (error) {
        console.error('Error fetching latest products:', error);
        // 오류가 발생한 경우 500 상태 코드와 오류 메시지를 클라이언트에 응답합니다.
        res.status(500).json({ error: 'Failed to fetch latest products' });
    }
});


// products/detail/:productId 엔드포인트
app.get('/products/detail/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        // 데이터베이스에서 상품을 조회합니다.
        const productDetailQuery = `
      SELECT *
      FROM products
      WHERE id = ?
    `;

        const [productDetailRows] = await pool.execute(productDetailQuery, [productId]);

        // 조회된 상품이 존재하지 않는 경우 404 상태 코드를 반환합니다.
        if (!productDetailRows || productDetailRows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // 상세 정보를 클라이언트에 응답합니다.
        res.json(productDetailRows[0]);
    } catch (error) {
        console.error('Error fetching product detail:', error);
        res.status(500).json({ error: 'Failed to fetch product detail' });
    }
});

// 저장된 검색어 목록을 반환하는 엔드포인트
app.get('/searchKeywords/:userId', async (req, res) => {
    const userId = req.params.userId; // 사용자 ID는 URL 파라미터로부터 가져옵니다.

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('SELECT * FROM search_history WHERE user_id = ? ORDER BY search_date DESC', [userId]);
        connection.release();
        res.json(result);
    } catch (error) {
        console.error('저장된 검색어 목록을 불러오는 중 오류 발생:', error);
        res.sendStatus(500);
    }
});

// 검색어 삭제 엔드포인트
app.delete('/searchKeywords/delete/:id', async (req, res) => {
    const keywordId = req.params.id;

    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query('DELETE FROM search_history WHERE id = ?', [keywordId]);
        connection.release();
        console.log('검색어가 성공적으로 삭제되었습니다.');
        res.sendStatus(200);
    } catch (error) {
        console.error('검색어 삭제 오류:', error);
        res.sendStatus(500);
    }
});



// 조회수 저장 엔드포인트
app.post('/updateViews/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Update views count
        await pool.execute('UPDATE products SET views = views + 1 WHERE id = ?', [productId]);

        res.json({ message: 'Views updated successfully' });
    } catch (error) {
        console.error('Error updating views:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/products/views', async (req, res) => {
    try {
        // 상태가 'available'인 상품을 조회수 기준으로 정렬하여 가져옴
        let [rows] = await pool.execute(`
            SELECT * FROM products
            WHERE status = 'available'
            ORDER BY views DESC
            LIMIT 15
        `);

        // 'available' 상태의 상품이 15개보다 적으면 'sold out' 상태의 상품을 추가로 가져옴
        if (rows.length < 15) {
            const availableCount = rows.length;
            const limit = 15 - availableCount;
            const [additionalRows] = await pool.query(`
                SELECT * FROM products
                WHERE status = '판매완료'
                ORDER BY views DESC
                LIMIT ${limit}
            `);

            rows = rows.concat(additionalRows);
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching products sorted by views:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/products/viewsMob', async (req, res) => {
    try {
        // 상태가 'available'인 상품을 조회수 기준으로 정렬하여 가져옴
        let [rows] = await pool.execute(`
            SELECT * FROM products
            WHERE status = 'available'
            ORDER BY views DESC
            LIMIT 30
        `);

        // 'available' 상태의 상품이 15개보다 적으면 'sold out' 상태의 상품을 추가로 가져옴
        if (rows.length < 30) {
            const availableCount = rows.length;
            const limit = 30 - availableCount;
            const [additionalRows] = await pool.query(`
                SELECT * FROM products
                WHERE status = '판매완료'
                ORDER BY views DESC
                LIMIT ${limit}
            `);

            rows = rows.concat(additionalRows);
        }

        res.json(rows);
    } catch (error) {
        console.error('Error fetching products sorted by views:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// 상품 판매완료 엔드포인트
app.put('/productsmanage/sold/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const connection = await pool.getConnection();
        // 상품 상태를 '판매완료'로 업데이트하는 쿼리 실행
        const [result] = await connection.query(
            'UPDATE products SET status = ? WHERE id = ?',
            ['판매완료', productId]
        );
        connection.release();

        if (result.affectedRows > 0) {
            // 업데이트가 성공하면 업데이트된 상품 정보 응답
            res.json({ message: '상품 판매완료 처리 완료' });
        } else {
            // 해당 상품이 없을 경우 404 에러 응답
            res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }
    } catch (error) {
        console.error('상품 판매완료 처리 오류:', error);
        res.status(500).json({ error: '서버 오류 발생' });
    }
});

// 상품 수정 엔드포인트
app.put('/productsmanage/:productId', upload.single('image'), async (req, res) => {
    const productId = req.params.productId;
    const userId = req.headers.user_id;
    const { name, description, price } = req.body;

    // 사용자 ID가 없는 경우
    if (!userId) {
        return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
    }

    // 입력 값 검증
    if (!name || !price || isNaN(price) || price < 0) {
        return res.status(400).json({ error: '상품 이름과 올바른 가격을 입력해주세요.' });
    }

    // 이미지 파일이 있는 경우에만 이미지 URL을 생성합니다.
    let imageUrl = req.file ? req.file.filename : null;

    const SELECT_PRODUCT_QUERY = 'SELECT * FROM products WHERE id = ? AND user_id = ?';
    const UPDATE_PRODUCT_QUERY = `UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?`;

    try {
        // 상품과 사용자의 일치 여부 확인 쿼리
        const [rows] = await pool.query(SELECT_PRODUCT_QUERY, [productId, userId]);

        // 상품이 존재하지 않는 경우 또는 권한이 없는 경우
        if (rows.length === 0) {
            return res.status(404).json({ error: '해당 상품을 찾을 수 없거나 수정할 권한이 없습니다.' });
        }

        // 기존 이미지 URL을 유지하기 위해 데이터베이스에 저장된 이미지 URL 가져오기
        if (!imageUrl) {
            imageUrl = rows[0].image;
        }

        // 상품 수정 쿼리
        await pool.query(UPDATE_PRODUCT_QUERY, [name, description, price, imageUrl, productId]);

        console.log('상품이 성공적으로 수정되었습니다.');
        return res.status(200).json({ message: '상품이 성공적으로 수정되었습니다.' });
    } catch (error) {
        console.error('상품 수정 오류:', error);
        return res.status(500).json({ error: '상품 수정 중 오류가 발생했습니다.' });
    }
});

// 찜 상태 확인 엔드포인트
app.get('/products/checkFavorite/:productId', async (req, res) => {
    const { productId } = req.params;
    const { userId } = req.query;

    try {
        // 사용자가 해당 상품을 찜했는지 확인
        const [favoriteRows] = await pool.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        const isFavorite = favoriteRows.length > 0;

        res.status(200).json({ isFavorite });
    } catch (error) {
        console.error('찜 상태 확인 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 찜 상태를 확인할 수 없습니다.' });
    }
});


// 찜 상태 토글 엔드포인트
app.put('/products/toggleFavorite/:productId', async (req, res) => {
    const { productId } = req.params;
    const { userId } = req.body;

    try {
        // 상품 조회
        const [productRows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
        const product = productRows[0];

        if (!product) {
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }

        const productOwnerId = product.user_id;

        // 상품 작성자와 요청 사용자 비교
        if (productOwnerId === userId) {
            return res.status(403).json({ error: '본인의 게시물에는 찜을 할 수 없습니다.', isOwner: true });
        }

        // 사용자가 이미 찜한 상태인지 확인
        const [existingFavoriteRows] = await pool.execute(
            'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        let isFavorite = false;

        if (existingFavoriteRows.length > 0) {
            // 이미 찜한 경우 찜 취소
            await pool.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
            isFavorite = false; // 찜 취소 후 상태 변경
        } else {
            // 찜 추가
            await pool.execute('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [userId, productId]);
            isFavorite = true; // 찜 추가 후 상태 변경
        }

        // 상품의 찜 개수 업데이트
        const [favoritesCountRows] = await pool.execute('SELECT COUNT(*) AS count FROM favorites WHERE product_id = ?', [productId]);
        const favoritesCount = favoritesCountRows[0].count;

        await pool.execute('UPDATE products SET favorites_count = ? WHERE id = ?', [favoritesCount, productId]);

        // 성공 응답 반환
        res.status(200).json({ success: true, isFavorite, isOwner: false, favoritesCount });
    } catch (error) {
        console.error('찜 상태 토글 오류:', error);
        res.status(500).json({ error: '서버 오류로 인해 찜 상태를 변경할 수 없습니다.' });
    }
});

app.get('/favorites', async (req, res) => {
    const userId = req.query.userId; // 쿼리 파라미터에서 userId 추출

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        // favorites 테이블과 products 테이블을 조인하여 즐겨찾기 목록과 해당 제품 정보를 가져옴
        const [rows] = await pool.query(`
          SELECT f.id, f.user_id, f.product_id, f.created_at,
                 p.name AS product_name, p.description, p.price, p.createdAt AS product_created_at,
                 p.image
          FROM favorites f
          JOIN products p ON f.product_id = p.id
          WHERE f.user_id = ?
        `, [userId]);

        // 쿼리 결과를 클라이언트에 반환
        res.json(rows);
    } catch (error) {
        console.error('Error querying favorites:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// 함수: 상품의 판매자 ID 가져오기
async function getSellerId(productId) {
    try {
        // 데이터베이스 연결 풀에서 커넥션 가져오기
        const connection = await pool.getConnection();

        try {
            // products 테이블에서 user_id 가져오기
            const [rows] = await connection.execute('SELECT user_id FROM products WHERE id = ?', [productId]);

            // 연결 해제
            connection.release();

            // 판매자 ID 반환
            return rows[0].user_id;
        } catch (error) {
            // 연결 해제
            connection.release();
            // 오류 처리
            console.error('Failed to get seller ID:', error);
            return null; // 오류 발생 시 null 반환
        }
    } catch (error) {
        // 오류 처리
        console.error('Failed to connect to database:', error);
        return null; // 오류 발생 시 null 반환
    }
}

// POST 요청 처리
app.post('/ratings', async (req, res) => {
    try {
        // 클라이언트로부터 받은 데이터
        const { productId, rating } = req.body;

        // 판매자 ID 가져오기
        const userId = await getSellerId(productId);

        if (!userId) {
            // 판매자 ID를 가져오지 못한 경우
            return res.status(404).json({ success: false, error: 'Seller not found.' });
        }

        // 데이터베이스 연결 풀에서 커넥션 가져오기
        const connection = await pool.getConnection();

        try {
            // product_ratings 테이블에 평점 등록
            await connection.execute('INSERT INTO product_ratings (user_id, product_id, rating) VALUES (?, ?, ?)', [userId, productId, rating]);

            // users 테이블에서 해당 유저의 평점 업데이트
            await connection.execute('UPDATE users SET rates = (SELECT AVG(rating) FROM product_ratings WHERE user_id = ?) WHERE id = ?', [userId, userId]);

            // 연결 해제
            connection.release();

            // 클라이언트에 응답
            return res.status(200).json({ success: true, message: 'Seller rating updated successfully.' });
        } catch (error) {
            // 연결 해제
            connection.release();
            // 오류 응답
            return res.status(500).json({ success: false, error: 'Failed to update seller rating.' });
        }
    } catch (error) {
        // 오류 응답
        return res.status(500).json({ success: false, error: 'Internal server error.' });
    }
});

// 찜 상태를 반환하는 엔드포인트
app.get('/products/isFavorite/:userId/:productId', async (req, res) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    try {
        // 데이터베이스에서 해당 사용자와 상품에 대한 찜 정보를 조회합니다.
        const favoriteQuery = 'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?';
        const [favoriteRows] = await pool.execute(favoriteQuery, [userId, productId]);

        // 찜 상태가 존재하는 경우 true를 반환합니다.
        const isFavorite = favoriteRows.length > 0;

        res.json({ isFavorite });
    } catch (error) {
        console.error('Error fetching favorite status:', error);
        res.status(500).json({ error: 'Failed to fetch favorite status' });
    }
});


// Assuming you're using Express.js for your server
app.get('/products/morelist', async (req, res) => {
    const currentProductId = req.query.currentProductId;

    try {
        const [products] = await pool.execute(
            'SELECT * FROM products WHERE id != ? ORDER BY views DESC',
            [currentProductId]
        );
        res.json(products);
    } catch (error) {
        console.error('Error fetching more products:', error);
        res.status(500).send('Server error');
    }
});

// 상품 정보 가져오기 엔드포인트
app.get('/api/products/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// 가장 많이 검색된 검색어 가져오기 엔드포인트
app.get('/topSearchKeywords', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT search_term, COUNT(search_term) AS search_count
            FROM search_history
            GROUP BY search_term
            ORDER BY search_count DESC
            LIMIT 10
        `);
        res.json(rows);
    } catch (error) {
        console.error('가장 많이 검색된 검색어를 가져오는 중 오류가 발생했습니다:', error);
        res.sendStatus(500);
    }
});

// 신고 접수 처리
app.post('/reports', async (req, res) => {
    const { productId, userId, reason, details } = req.body;

    if (!productId || !userId || !reason) {
        return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    try {
        // MySQL 트랜잭션 시작
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // products 테이블에서 seller_id 가져오기
        const [productRows] = await connection.query(
            'SELECT `user_id` FROM `products` WHERE `id` = ?',
            [productId]
        );

        if (productRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
        }

        const sellerId = productRows[0].user_id;

        // report 테이블에 삽입
        const [result] = await connection.query(
            'INSERT INTO `report` (`product_id`, `user_id`, `seller_id`, `reason`, `details`) VALUES (?, ?, ?, ?, ?)',
            [productId, userId, sellerId, reason, details || null]
        );

        // 트랜잭션 커밋
        await connection.commit();
        connection.release();

        res.status(201).json({ message: '신고가 성공적으로 접수되었습니다.' });
    } catch (error) {
        console.error('신고 접수 오류:', error);
        try {
            await pool.rollback();
            pool.release();
        } catch (rollbackError) {
            console.error('롤백 오류:', rollbackError);
        }
        res.status(500).json({ error: '서버 오류로 신고를 접수할 수 없습니다.' });
    }
});

// Fetch all reports
app.get('/reportsList', async (req, res) => {
    try {
        const [reports] = await pool.query(`
            SELECT r.id, r.product_id, r.user_id, r.reason, r.details, r.created_at, p.user_id AS seller_id
            FROM report r
            JOIN products p ON r.product_id = p.id
        `);
        res.json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
