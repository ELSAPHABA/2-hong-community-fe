// Common JavaScript
console.log('Common JS loaded');

document.addEventListener('DOMContentLoaded', () => {
    // Header Dropdown Logic
    const headerContainer = document.querySelector('.header-container');
    const profileIcon = document.querySelector('.profile-icon');

    if (headerContainer && profileIcon) {
        // Create Dropdown HTML
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';
        dropdown.innerHTML = `
            <a href="../../pages/user/profile_edit.html" class="dropdown-item">회원정보수정</a>
            <a href="../../pages/user/password_edit.html" class="dropdown-item">비밀번호수정</a>
            <a href="../../pages/auth/login.html" class="dropdown-item">로그아웃</a>
        `;
        
        // Append to container (header-container is relative)
        headerContainer.appendChild(dropdown);

        // Toggle Logic
        profileIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent closing immediately
            dropdown.classList.toggle('show');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !profileIcon.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }
});