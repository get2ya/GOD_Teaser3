// 영상 제어 및 네이버 버튼
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        mainVideo.play().then(function() {
            mainVideo.classList.add('playing');
            // 메인 영상 재생 시작하면 루프 영상도 뒤에서 미리 재생
            loopVideo.play();
        }).catch(function() {
            mainVideo.classList.add('playing');
            loopVideo.play();
        });
    }

    // 메인 영상 끝나면 opacity 스위칭 (Gemini 방식)
    mainVideo.addEventListener('ended', function() {
        // requestAnimationFrame으로 정확한 타이밍에 전환
        requestAnimationFrame(function() {
            loopVideo.classList.add('playing');  // 루프 보이기
            mainVideo.classList.remove('playing');  // 메인 숨기기

            if (naverBtn) {
                naverBtn.classList.add('visible');
            }

            // 전환 후 메인 영상 제거하여 메모리 절약
            setTimeout(function() {
                mainVideo.style.display = 'none';
            }, 500);
        });
    });

    // 이미 로드됐으면 바로 재생
    if (mainVideo.readyState >= 3) {
        startVideo();
    } else {
        mainVideo.addEventListener('canplaythrough', startVideo, { once: true });
    }
})();
