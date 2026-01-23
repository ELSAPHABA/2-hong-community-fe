// User JavaScript

// Constants
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;

// Profile Edit Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if on profile edit page
    const profileEditForm = document.getElementById('profile-edit-form');
    if (profileEditForm) {
        initProfileEdit();
    }

    // Check if on password edit page
    const passwordEditForm = document.getElementById('password-edit-form');
    if (passwordEditForm) {
        initPasswordEdit();
    }
});

function initProfileEdit() {
    const nicknameInput = document.getElementById('nickname');
    const helperText = document.getElementById('nickname-helper');
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('profile-preview');

    // 1. Profile Image Preview
    if (profileUpload) {
        profileUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profilePreview.src = e.target.result;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    if (nicknameInput) {
        nicknameInput.addEventListener('input', () => {
            // Real-time checks if needed
        });
    }
}

function handleProfileUpdate(event) {
    event.preventDefault();
    
    const nicknameInput = document.getElementById('nickname');
    const helperText = document.getElementById('nickname-helper');
    const nickname = nicknameInput.value.trim();

    // Reset helper
    helperText.classList.remove('visible');

    // Validation Logic
    if (nickname === '') {
        helperText.innerText = '*닉네임을 입력해주세요.';
        helperText.classList.add('visible');
        return;
    }

    if (nickname.length > 10) {
        helperText.innerText = '*닉네임은 최대 10자 까지 작성 가능합니다.';
        helperText.classList.add('visible');
        return;
    }

    // Simulate Duplicate Check
    if (nickname === '중복') {
        helperText.innerText = '*중복된 닉네임 입니다.';
        helperText.classList.add('visible');
        return;
    }

    // Success
    showToast();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // 3 seconds
}

// Withdraw Logic
function showWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWithdrawModal() {
    document.getElementById('withdraw-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function confirmWithdraw() {
    alert('회원 탈퇴가 완료되었습니다.');
    location.href = '../../pages/auth/login.html';
}

// Password Edit Logic
function initPasswordEdit() {
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('password-confirm');
    const passwordHelper = document.getElementById('password-helper');
    const confirmHelper = document.getElementById('password-confirm-helper');
    const submitBtn = document.getElementById('password-submit-btn');

    let isPasswordValid = false;
    let isConfirmValid = false;

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
        
        // Re-validate confirm if password changes (to match)
        if (confirmInput.value.length > 0) validateConfirm();
    }

    function validateConfirm() {
        const passwordValue = passwordInput.value;
        const confirmValue = confirmInput.value;

        if (confirmValue === '') {
            confirmHelper.innerText = '*비밀번호를 한번 더 입력해주세요';
            confirmHelper.classList.add('visible');
            isConfirmValid = false;
        } else if (passwordValue !== confirmValue) {
            confirmHelper.innerText = '*비밀번호와 다릅니다.';
            confirmHelper.classList.add('visible');
            isConfirmValid = false;
        } else {
            confirmHelper.classList.remove('visible');
            isConfirmValid = true;
        }
        updateButtonState();
    }

    function updateButtonState() {
        if (isPasswordValid && isConfirmValid) {
            submitBtn.disabled = false;
            // The active style in user.css is handled by hover mostly, 
            // but auth.css had .active. 
            // user.css submit-btn only has hover. 
            // However, requirements say "ACA0EB > 7F6AEE".
            // user.css submit-btn has background-color: #ACA0EB default.
            // I should make it visually disabled if needed, or rely on HTML 'disabled' attribute styling.
            // Let's add a style for disabled if not present in user.css, or rely on browser default (which usually isn't enough).
            // Actually, in user.css I didn't add :disabled style specifically for .submit-btn.
            // I'll assume standard behavior or add a class if I want specific color.
            // The requirement says "ACA0EB > 7F6AEE" when active.
            submitBtn.style.backgroundColor = '#7F6AEE'; 
        } else {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#ACA0EB';
        }
    }

    passwordInput.addEventListener('input', validatePassword);
    confirmInput.addEventListener('input', validateConfirm);
}

function handlePasswordUpdate(event) {
    event.preventDefault();
    showToast();
}
