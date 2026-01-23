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

// Render List
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'post-card';
    article.onclick = () => location.href = 'post_detail.html';

    article.innerHTML = `
        <div class="post-header">
            <h2 class="post-title">${truncateTitle(post.title)}</h2>
            <div class="post-meta">
                <div class="post-stats">
                    <span>좋아요 ${formatCountDisplay(post.likes)}</span>
                    <span>댓글 ${formatCountDisplay(post.comments)}</span>
                    <span>조회수 ${formatCountDisplay(post.views)}</span>
                </div>
                <span class="post-date">${formatDate(post.date)}</span>
            </div>
        </div>
        <hr class="post-divider">
        <div class="post-footer">
            <div class="author-avatar"></div>
            <span class="author-name">${post.author}</span>
        </div>
    `;
    return article;
}

function loadPosts() {
    if (isLoading) return;
    isLoading = true;

    // Simulate API delay
    setTimeout(() => {
        const newPosts = generateDummyPosts(limit);
        const postList = document.querySelector('.post-list');
        
        if (postList) {
            newPosts.forEach(post => {
                postList.appendChild(createPostElement(post));
            });
            page++;
        }
        isLoading = false;
    }, 500);
}

// Infinite Scroll for List
function handleScroll() {
    const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
        loadPosts();
    }
}

// Detail Page Logic
function initDetailPage() {
    const titleEl = document.getElementById('detail-title');
    if (!titleEl) return; // Not on detail page

    // Dummy Data for Detail
    const dummyDetail = {
        title: '제목 1',
        author: '더미 작성자 1',
        date: '2021-01-01T00:00:00',
        likes: 123,
        views: 123,
        commentsCount: 123
    };

    // Render Header
    document.getElementById('detail-title').innerText = dummyDetail.title;
    document.getElementById('detail-author').innerText = dummyDetail.author;
    document.getElementById('detail-date').innerText = formatDate(dummyDetail.date);

    // Render Stats
    updateLikeDisplay(dummyDetail.likes);
    document.getElementById('detail-views').innerText = formatCountDisplay(dummyDetail.views);
    document.getElementById('detail-comments').innerText = formatCountDisplay(dummyDetail.commentsCount);

    // Render Comments
    const commentList = document.getElementById('comment-list');
    const comments = generateDummyComments(3);
    comments.forEach(comment => {
        commentList.appendChild(createCommentElement(comment));
    });

    // Event Listeners for Input
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
    }
}

function updateLikeDisplay(count) {
    const likeBtn = document.getElementById('like-btn');
    const countSpan = document.getElementById('detail-likes');
    
    if (countSpan) countSpan.innerText = formatCountDisplay(count);
    
    if (likeBtn) {
        if (isLiked) {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
    }
}

function toggleLike() {
    const countSpan = document.getElementById('detail-likes');
    let currentCount = parseInt(countSpan.innerText.replace('k', '000')); // Simple parse for now
    
    let baseCount = 123;
    
    isLiked = !isLiked;
    updateLikeDisplay(isLiked ? baseCount + 1 : baseCount);
}

function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.id = `comment-${comment.id}`;
    div.innerHTML = `
        <div class="author-avatar"></div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="author-name">${comment.author}</span>
                <span class="comment-date">${formatDate(comment.date)}</span>
            </div>
            <p class="comment-text">${comment.content}</p>
        </div>
        <div class="edit-actions comment-actions">
            <button class="btn-small" onclick="alert('수정 기능 구현 예정')">수정</button>
            <button class="btn-small" onclick="showDeleteModal('comment', ${comment.id})">삭제</button>
        </div>
    `;
    return div;
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

function confirmDelete() {
    if (!currentDeleteTarget) return;

    if (currentDeleteTarget.type === 'post') {
        alert('게시글이 삭제되었습니다.');
        location.href = 'post_list.html';
    } else if (currentDeleteTarget.type === 'comment') {
        const commentEl = document.getElementById(`comment-${currentDeleteTarget.id}`);
        if (commentEl) commentEl.remove();
        alert('댓글이 삭제되었습니다.');
        closeDeleteModal();
    }
}

// Edit Page Logic
function initEditPage() {
    const editForm = document.getElementById('edit-form');
    if (!editForm) return;

    // Pre-fill Dummy Data
    const dummyData = {
        title: '제목 1',
        content: `무엇을 얘기할까요? 아무말이라면, 삶은 항상 놀라운 모험이라고 생각합니다. 우리는 매일 새로운 경험을 하고 배우며 성장합니다. 때로는 어려움과 도전이 있지만, 그것들이 우리를 더 강하고 지혜롭게 만듭니다. 또한 우리는 주변의 사람들과 연결되며 사랑과 지지를 받습니다. 그래서 우리의 삶은 소중하고 의미가 있습니다.\n\n자연도 아름다운 이야기입니다. 우리 주변의 자연은 끝없는 아름다움과 신비로움을 담고 있습니다. 산, 바다, 숲, 하늘 등 모든 것이 우리를 놀라게 만들고 감동시킵니다. 자연은 우리의 생명과 안정을 지키며 우리에게 힘을 주는 곳입니다.\n\n마지막으로, 지식을 향한 탐구는 항상 흥미로운 여정입니다. 우리는 끝없는 지식의 바다에서 배우고 발견할 수 있으며, 이것이 우리를 더 깊이 이해하고 세상을 더 넓게 보게 해줍니다. 그런 의미에서, 삶은 놀라움과 경이로움으로 가득 차 있습니다. 새로운 경험을 즐기고 항상 앞으로 나아가는 것이 중요하다고 생각합니다.`,
        image: '기존 파일 명'
    };

    const titleInput = document.getElementById('edit-title-input');
    const contentInput = document.getElementById('edit-content-input');
    const fileNameDisplay = document.getElementById('file-name');
    const fileInput = document.getElementById('file-input');

    if (titleInput) titleInput.value = dummyData.title;
    if (contentInput) contentInput.value = dummyData.content;
    if (fileNameDisplay) fileNameDisplay.innerText = dummyData.image;

    // Title Limit Enforcement
    if (titleInput) {
        titleInput.addEventListener('input', () => {
            if (titleInput.value.length > 26) {
                titleInput.value = titleInput.value.substring(0, 26);
            }
        });
    }

    // File Input Change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileNameDisplay.innerText = e.target.files[0].name;
            }
        });
    }
}

function handlePostUpdate(event) {
    event.preventDefault();
    alert('게시글이 수정되었습니다.');
    location.href = 'post_detail.html';
}

// Create Page Logic
function initCreatePage() {
    const createForm = document.getElementById('create-form');
    if (!createForm) return;

    const titleInput = document.getElementById('create-title-input');
    const contentInput = document.getElementById('create-content-input');
    const submitBtn = document.getElementById('create-submit-btn');
    const fileNameDisplay = document.getElementById('create-file-name');
    const fileInput = document.getElementById('create-file-input');

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

function handlePostCreate(event) {
    event.preventDefault();

    const titleInput = document.getElementById('create-title-input');
    const contentInput = document.getElementById('create-content-input');

    // Double check just in case disabled attribute is tampered
    if (titleInput.value.trim().length === 0 || contentInput.value.trim().length === 0) {
        alert('*제목, 내용을 모두 작성해주세요');
        return;
    }

    alert('게시글 작성이 완료되었습니다.'); // Assuming alert message for creation
    location.href = 'post_list.html';
}


// Init
document.addEventListener('DOMContentLoaded', () => {
    // List Page Logic
    const postList = document.querySelector('.post-list');
    if (postList) {
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