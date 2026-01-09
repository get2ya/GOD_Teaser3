// 영상 제어 및 네이버 버튼
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const video = document.querySelector('.logo-animation');
    const bgGroup = document.querySelector('.background-group');

    if (!video) return;

    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        video.play().then(function() {
            video.classList.add('playing');
        }).catch(function(e) {
            console.log('Video play error:', e);
            // 자동재생 차단된 경우에도 영상 표시
            video.classList.add('playing');
        });
    }

    // 이미 로드됐으면 바로 재생
    if (video.readyState >= 3) {
        startVideo();
    } else {
        // 아직 로드 안됐으면 이벤트 대기
        video.addEventListener('canplaythrough', startVideo, { once: true });
    }

    // 영상 끝나면 네이버 버튼 표시
    video.addEventListener('ended', function() {
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
    });
})();
