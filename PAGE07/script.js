// GOH 타이틀 영상 페이지 (A→B 루프 전환)
// A영상 재생 후 B영상 루프
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

    // 전환 플래그
    let switched = false;

    // Pre-Switch 타이밍 (종료 몇 초 전에 전환할지)
    const PRE_SWITCH_TIME = 0.05;

    // 재생 시작
    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // main-video (A) 보이기 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});

        // loop-video (B): 처음부터 재생 (CSS에서 이미 opacity: 1, main이 위에서 가림)
        loopVideo.currentTime = 0;
        loopVideo.play().catch(function() {});
    }

    // Pre-Switch: A영상 종료 직전에 B로 전환
    mainVideo.addEventListener('timeupdate', function() {
        if (switched) return;
        if (!mainVideo.duration) return;

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 종료 0.05초 전에 전환 + 1초 전에 버튼 표시
        if (remaining <= 1 && naverBtn && !naverBtn.classList.contains('visible')) {
            naverBtn.classList.add('visible');
        }

        if (remaining <= PRE_SWITCH_TIME) {
            switched = true;

            // loop-video 시작점 동기화
            loopVideo.currentTime = 0;

            // main-video만 숨기면 뒤의 loop-video가 보임
            mainVideo.style.visibility = 'hidden';
        }
    });

    // 두 영상 모두 로드 대기 후 시작
    let mainReady = mainVideo.readyState >= 3;
    let loopReady = loopVideo.readyState >= 3;

    function checkAndStart() {
        if (mainReady && loopReady) {
            startVideo();
        }
    }

    if (mainReady && loopReady) {
        startVideo();
    } else {
        mainVideo.addEventListener('canplaythrough', function() {
            mainReady = true;
            checkAndStart();
        }, { once: true });

        loopVideo.addEventListener('canplaythrough', function() {
            loopReady = true;
            checkAndStart();
        }, { once: true });
    }
})();
