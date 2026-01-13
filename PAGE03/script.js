// 영상 제어 및 네이버 버튼 (Seamless Video Switch Strategy v2)
// loop-video는 처음부터 opacity: 1로 보임 (main-video가 위에서 가림)
// main-video만 숨기면 loop-video가 자연스럽게 드러남
(function() {
    const naverBtn = document.querySelector('.naver-btn');
    const mainVideo = document.getElementById('main-video');
    const loopVideo = document.getElementById('loop-video');
    const bgGroup = document.querySelector('.background-group');

    if (!mainVideo || !loopVideo) return;

    // 전환 플래그 (중복 실행 방지)
    let switched = false;

    // Pre-Switch 타이밍 (종료 몇 초 전에 전환할지)
    const PRE_SWITCH_TIME = 0.05;

    // Video A (인트로/Main) 재생 시작
    function startVideo() {
        // 배경 페이드인
        if (bgGroup) {
            bgGroup.classList.add('visible');
        }

        // main-video 보이기 + 재생
        mainVideo.classList.add('visible');
        mainVideo.play().catch(function() {});

        // loop-video: 처음부터 재생 (CSS에서 이미 opacity: 1, main이 위에서 가림)
        loopVideo.currentTime = 0;
        loopVideo.play().catch(function() {});
    }

    // Pre-Switch: 종료 직전에 미리 전환 (timeupdate 방식)
    mainVideo.addEventListener('timeupdate', function() {
        if (switched) return;
        if (!mainVideo.duration) return;

        const remaining = mainVideo.duration - mainVideo.currentTime;

        // 종료 0.05초 전에 전환 실행
        if (remaining <= PRE_SWITCH_TIME) {
            switched = true;

            // loop-video 시작점 동기화
            loopVideo.currentTime = 0;

            // main-video만 숨기면 뒤의 loop-video가 보임 (깜빡임 없음)
            mainVideo.style.visibility = 'hidden';

            // 네이버 버튼 표시
            if (naverBtn) {
                naverBtn.classList.add('visible');
            }
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
