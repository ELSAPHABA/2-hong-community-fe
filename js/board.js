// Board JavaScript

// State
let page = 1;
const limit = 10;
let isLoading = false;
let isLiked = false; // Detail page state
let currentDeleteTarget = null; // 'post' or commentId

// Dummy Data Generator
function generateDummyPosts(count) {
    const posts = [];
    for (let i = 0; i < count; i++) {
        const id = (page - 1) * limit + i + 1;
        posts.push({
            id: id,
            title: `제목 ${id} - 게시글 제목이 아주 길어지면 어떻게 될까요 26자가 넘어가면 잘려야 합니다`,
            likes: Math.floor(Math.random() * 20000),
            comments: Math.floor(Math.random() * 5000),
            views: Math.floor(Math.random() * 150000),
            date: '2021-01-01T00:00:00',
            author: `더미 작성자 ${1}`
        });
    }
    return posts;
}

function generateDummyComments(count) {
    const comments = [];
    for (let i = 0; i < count; i++) {
        comments.push({
            id: i + 1,
            author: `더미 작성자 ${1}`,
            content: '댓글 내용',
            date: '2021-01-01T00:00:00'
        });
    }
    return comments;
}

// Formatters
function formatCount(num) {
    if (num >= 1000) {
        if (num >= 10000 && num < 100000) return Math.floor(num / 1000) + 'k';
        if (num >= 100000) return Math.floor(num / 1000) + 'k';
        return Math.floor(num / 1000) + 'k';
    }
    return num;
}
// Improved formatter to match requirements exactly
// 1k, 10k, 100k
function formatCountDisplay(num) {
     if (num >= 1000) {
        return Math.floor(num / 1000) + 'k';
    }
    return num;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

function truncateTitle(title) {
    if (title.length > 26) {
        return title.substring(0, 26) + "...";
    }
    return title;
}

function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('/')) {
        return `${window.BASE_URL}${url}`;
    }
    return url;
}

