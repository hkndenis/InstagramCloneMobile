@app.route('/api/post/<int:post_id>', methods=['GET', 'POST'])
@token_required
def get_post_detail(current_user, post_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # POST isteği için yorum ekleme
        if request.method == 'POST':
            data = request.get_json()
            comment_text = data.get('comment_text', '').strip()
            
            if not comment_text:
                return jsonify({'success': False, 'message': 'Yorum boş olamaz'}), 400
            
            cursor.execute("""
                INSERT INTO comments (post_id, user_id, comment_text)
                VALUES (%s, %s, %s)
                RETURNING comment_id, created_at
            """, (post_id, current_user['user_id'], comment_text))
            
            new_comment = cursor.fetchone()
            conn.commit()
            
            return jsonify({
                'success': True,
                'comment': new_comment
            })

        # GET isteği için yorumları getir
        cursor.execute("""
            SELECT c.*, u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = %s
            ORDER BY c.created_at DESC
        """, (post_id,))
        
        comments = cursor.fetchall()
        return jsonify({'comments': comments})

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Hata oluştu: {str(e)}")
        return jsonify({'success': False, 'message': 'Sunucu hatası'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/api/user/<string:username>')
@token_required
def get_user_by_username(current_user, username):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Kullanıcı bilgilerini getir
        cur.execute("""
            SELECT 
                u.user_id,
                u.username,
                u.full_name,
                u.avatar_url,
                u.bio,
                (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) as posts_count,
                (SELECT COUNT(*) FROM followers WHERE followed_user_id = u.user_id) as followers_count,
                (SELECT COUNT(*) FROM followers WHERE follower_user_id = u.user_id) as following_count,
                EXISTS(
                    SELECT 1 FROM followers 
                    WHERE follower_user_id = %s 
                    AND followed_user_id = u.user_id
                ) as is_following
            FROM users u
            WHERE u.username = %s
        """, (current_user['user_id'], username))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404
            
        # Kullanıcının gönderilerini getir
        cur.execute("""
            SELECT p.*, u.username, u.avatar_url,
                   COUNT(DISTINCT l.like_id) as like_count,
                   COUNT(DISTINCT c.comment_id) as comment_count,
                   EXISTS(
                       SELECT 1 FROM likes 
                       WHERE post_id = p.post_id 
                       AND user_id = %s
                   ) as user_has_liked
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN likes l ON p.post_id = l.post_id
            LEFT JOIN comments c ON p.post_id = c.post_id
            WHERE p.user_id = %s
            GROUP BY p.post_id, u.username, u.avatar_url
            ORDER BY p.created_at DESC
        """, (current_user['user_id'], user['user_id']))
        
        posts = cur.fetchall()
        
        # Avatar URL kontrolü
        if not user['avatar_url']:
            user['avatar_url'] = '/static/images/Default_pfp.jpg'
            
        cur.close()
        conn.close()
        
        return jsonify({
            'user': user,
            'posts': posts
        })
        
    except Exception as e:
        print(f"Kullanıcı bilgileri alınırken hata: {str(e)}")
        return jsonify({'error': 'Kullanıcı bilgileri alınamadı'}), 500 

@app.route('/api/profile/update', methods=['PUT'])
@token_required
def update_profile(current_user):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Profil fotoğrafı kontrolü
        if 'avatar' in request.files:
            avatar = request.files['avatar']
            if avatar and allowed_file(avatar.filename):
                filename = f"avatar_{current_user['user_id']}_{int(time.time())}_{secure_filename(avatar.filename)}"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                avatar.save(filepath)
                
                # Veritabanında avatar_url güncelle
                cur.execute(
                    "UPDATE users SET avatar_url = %s WHERE user_id = %s",
                    (f'/static/uploads/{filename}', current_user['user_id'])
                )
        
        # Ad soyad güncelleme
        if 'full_name' in request.form:
            cur.execute(
                "UPDATE users SET full_name = %s WHERE user_id = %s",
                (request.form['full_name'], current_user['user_id'])
            )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Profil güncellendi'})
        
    except Exception as e:
        print(f"Profil güncelleme hatası: {str(e)}")
        return jsonify({'error': 'Profil güncellenemedi'}), 500 