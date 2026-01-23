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

function handleLogin(event) {
    event.preventDefault();
    location.href = '../board/post_list.html';
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

// Init
document.addEventListener('DOMContentLoaded', () => {
    initLoginPage();
    initSignupPage();
});