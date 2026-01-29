// Auth JavaScript

// Constants / Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// Login Page Logic
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    
    const emailHelper = document.getElementById('email-helper');
    const passwordHelper = document.getElementById('password-helper');

    // Validation State
    let isEmailValid = false;
    let isPasswordValid = false;

    function validateEmail() {
        const value = emailInput.value.trim();
        if (value === '') {
            emailHelper.innerText = '*이메일을 입력해주세요.';
            emailHelper.classList.add('visible');
            isEmailValid = false;
        } else if (!EMAIL_REGEX.test(value)) {
            emailHelper.innerText = '*올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)';
            emailHelper.classList.add('visible');
            isEmailValid = false;
        } else {
            emailHelper.classList.remove('visible');
            isEmailValid = true;
        }
        updateButtonState();
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (value === '') {
            passwordHelper.innerText = '*비밀번호를 입력해주세요';
            passwordHelper.classList.add('visible');
            isPasswordValid = false;
        } else if (!PASSWORD_REGEX.test(value)) {
            passwordHelper.innerText = '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            passwordHelper.classList.add('visible');
            isPasswordValid = false;
        } else {
            passwordHelper.classList.remove('visible');
            isPasswordValid = true;
        }
        updateButtonState();
    }

    function updateButtonState() {
        if (isEmailValid && isPasswordValid) {
            loginBtn.disabled = false;
            loginBtn.classList.add('active');
        } else {
            loginBtn.disabled = true;
            loginBtn.classList.remove('active');
        }
    }

    if (emailInput) emailInput.addEventListener('input', validateEmail);
    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await API.auth.login(email, password);
        
        // 유저 정보 저장 (세션은 브라우저 쿠키로 자동 관리됨)
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify({
            id: response.data.user.id,
            email: response.data.user.email,
            nickname: response.data.user.nickname
        }));

        location.href = '../board/post_list.html';
    } catch (error) {
        console.error(error);
        alert(error.code === 'INVALID_CREDENTIALS' ? '이메일 또는 비밀번호가 일치하지 않습니다.' : '로그인 중 오류가 발생했습니다.');
    }
}

// Signup Page Logic
function initSignupPage() {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    const fileInput = document.getElementById('profile-file-input');
    const fileNameDisplay = document.getElementById('profile-file-name');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                fileNameDisplay.innerText = e.target.files[0].name;
            } else {
                fileNameDisplay.innerText = '파일을 선택해주세요.';
            }
        });
    }
}

async function handleSignup(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    const nickname = document.getElementById('nickname').value.trim();

    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        await API.auth.signup({
            email,
            password,
            nickname
        });

        alert('회원가입이 완료되었습니다. 로그인해 주세요.');
        location.href = 'login.html';
    } catch (error) {
        console.error(error);
        if (error.code === 'EMAIL_ALREADY_EXISTS') {
            alert('이미 사용 중인 이메일입니다.');
        } else if (error.code === 'NICKNAME_ALREADY_EXISTS') {
            alert('이미 사용 중인 닉네임입니다.');
        } else if (error.data) {
            // 유효성 검사 에러 상세 표시
            // error.data가 객체인 경우 메시지 추출
            let msg = '';
            if (typeof error.data === 'object') {
                for (const key in error.data) {
                    msg += `${key}: ${error.data[key]}\n`;
                }
            } else {
                msg = JSON.stringify(error.data);
            }
            alert(`입력값이 올바르지 않습니다.\n${msg}`);
        } else {
            alert('회원가입 중 오류가 발생했습니다.');
        }
    }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
    initSignupPage();
});