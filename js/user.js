// User JavaScript

// Profile Edit Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if on profile edit page
    const profileEditForm = document.getElementById('profile-edit-form');
    if (profileEditForm) {
        initProfileEdit();
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

    // 2. Nickname Validation (Real-time or on submit? Requirement implies on Click 'Edit' button)
    // But helper text usually implies real-time or blur. I'll do it on submit as per requirement "When 'Edit' button clicked".
    
    // However, length check is usually real-time.
    // "Nickname >= 11 chars -> *Max 10 chars"
    if (nicknameInput) {
        nicknameInput.addEventListener('input', () => {
            // Basic length check could be real-time
            /*
            if (nicknameInput.value.length > 10) {
                 helperText.innerText = '*닉네임은 최대 10자 까지 작성 가능합니다.';
                 helperText.classList.add('visible');
            } else {
                 helperText.classList.remove('visible');
            }
            */
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

    // Simulate Duplicate Check (e.g., if nickname is 'duplicate')
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
    // Logic to delete user...
    alert('회원 탈퇴가 완료되었습니다.');
    // Redirect to Login
    location.href = '../../pages/auth/login.html';
}