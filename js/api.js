// js/api.js

// Determine BASE_URL automatically for both local development and Nginx proxy
const getBaseUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;

    // 1. Local development (e.g., VS Code Live Server on port 5500)
    // If running on localhost/127.0.0.1 and port is not 80 (Nginx), point to backend port 8000 directly.
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port !== '' && port !== '80') {
        return "http://localhost:8000";
    }

    // 2. Production (EC2) or Local Docker environment (via Nginx proxy on port 80)
    // Nginx handles the /v1/ proxying, so we use relative paths.
    return "";
};

const BASE_URL = getBaseUrl();
const LAMBDA_URL = "https://9721v3yt5h.execute-api.ap-northeast-2.amazonaws.com/upload/image";

const STORAGE_KEYS = {
    USER_INFO: 'userInfo'
};

/**
 * Lambda 전용 이미지 업로드 함수
 */
async function uploadToLambda(formData, type) {
    const url = `${LAMBDA_URL}?type=${type}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw { status: response.status, ...data };
        }
        return data;
    } catch (error) {
        console.error(`Lambda Upload Error (${type}):`, error);
        throw error;
    }
}

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
        // 회원가입 (JSON or FormData)
        signup: (data) => fetchAPI('/v1/auth/signup', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data)
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
        // 비밀번호 수정 (password 필요)
        updatePassword: (data) => fetchAPI('/v1/users/password', {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        // 프로필 이미지 업로드 (Lambda 사용)
        uploadProfileImage: (formData) => uploadToLambda(formData, 'profile'),
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
        // 게시글 이미지 업로드 (Lambda 사용)
        uploadImage: (formData) => uploadToLambda(formData, 'post'),
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
window.BASE_URL = BASE_URL;
