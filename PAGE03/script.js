// 영상 제어 및 네이버 버튼
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo) return;

    let loopReady = false;

    // 루프 영상 미리 준비 (재생 후 일시정지)
    function prepareLoopVideo() {
        loopVideo.play().then(function() {
            loopVideo.pause();
            loopVideo.currentTime = 0;
            loopReady = true;
        }).catch(function() {
            loopReady = true;
        });
    }

    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // 루프 영상 미리 준비
        prepareLoopVideo();

        mainVideo.play().then(function() {
            mainVideo.classList.add('playing');
        }).catch(function(e) {
            mainVideo.classList.add('playing');
        });
    }

    // 메인 영상 끝나기 직전에 루프 영상 전환
    mainVideo.addEventListener('timeupdate', function() {
        // 영상 끝나기 0.05초 전에 전환
        if (mainVideo.duration - mainVideo.currentTime < 0.05 && !loopVideo.classList.contains('playing')) {
            // 루프 영상 먼저 보이게 하고
            loopVideo.classList.add('playing');
            loopVideo.play();
            // 메인 영상 숨기기
            mainVideo.classList.remove('playing');
        }
    });

    // 메인 영상 끝나면 네이버 버튼 표시
    mainVideo.addEventListener('ended', function() {
        if (naverBtn) {
            naverBtn.classList.add('visible');
        }
        mainVideo.style.display = 'none';
    });

    // 이미 로드됐으면 바로 재생
    if (mainVideo.readyState >= 3) {
        startVideo();
    } else {
        mainVideo.addEventListener('canplaythrough', startVideo, { once: true });
    }
})();
