// Valen 애니메이션 페이지
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const valenVideo = document.getElementById('valen-video');
    const bgGroup = document.querySelector('.background-group');

    if (!valenVideo) return;

    // 이미지 로드 완료 후 시작
    function startSequence() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 영상 페이드인
        valenVideo.classList.add('visible');

        // 네이버 버튼 표시 (1초 후)
        setTimeout(function() {
            if (naverBtn) {
                naverBtn.classList.add('visible');
            }
        }, 1000);
    }

    // 이미지가 이미 로드되었는지 확인
    if (valenVideo.complete) {
        startSequence();
    } else {
        valenVideo.addEventListener('load', startSequence, { once: true });
    }
})();