// Render List
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.onclick = () => location.href = `post_detail.html?id=${post.postId}`;

    // 프로필 이미지가 없을 경우 대비 (CSS에서 기본 배경색 처리 또는 기본 이미지)
    const imageUrl = getImageUrl(post.author.profileImageUrl);
    const profileStyle = imageUrl 
        ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;` 
        : '';

    article.innerHTML = `
        <div class="post-header">
            <h2 class="post-title">${truncateTitle(post.title)}</h2>
            <div class="post-meta">
                <div class="post-stats">
                    <span>좋아요 ${formatCountDisplay(post.likeCount)}</span>
                    <span>댓글 ${formatCountDisplay(post.commentCount)}</span>
                    <span>조회수 ${formatCountDisplay(post.hits)}</span>
                </div>
                <span class="post-date">${formatDate(post.createdAt)}</span>
            </div>
        </div>
        <hr class="post-divider">
        <div class="post-footer">
            <div class="author-avatar" style="${profileStyle}"></div>
            <span class="author-name">${post.author.nickname}</span>
        </div>
    `;
    return article;
}

async function loadPosts() {
    if (isLoading) return;
    isLoading = true;

    try {
        const response = await API.posts.getList(page, limit);
        const posts = response.data;
        
        const postList = document.querySelector('.post-list');
        if (postList) {
            if (posts.length > 0) {
                posts.forEach(post => {
                    postList.appendChild(createPostElement(post));
                });
                page++;
            } else if (page === 1) {
                postList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">등록된 게시글이 없습니다.</div>';
            }
        }
    } catch (error) {
        console.error('Failed to load posts:', error);
        if (error.status === 401) {
            alert('조회 권한이 없습니다. 로그인 해 주세요.');
            history.back();
        }
    } finally {
        isLoading = false;
    }
}

// Infinite Scroll for List
function handleScroll() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadPosts();
    }
}

// Detail Page Logic
async function initDetailPage() {
    const titleEl = document.getElementById('detail-title');
    if (!titleEl) return; // Not on detail page

    // 1. Get Post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        alert('잘못된 접근입니다.');
        location.href = 'post_list.html';
        return;
    }

    try {
        // 2. Fetch Post Detail
        const postResponse = await API.posts.getDetail(postId);
        const post = postResponse.data;

        // 3. Render Post Info
        document.getElementById('detail-title').innerText = post.title;
        document.getElementById('detail-author').innerText = post.author.nickname;
        document.getElementById('detail-date').innerText = formatDate(post.createdAt);
        
        // Author Avatar
        const authorAvatar = document.querySelector('.detail-header .author-avatar');
        if (authorAvatar) {
            const avatarUrl = getImageUrl(post.author.profileImageUrl);
            if (avatarUrl) {
                authorAvatar.style.backgroundImage = `url('${avatarUrl}')`;
                authorAvatar.style.backgroundSize = 'cover';
                authorAvatar.style.backgroundPosition = 'center';
            }
        }

        updateLikeDisplay(post.likeCount, post.likedBy); // Pass full list or check status
        
        document.getElementById('detail-views').innerText = formatCountDisplay(post.hits);
        document.getElementById('detail-comments').innerText = formatCountDisplay(post.commentCount);

        // Content (Handle newlines)
        const contentHtml = post.content.replace(/\n/g, '<br>');
        document.querySelector('.post-text').innerHTML = contentHtml;

        // Image
        const imagePlaceholder = document.querySelector('.post-image-placeholder');
        if (post.file && post.file.fileUrl) {
            // Remove placeholder bg and add img
            const fileUrl = getImageUrl(post.file.fileUrl);
            imagePlaceholder.innerHTML = `<img src="${fileUrl}" style="width: 100%; height: auto; border-radius: 8px;" alt="Post Image">`;
            imagePlaceholder.style.backgroundColor = 'transparent';
            imagePlaceholder.style.height = 'auto';
        } else {
            imagePlaceholder.style.display = 'none';
        }

        // Author Check (Current User)
        const currentUserStr = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        const currentUserId = currentUser ? currentUser.id : null;

        // Show/Hide Edit & Delete Buttons
        const editActions = document.querySelector('.detail-header .edit-actions');
        if (currentUserId && post.author.userId === currentUserId) {
            editActions.style.display = 'flex';
            
            // Set OnClick handlers
            const editBtn = editActions.querySelector('button:first-child'); // First button is Edit
            editBtn.onclick = () => location.href = `post_edit.html?id=${postId}`;
            
            const deleteBtn = editActions.querySelector('button:last-child'); // Second is Delete
            deleteBtn.onclick = () => showDeleteModal('post', postId);
        } else {
            editActions.style.display = 'none';
        }

        // Check if Liked
        if (currentUserId && post.likedBy && post.likedBy.includes(currentUserId)) {
            isLiked = true;
            document.getElementById('like-btn').classList.add('active');
        } else {
            isLiked = false;
             document.getElementById('like-btn').classList.remove('active');
        }

        // 4. Load Comments
        loadComments(postId, currentUserId);

        // 5. Setup Comment Input
        setupCommentInput(postId);

    } catch (error) {
        console.error('Failed to load post detail:', error);
        alert('게시글을 불러오는 데 실패했습니다.');
        location.href = 'post_list.html';
    }
}

async function loadComments(postId, currentUserId) {
    const commentList = document.getElementById('comment-list');
    commentList.innerHTML = ''; // Clear

    try {
        const response = await API.comments.getList(postId);
        const comments = response.data;
        
        comments.forEach(comment => {
            commentList.appendChild(createCommentElement(comment, currentUserId));
        });
    } catch (error) {
        console.error('Failed to load comments:', error);
    }
}

function setupCommentInput(postId) {
    const commentInput = document.getElementById('comment-input');
    const submitBtn = document.getElementById('comment-submit-btn');
    
    if (commentInput && submitBtn) {
        commentInput.addEventListener('input', () => {
            if (commentInput.value.trim().length > 0) {
                submitBtn.disabled = false;
                submitBtn.classList.add('active');
            } else {
                submitBtn.disabled = true;
                submitBtn.classList.remove('active');
            }
        });

        submitBtn.onclick = async () => {
            const content = commentInput.value.trim();
            if (!content) return;

            try {
                await API.comments.create(postId, content);
                commentInput.value = '';
                submitBtn.disabled = true;
                submitBtn.classList.remove('active');
                
                // Reload comments
                const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || '{}');
                loadComments(postId, currentUser.id);

                // Update Comment Count (Optional: fetch detail again or just increment UI)
                const countSpan = document.getElementById('detail-comments');
                let count = parseInt(countSpan.innerText.replace('k', '000')) || 0; // Simple parse
                countSpan.innerText = formatCountDisplay(count + 1);

            } catch (error) {
                alert('댓글 등록에 실패했습니다.');
            }
        };
    }
}

function updateLikeDisplay(count, likedBy) {
    const likeBtn = document.getElementById('like-btn');
    const countSpan = document.getElementById('detail-likes');
    
    if (countSpan) countSpan.innerText = formatCountDisplay(count);
    // Active class is handled in initDetailPage based on user
}

async function toggleLike() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) return;

    try {
        let response;
        if (isLiked) {
            response = await API.posts.unlike(postId);
            isLiked = false;
            document.getElementById('like-btn').classList.remove('active');
        } else {
            response = await API.posts.like(postId);
            isLiked = true;
            document.getElementById('like-btn').classList.add('active');
        }
        
        // Update count
        updateLikeDisplay(response.data.likeCount);

    } catch (error) {
        console.error('Like toggle failed:', error);
        if (error.status === 401) {
            alert('로그인이 필요합니다.');
        } else if (error.status === 409) {
             // Conflict (already liked/unliked), just reload or ignore
             location.reload();
        }
    }
}

function createCommentElement(comment, currentUserId) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.id = `comment-${comment.commentId}`;
    
    // 프로필 이미지 스타일
    const imageUrl = getImageUrl(comment.author.profileImageUrl);
    const profileStyle = imageUrl 
        ? `background-image: url('${imageUrl}'); background-size: cover; background-position: center;` 
        : '';

    let buttonsHtml = '';
    if (currentUserId && comment.author.userId === currentUserId) {
        buttonsHtml = `
            <div class="edit-actions comment-actions">
                <button class="btn-small" onclick="toggleEditComment(${comment.commentId})">수정</button>
                <button class="btn-small" onclick="showDeleteModal('comment', ${comment.commentId})">삭제</button>
            </div>
        `;
    }

    div.innerHTML = `
        <div class="author-avatar" style="${profileStyle}"></div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="author-name">${comment.author.nickname}</span>
                <span class="comment-date">${formatDate(comment.createdAt)}</span>
            </div>
            <p class="comment-text">${comment.content}</p>
            <!-- Edit Form Placeholder -->
        </div>
        ${buttonsHtml}
    `;
    return div;
}

// Comment Edit Logic
function toggleEditComment(commentId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (!commentItem) return;

    const contentDiv = commentItem.querySelector('.comment-content');
    const textP = contentDiv.querySelector('.comment-text');
    const currentText = textP.innerText;

    // Hide original text
    textP.style.display = 'none';

    // Check if edit form already exists
    let editForm = contentDiv.querySelector('.edit-comment-form');
    if (!editForm) {
        editForm = document.createElement('div');
        editForm.className = 'edit-comment-form';
        editForm.innerHTML = `
            <textarea class="comment-textarea" style="margin-top: 10px;">${currentText}</textarea>
            <div style="text-align: right; margin-top: 5px; display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-small" onclick="cancelEditComment(${commentId})">취소</button>
                <button class="btn-small" style="background-color: #ACA0EB; color: white; border: none;" onclick="submitEditComment(${commentId})">수정 완료</button>
            </div>
        `;
        contentDiv.appendChild(editForm);
    } else {
        editForm.style.display = 'block';
        editForm.querySelector('textarea').value = currentText;
    }

    // Hide original actions
    const actionsDiv = commentItem.querySelector('.comment-actions');
    if (actionsDiv) actionsDiv.style.display = 'none';
}

function cancelEditComment(commentId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (!commentItem) return;

    const contentDiv = commentItem.querySelector('.comment-content');
    const textP = contentDiv.querySelector('.comment-text');
    const editForm = contentDiv.querySelector('.edit-comment-form');
    const actionsDiv = commentItem.querySelector('.comment-actions');

    if (textP) textP.style.display = 'block';
    if (editForm) editForm.style.display = 'none';
    if (actionsDiv) actionsDiv.style.display = 'flex';
}

async function submitEditComment(commentId) {
    const commentItem = document.getElementById(`comment-${commentId}`);
    if (!commentItem) return;

    const contentDiv = commentItem.querySelector('.comment-content');
    const textP = contentDiv.querySelector('.comment-text');
    const editForm = contentDiv.querySelector('.edit-comment-form');
    const textarea = editForm.querySelector('textarea');
    const newText = textarea.value;

    if (newText.trim().length === 0) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        await API.comments.update(postId, commentId, newText);

        textP.innerText = newText;
        cancelEditComment(commentId);
    } catch (error) {
        console.error('Comment update failed:', error);
        alert('댓글 수정에 실패했습니다.');
    }
}

// Modal Logic
function showDeleteModal(targetType, targetId) {
    currentDeleteTarget = { type: targetType, id: targetId };
    const modal = document.getElementById('delete-modal');
    const title = document.getElementById('modal-title');
    
    if (targetType === 'post') {
        if (title) title.innerText = '게시글을 삭제하시겠습니까?';
    } else if (targetType === 'comment') {
        if (title) title.innerText = '댓글을 삭제하시겠습니까?';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Lock scroll
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Unlock scroll
    currentDeleteTarget = null;
}

async function confirmDelete() {
    if (!currentDeleteTarget) return;

    try {
        if (currentDeleteTarget.type === 'post') {
            await API.posts.delete(currentDeleteTarget.id);
            alert('게시글이 삭제되었습니다.');
            location.href = 'post_list.html';
        } else if (currentDeleteTarget.type === 'comment') {
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('id');

            await API.comments.delete(postId, currentDeleteTarget.id);
            
            const commentEl = document.getElementById(`comment-${currentDeleteTarget.id}`);
            if (commentEl) commentEl.remove();

            // Update Count UI
            const countSpan = document.getElementById('detail-comments');
            let count = parseInt(countSpan.innerText.replace('k', '000')) || 0;
            countSpan.innerText = formatCountDisplay(Math.max(0, count - 1));

            closeDeleteModal();
        }
    } catch (error) {
        console.error('Delete failed:', error);
        alert('삭제에 실패했습니다.');
        closeDeleteModal();
    }
}

// Helper: Image Upload
async function uploadImage(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file); // Use 'file' as key
    const response = await API.posts.uploadImage(formData);
    
    if (!response || !response.data) {
        throw new Error('Image upload response invalid');
    }
    // Lambda returns the URL in 'filePath'
    return response.data.filePath; 
}

// Edit Page Logic
async function initEditPage() {
    const editForm = document.getElementById('edit-form');
    if (!editForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (!postId) {
        alert('잘못된 접근입니다.');
        location.href = 'post_list.html';
        return;
    }

    try {
        const response = await API.posts.getDetail(postId);
        const post = response.data;

        const titleInput = document.getElementById('edit-title-input');
        const contentInput = document.getElementById('edit-content-input');
        const fileNameDisplay = document.getElementById('file-name');
        
        if (titleInput) titleInput.value = post.title;
        if (contentInput) contentInput.value = post.content;
        
        if (post.file && post.file.fileUrl) {
            if (fileNameDisplay) fileNameDisplay.innerText = post.file.fileUrl.split('/').pop();
            editForm.dataset.originalFileUrl = post.file.fileUrl;
        }

        // Event Listeners (Title Limit, File Input)
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                if (titleInput.value.length > 26) {
                    titleInput.value = titleInput.value.substring(0, 26);
                }
            });
        }

        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    fileNameDisplay.innerText = e.target.files[0].name;
                }
            });
        }

    } catch (error) {
        console.error('Failed to load post for edit:', error);
        alert('게시글 정보를 불러오지 못했습니다.');
        location.href = 'post_list.html';
    }
}

async function handlePostUpdate(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    const title = document.getElementById('edit-title-input').value;
    const content = document.getElementById('edit-content-input').value;
    const fileInput = document.getElementById('file-input');

    if (!title.trim() || !content.trim()) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    try {
        let fileUrl = document.getElementById('edit-form').dataset.originalFileUrl || null;

        if (fileInput.files.length > 0) {
            fileUrl = await uploadImage(fileInput.files[0]);
        }

        await API.posts.update(postId, {
            title,
            content,
            fileUrl: fileUrl
        });

        alert('게시글이 수정되었습니다.');
        location.href = `post_detail.html?id=${postId}`;
    } catch (error) {
        console.error('Update failed:', error);
        alert('게시글 수정에 실패했습니다.');
    }
}

// Create Page Logic
function initCreatePage() {
    const createForm = document.getElementById('create-form');
    if (!createForm) return;

    // Login check for create page
    const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    if (!userInfo) {
        alert('로그인이 필요합니다.');
        location.href = '../auth/login.html';
        return;
    }

    const titleInput = document.getElementById('create-title-input');
    const contentInput = document.getElementById('create-content-input');
    const submitBtn = document.getElementById('create-submit-btn');
    const fileNameDisplay = document.getElementById('create-file-name');
    const fileInput = document.getElementById('create-file-input');

    // Attach Submit Listener
    createForm.addEventListener('submit', handlePostCreate);

    // Title Limit Enforcement
    titleInput.addEventListener('input', () => {
        if (titleInput.value.length > 26) {
            titleInput.value = titleInput.value.substring(0, 26);
        }
        checkFormValidity();
    });

    contentInput.addEventListener('input', checkFormValidity);

    function checkFormValidity() {
        const isTitleFilled = titleInput.value.trim().length > 0;
        const isContentFilled = contentInput.value.trim().length > 0;

        if (isTitleFilled && isContentFilled) {
            submitBtn.disabled = false;
            submitBtn.classList.add('active');
        } else {
            submitBtn.disabled = true;
            submitBtn.classList.remove('active');
        }
    }

    // File Input Change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.innerText = e.target.files[0].name;
        }
    });
}

async function handlePostCreate(event) {
    event.preventDefault();

    const title = document.getElementById('create-title-input').value;
    const content = document.getElementById('create-content-input').value;
    const fileInput = document.getElementById('create-file-input');
    const submitBtn = document.getElementById('create-submit-btn');
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || '{}');

    if (!title.trim() || !content.trim()) {
        alert('제목과 내용을 모두 입력해주세요');
        return;
    }

    // Disable button to prevent double submit
    submitBtn.disabled = true;

    try {
        let imageUrl = null;
        if (fileInput.files.length > 0) {
            imageUrl = await uploadImage(fileInput.files[0]);
        }

        await API.posts.create({
            title,
            content,
            image: imageUrl,
            nickname: currentUser.nickname
        });

        alert('게시글 작성이 완료되었습니다.');
        // 성공 시 목록 페이지로 이동
        window.location.replace('post_list.html');

    } catch (error) {
        console.error('Create failed:', error);
        alert('게시글 등록에 실패했습니다.');
        // Re-enable button on failure
        submitBtn.disabled = false;
        if (title.trim() && content.trim()) {
            submitBtn.classList.add('active');
        }
    }
}



// Init
document.addEventListener('DOMContentLoaded', () => {
    // List Page Logic
    const postList = document.querySelector('.post-list');
    if (postList) {
        // Check for login status
        const userInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        if (!userInfo) {
            alert('조회 권한이 없습니다. 로그인 해 주세요.');
            history.back();
            return;
        }

        postList.innerHTML = '';
        loadPosts();
        window.addEventListener('scroll', handleScroll);
    }

    // Detail Page Logic
    initDetailPage();

    // Edit Page Logic
    initEditPage();

    // Create Page Logic
    initCreatePage();
});