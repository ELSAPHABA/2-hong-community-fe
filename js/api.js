// js/api.js

// Determine BASE_URL dynamically to match the current hostname (localhost or 127.0.0.1)
// This prevents SameSite cookie blocking when the frontend is on 127.0.0.1 and backend is hardcoded to localhost.
const getBaseUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === '127.0.0.1') {
        return "http://127.0.0.1:8000";
    }
    return "http://localhost:8000";
};

const BASE_URL = getBaseUrl();
const STORAGE_KEYS = {
    USER_INFO: 'userInfo'
};

/**
 * Fetch API Wrapper
 * - Base URL 자동 적용
 * - JSON 응답 처리 및 에러 핸들링
 * - credentials: 'include' (쿠키/세션 전송)
 */
async function fetchAPI(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    // FormData 전송 시 Content-Type 헤더 제거 (브라우저가 자동 설정)
    if (options.body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
        credentials: 'include' // 세션 쿠키 전송을 위해 필수
    };

    try {
        const response = await fetch(url, config);
        
        // 응답 본문이 없는 경우(204 No Content 등)를 대비
        let data = null;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            // 401 Unauthorized 처리 (예: 세션 만료 시 로그아웃)
            if (response.status === 401) {
                console.warn('Unauthorized. Please login again.');
                // 필요 시 자동 로그아웃 로직 추가 (화면 이동 등)
                // window.location.href = '/pages/auth/login.html';
            }
            // 백엔드 에러 메시지 포함하여 throw
            throw { status: response.status, ...data };
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// API Endpoints
const API = {
    auth: {
        // 로그인
        login: (email, password) => fetchAPI('/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
        // 회원가입 (JSON 전송)
        signup: (data) => fetchAPI('/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        // 이메일 중복 체크
        checkEmail: (email) => fetchAPI(`/v1/auth/emails/availability?email=${email}`),
        // 닉네임 중복 체크
        checkNickname: (nickname) => fetchAPI(`/v1/auth/nicknames/availability?nickname=${nickname}`),
        // 로그아웃
        logout: () => fetchAPI('/v1/auth/session', { method: 'DELETE' }),
    },
    users: {
        // 내 정보 조회
        getMe: () => fetchAPI('/v1/users/me'),
        // 특정 유저 정보 조회
        getUser: (userId) => fetchAPI(`/v1/users/${userId}`),
        // 내 정보 수정 (닉네임, 프로필 이미지 URL 등)
        updateInfo: (data) => fetchAPI('/v1/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        // 비밀번호 수정 (currentPassword, password 필요)
        updatePassword: (data) => fetchAPI('/v1/users/password', {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        // 프로필 이미지 업로드 (FormData)
        uploadProfileImage: (formData) => fetchAPI('/v1/users/me/profile-image', {
            method: 'POST',
            body: formData
        }),
        // 회원 탈퇴
        withdraw: () => fetchAPI('/v1/users/me', { method: 'DELETE' }),
    },
    posts: {
        // 게시글 목록 조회
        getList: (page = 1, size = 10) => fetchAPI(`/v1/posts?page=${page}&size=${size}`),
        // 게시글 상세 조회
        getDetail: (postId) => fetchAPI(`/v1/posts/${postId}`),
        // 게시글 작성
        create: (data) => fetchAPI('/v1/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        // 게시글 수정
        update: (postId, data) => fetchAPI(`/v1/posts/${postId}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        // 게시글 삭제
        delete: (postId) => fetchAPI(`/v1/posts/${postId}`, { method: 'DELETE' }),
        // 게시글 이미지 업로드 (FormData)
        uploadImage: (formData) => fetchAPI('/v1/posts/image', {
            method: 'POST',
            body: formData
        }),
        // 좋아요
        like: (postId) => fetchAPI(`/v1/posts/${postId}/likes`, { method: 'POST' }),
        // 좋아요 취소
        unlike: (postId) => fetchAPI(`/v1/posts/${postId}/likes`, { method: 'DELETE' }),
    },
    comments: {
        // 댓글 목록 조회
        getList: (postId) => fetchAPI(`/v1/posts/${postId}/comments`),
        // 댓글 작성
        create: (postId, content) => fetchAPI(`/v1/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        }),
        // 댓글 수정
        update: (postId, commentId, content) => fetchAPI(`/v1/posts/${postId}/comments/${commentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ content })
        }),
        // 댓글 삭제
        delete: (postId, commentId) => fetchAPI(`/v1/posts/${postId}/comments/${commentId}`, { method: 'DELETE' }),
    }
};

// 전역 객체로 노출
window.API = API;
window.STORAGE_KEYS = STORAGE_KEYS;
