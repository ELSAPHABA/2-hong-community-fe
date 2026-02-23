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

async function initProfileEdit() {
    const nicknameInput = document.getElementById('nickname');
    // Select input that is readonly (email)
    const emailInput = document.querySelector('.user-input[readonly]');
    const profilePreview = document.getElementById('profile-preview');
    const profileUpload = document.getElementById('profile-upload');

    // Fetch Current User Info
    try {
        const response = await API.users.getMe();
        const user = response.data;
        
        if (emailInput) emailInput.value = user.email;
        if (nicknameInput) {
            nicknameInput.value = user.nickname;
            nicknameInput.dataset.original = user.nickname; // Store for dup check
        }
        if (profilePreview && user.profileImageUrl) {
            // S3 URL인지 로컬 경로인지 판단하여 이미지 표시
            if (user.profileImageUrl.startsWith('http')) {
                profilePreview.src = user.profileImageUrl;
            } else if (user.profileImageUrl.startsWith('/')) {
                profilePreview.src = `${window.BASE_URL}${user.profileImageUrl}`;
            } else {
                profilePreview.src = user.profileImageUrl;
            }
        }

    } catch (error) {
        console.error('Failed to load user info:', error);
        alert('회원 정보를 불러오지 못했습니다.');
    }

    // Image Preview
    if (profileUpload && profilePreview) {
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

async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const nicknameInput = document.getElementById('nickname');
    const helperText = document.getElementById('nickname-helper');
    const nickname = nicknameInput.value.trim();
    const originalNickname = nicknameInput.dataset.original;
    const profileUpload = document.getElementById('profile-upload');

    // Reset helper
    helperText.classList.remove('visible');

    // Validation
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

    try {
        // 1. Nickname Dup Check (if changed)
        if (nickname !== originalNickname) {
            try {
                await API.auth.checkNickname(nickname);
            } catch (error) {
                if (error.status === 409) {
                    helperText.innerText = '*중복된 닉네임 입니다.';
                    helperText.classList.add('visible');
                    return;
                }
                throw error;
            }
        }

        // 2. Image Upload (if selected)
        let profileImageUrl = null;
        if (profileUpload.files.length > 0) {
            const formData = new FormData();
            formData.append('file', profileUpload.files[0]); // Use 'file' as key
            const imgRes = await API.users.uploadProfileImage(formData);
            profileImageUrl = imgRes.data.filePath; // Use 'filePath' from Lambda response
        }

        // 3. Update Info
        const updateData = { nickname };
        if (profileImageUrl) updateData.profileImageUrl = profileImageUrl;

        await API.users.updateInfo(updateData);
        
        // Update LocalStorage
        const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_INFO) || '{}');
        currentUser.nickname = nickname;
        if (profileImageUrl) currentUser.profileImageUrl = profileImageUrl;
        localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(currentUser));

        // Update original nickname to prevent unnecessary checks
        nicknameInput.dataset.original = nickname;

        showToast();

    } catch (error) {
        console.error('Profile update failed:', error);
        alert('회원정보 수정에 실패했습니다.');
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); 
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

async function confirmWithdraw() {
    try {
        await API.users.withdraw();
        alert('회원 탈퇴가 완료되었습니다.');
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        location.href = '../../pages/auth/login.html';
    } catch (error) {
        console.error('Withdraw failed:', error);
        alert('회원 탈퇴에 실패했습니다.');
        closeWithdrawModal();
    }
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
            submitBtn.style.backgroundColor = '#7F6AEE'; 
        } else {
            submitBtn.disabled = true;
            submitBtn.style.backgroundColor = '#ACA0EB';
        }
    }

    if (passwordInput && confirmInput) {
        passwordInput.addEventListener('input', validatePassword);
        confirmInput.addEventListener('input', validateConfirm);
    }
}

async function handlePasswordUpdate(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;

    try {
        await API.users.updatePassword({
            password: password
        });
        
        showToast();
        
        // Reset inputs
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
        
        // Reset validation state
        const submitBtn = document.getElementById('password-submit-btn');
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = '#ACA0EB';

    } catch (error) {
        console.error('Password update failed:', error);
        if (error.status === 401) {
            alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
            location.href = '../../pages/auth/login.html';
        } else {
            alert('비밀번호 수정에 실패했습니다.');
        }
    }
}
