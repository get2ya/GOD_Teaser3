// 영상 제어 및 네이버 버튼
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    let loopStarted = false;

    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});
    }

    // requestAnimationFrame으로 프레임 단위 감시
    function checkVideoTime() {
        if (!mainVideo.duration) {
            requestAnimationFrame(checkVideoTime);
            return;
        }

        const timeLeft = mainVideo.duration - mainVideo.currentTime;

        // 1. 영상 종료 0.4초 전: 뒤에 있는 루프 영상 미리 재생 (아직 안보임)
        if (timeLeft <= 0.4 && !loopStarted) {
            loopVideo.play();
            loopStarted = true;
        }

        // 2. 영상 종료 0.15초 전: 루프 페이드인 + 메인 페이드아웃 동시 시작
        if (timeLeft <= 0.15) {
            loopVideo.classList.add('visible');
            mainVideo.classList.add('fade-out');

            if (naverBtn) {
                naverBtn.classList.add('visible');
            }
            return;
        }

        requestAnimationFrame(checkVideoTime);
    }

    // 영상 재생 시작과 함께 감시 시작
    mainVideo.addEventListener('play', function() {
        requestAnimationFrame(checkVideoTime);
    });

    // 안전장치: 혹시라도 감시가 실패했을 때를 대비
    mainVideo.addEventListener('ended', function() {
        if (!loopStarted) {
            loopVideo.classList.add('visible');
            loopVideo.play();
        }
        mainVideo.classList.add('fade-out');
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
    });

    // 이미 로드됐으면 바로 재생
    if (mainVideo.readyState >= 3) {
        startVideo();
    } else {
        mainVideo.addEventListener('canplaythrough', startVideo, { once: true });
    }
})();
