// 영상 제어 및 네이버 버튼
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const video = document.querySelector('.logo-animation');
    const bgGroup = document.querySelector('.background-group');

    if (!video) return;

    function startSequence() {
        // 1. 배경 페이드인 먼저
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 2. 배경 페이드인 끝나면 (0.5초 후) 영상 재생
        setTimeout(function() {
            video.play().then(function() {
                video.classList.add('playing');
            }).catch(function(e) {
                console.log('Video play error:', e);
                video.classList.add('playing');
            });
        }, 500);
    }

    // 영상 프리로드 완료 후 시퀀스 시작
    if (video.readyState >= 3) {
        startSequence();
    } else {
        video.addEventListener('canplaythrough', startSequence, { once: true });
    }

    // 영상 끝나면 네이버 버튼 표시
    video.addEventListener('ended', function() {
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
    });
})();
